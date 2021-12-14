use std::collections::HashMap;

use image::DynamicImage;
#[cfg(test)]
use mockall::automock;

use crate::data::image::ImageSizeInfo;

use super::{image_analysis::ImageAnalysisServiceError, storage_provider::StorageProviderError};

#[cfg_attr(test, automock)]
#[async_trait]
pub trait ImageAnalysisService: Send + Sync {
    async fn get_description(
        &self,
        image_bytes: &[u8],
    ) -> Result<String, ImageAnalysisServiceError>;
}

#[cfg_attr(test, automock)]
#[async_trait]
pub trait ResizeService: Send + Sync {
    async fn resize(&self, image: &DynamicImage) -> HashMap<String, DynamicImage>;
}

#[cfg_attr(test, automock)]
pub trait StorageProvider: Send + Sync {
    fn save_image(
        &self,
        id: String,
        size: String,
        image: &image::DynamicImage,
        file_type: image::ImageFormat,
    ) -> Result<ImageSizeInfo, StorageProviderError>;
}
