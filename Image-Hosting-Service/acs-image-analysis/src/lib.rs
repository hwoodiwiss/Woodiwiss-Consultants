mod data;
mod error;
mod infra;
mod internal;

use data::ImageAnalysisResult;
use error::ImageAnalysisError;
use infra::DirectHttpClient;
use internal::AzureImageAnalysisClientInternal;

#[macro_use]
extern crate serde;

pub struct AzureImageAnalysisClient(AzureImageAnalysisClientInternal);

impl AzureImageAnalysisClient {
    pub fn new(base_uri: &str, key: &str) -> Self {
        AzureImageAnalysisClient(AzureImageAnalysisClientInternal::new(base_uri, key))
    }

    pub async fn analyse(
        &self,
        image_data: Vec<u8>,
    ) -> Result<ImageAnalysisResult, ImageAnalysisError> {
        let http_client = DirectHttpClient(reqwest::Client::new());
        self.0.analyse(&http_client, image_data).await
    }
}
