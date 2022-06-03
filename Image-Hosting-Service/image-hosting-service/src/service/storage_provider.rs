use std::{fs, io, path::Path};

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

struct LocalStorageProvider {
    storage_base: String,
}

impl LocalStorageProvider {
    pub fn new(storage_base: String) -> Self {
        Self { storage_base }
    }
}

#[async_trait]
impl StorageProvider for LocalStorageProvider {
    async fn save_image(
        &self,
        id: String,
        size: String,
        image: &image::DynamicImage,
        file_type: image::ImageFormat,
    ) -> Result<ImageSizeInfo, StorageProviderError> {
        let extension_str = file_type.extensions_str()[0];
        let image_folder = format!("{}/{}", self.storage_base, id);
        fs::create_dir_all(&image_folder).map_err(|err| map_io_error_to_storage_error(&err))?;
        let image_uri = format!("{}/{}.{}", image_folder, size, extension_str);
        image
            .save_with_format(image_uri, file_type)
            .map_err(|err| map_image_error_to_storage_error(&err))?;
        let image_dimensions = image.dimensions();
        Ok(ImageSizeInfo {
            uri: format!("/image/{}/{}", id, size),
            width: image_dimensions.0,
            height: image_dimensions.1,
        })
    }
}

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Setup Storage Provider", |rocket| async {
        let storage_base = {
            let config = match rocket.state::<AppConfiguration>() {
                Some(config) => config,
                None => panic!(""),
            };

            config
                .storage_base
                .as_ref()
                .expect("Storage Base Directory not configured!")
                .clone()
        };
        let provider_base = Path::new(storage_base.as_str());
        if !provider_base.exists() {
            fs::create_dir_all(provider_base).expect("Failed to create image base path. Check you have permissions to read and write there.")
        }

        rocket.manage(Box::new(LocalStorageProvider::new(storage_base)) as Box<dyn StorageProvider>)
    })
}
