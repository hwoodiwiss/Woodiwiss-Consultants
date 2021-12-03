use std::error;

use acs_image_analysis::{ImageAnalysis, ImageAnalysisError};
use image::DynamicImage;

/// ImageAnalysisService trait will  be implemented by a thin wrapper
/// Using a trait for testability purposes
#[rocket::async_trait]
pub trait ImageAnalysisService {
    async fn analyse(image_data: Vec<u8>) -> Result<ImageAnalysis, ImageAnalysisError>;
}

pub trait ImageResizeService {
    fn resize(image: &DynamicImage) -> Result<DynamicImage, Box<dyn error::Error>>;
}
