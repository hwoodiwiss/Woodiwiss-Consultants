#[cfg(test)]
use mockall::automock;

use super::image_analysis::ImageAnalysisServiceError;

#[cfg_attr(test, automock)]
#[async_trait]
pub trait ImageAnalysisService: Send + Sync {
    async fn get_description(
        &self,
        image_bytes: &[u8],
    ) -> Result<String, ImageAnalysisServiceError>;
}
