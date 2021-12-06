use std::{fs, io, path::Path};

use image::{GenericImageView, ImageError};

use crate::data::{config::AppConfiguration, image::ImageSizeInfo};

pub enum StorageProviderError {
    ImageError,
    InsufficientPermissions,
    FileNotFound,
    TimedOut,
    OutOfMemory,
    Unknown,
}

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

pub struct StorageProvider {
    storage_base: String,
}

impl StorageProvider {
    pub fn new(storage_base: String) -> Self {
        Self { storage_base }
    }

    pub fn save_image(
        &self,
        id: String,
        size: String,
        image: &image::DynamicImage,
    ) -> Result<ImageSizeInfo, StorageProviderError> {
        let image_folder = format!("{}/{}", self.storage_base, id);
        fs::create_dir_all(&image_folder).map_err(|err| map_io_error_to_storage_error(&err))?;
        let image_uri = format!("{}/{}.jpg", image_folder, size);
        image
            .save_with_format(image_uri, image::ImageFormat::Jpeg)
            .map_err(|err| map_image_error_to_storage_error(&err))?;
        let image_dimensions = image.dimensions();
        Ok(ImageSizeInfo {
            uri: format!("image/{}/{}.jpg", id, size),
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

            config.storage_base.clone()
        };
        let provider_base = Path::new(storage_base.as_str());
        if !provider_base.exists() {
            fs::create_dir_all(provider_base).expect("Failed to create image base path. Check you have permissions to read and write there.")
        }

        rocket.manage(StorageProvider::new(storage_base))
    })
}
