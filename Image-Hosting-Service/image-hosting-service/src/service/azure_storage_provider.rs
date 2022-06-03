use azure_core::ClientOptions;
use azure_storage::storage_shared_key_credential::StorageSharedKeyCredential;
use azure_storage_datalake::clients::DataLakeClient;
use std::{
    error::Error,
    io::{self, Cursor},
};

use image::{GenericImageView, ImageError};

use crate::data::{config::AppConfiguration, image::ImageSizeInfo};

use super::{StorageProvider, StorageProviderError};

fn map_image_error_to_storage_error(err: &ImageError) -> StorageProviderError {
    match err {
        ImageError::Decoding(_) => StorageProviderError::ImageError,
        ImageError::Encoding(_) => StorageProviderError::ImageError,
        ImageError::Parameter(_) => StorageProviderError::ImageError,
        ImageError::Limits(_) => StorageProviderError::ImageError,
        ImageError::Unsupported(_) => StorageProviderError::ImageError,
        ImageError::IoError(io_err) => map_io_error_to_storage_error(io_err),
    }
}

fn map_io_error_to_storage_error(err: &io::Error) -> StorageProviderError {
    match err.kind() {
        io::ErrorKind::NotFound => StorageProviderError::FileNotFound,
        io::ErrorKind::PermissionDenied => StorageProviderError::InsufficientPermissions,
        io::ErrorKind::TimedOut => StorageProviderError::TimedOut,
        io::ErrorKind::OutOfMemory => StorageProviderError::OutOfMemory,
        io::ErrorKind::Other => StorageProviderError::Unknown,
        _ => StorageProviderError::Unknown,
    }
}

struct AzureBlobStorageProvider {
    account_name: String,
    account_key: String,
    container_name: String,
}

impl AzureBlobStorageProvider {
    pub fn new(account_name: &str, account_key: &str, container_name: String) -> Self {
        Self {
            account_name: account_name.into(),
            account_key: account_key.into(),
            container_name,
        }
    }

    async fn create_data_lake_client(
        account_name: &str,
        account_key: &str,
    ) -> Result<DataLakeClient, Box<dyn Error + Send + Sync>> {
        Ok(DataLakeClient::new_with_shared_key(
            StorageSharedKeyCredential {
                account_key: account_key.into(),
                account_name: account_name.into(),
            },
            None,
            ClientOptions::default(),
        ))
    }
}

#[async_trait]
impl StorageProvider for AzureBlobStorageProvider {
    async fn save_image(
        &self,
        id: String,
        size: String,
        image: &image::DynamicImage,
        file_type: image::ImageFormat,
    ) -> Result<ImageSizeInfo, StorageProviderError> {
        let storage_client = Self::create_data_lake_client(&self.account_name, &self.account_key)
            .await
            .expect("Failed to create Data Lake client");
        let fs_client = storage_client.into_file_system_client(&self.container_name);
        let extension_str = file_type.extensions_str()[0];
        let image_path = format!("{}/{}.{}", id, size, extension_str);

        let file_client = fs_client.get_file_client(&image_path);

        file_client
            .create_if_not_exists()
            .into_future()
            .await
            .expect(&format!("Failed to create file: {}!", image_path));

        let mut buf = Cursor::new(Vec::new());
        image
            .write_to(&mut buf, file_type)
            .map_err(|err| map_image_error_to_storage_error(&err))?;
        let buf = buf.into_inner();
        let buf_len = buf.len() as i64;
        println!("Uploading image {}", image_path);
        file_client
            .append(0, buf)
            .into_future()
            .await
            .expect(&format!("Failed to begin file upload: {}!", image_path));

        file_client
            .flush(buf_len)
            .into_future()
            .await
            .expect(&format!("Failed to upload file data: {}!", image_path));

        let image_dimensions = image.dimensions();
        Ok(ImageSizeInfo {
            uri: format!("/image/{}/{}", id, size),
            width: image_dimensions.0,
            height: image_dimensions.1,
        })
    }
}

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Setup Azure Storage Blob Provider", |rocket| async {
        let azure_storage_config = {
            let config = match rocket.state::<AppConfiguration>() {
                Some(config) => config,
                None => panic!(""),
            };

            config
                .azure_storage
                .as_ref()
                .expect("Azure Storage Blob configuration not found!")
                .clone()
        };

        rocket.manage(Box::new(AzureBlobStorageProvider::new(
            &azure_storage_config.account_name,
            &azure_storage_config.account_key,
            azure_storage_config.container_name,
        )) as Box<dyn StorageProvider>)
    })
}
