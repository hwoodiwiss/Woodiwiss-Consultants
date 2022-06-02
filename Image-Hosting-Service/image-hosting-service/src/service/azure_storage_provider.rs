use azure_storage::core::prelude::*;
use azure_storage_blobs::prelude::*;
use std::{
    fs,
    io::{self, Cursor},
    path::Path,
    sync::Arc,
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

pub struct AzureBlobStorageProvider {
    storage_client: Arc<StorageAccountClient>,
    container_name: String,
}

impl AzureBlobStorageProvider {
    pub fn new(connection_string: String, container_name: String) -> Self {
        let http_client = azure_core::new_http_client();
        let storage_client =
            StorageAccountClient::new_connection_string(http_client, connection_string.as_str())
                .expect("Failed to connect to storage account!");

        Self {
            storage_client,
            container_name,
        }
    }
}

impl StorageProvider for AzureBlobStorageProvider {
    fn save_image(
        &self,
        id: String,
        size: String,
        image: &image::DynamicImage,
        file_type: image::ImageFormat,
    ) -> Result<ImageSizeInfo, StorageProviderError> {
        let extension_str = file_type.extensions_str()[0];
        let image_path = format!("{}", id);
        let image_uri = format!("{}/{}.{}", image_path, size, extension_str);
        let container = self
            .storage_client
            .as_container_client(&self.container_name);
        let mut blob = container.as_blob_client(image_uri);
        let mut stream = blob.get().stream(1024 * 8);
        let mut buf = Cursor::new(Vec::new());
        image
            .write_to(&mut stream, file_type)
            .map_err(|err| map_image_error_to_storage_error(&err))?;

        buf.set_position(0);
        buf.into_inner()
            .into_iter()
            .for_each(|byte| blob.put_block(block_id, body));
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
            azure_storage_config.connection_string,
            azure_storage_config.container_name,
        )) as Box<dyn StorageProvider>)
    })
}
