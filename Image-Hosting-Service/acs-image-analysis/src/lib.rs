mod data;
mod error;
mod infra;
mod internal;

pub use data::ImageAnalysis;
pub use error::ImageAnalysisError;
use infra::DirectHttpClient;
use internal::AzureImageAnalysisClientInternal;

#[macro_use]
extern crate serde;

/// A safe Azure Cognitive Services Image Analysis API client.
///
/// Used to interact with an Azure Cognitive Services instance and provides
/// access to the Image Analysis APIs.
pub struct AzureImageAnalysisClient(AzureImageAnalysisClientInternal);

impl AzureImageAnalysisClient {
    /// Instantiates a new AzureImageAnalysisClient
    /// `base_url` is the URL of the Azure Cognitive Services instance
    /// `key` is the API key to use for authentication
    pub fn new(base_uri: &str, key: &str) -> Self {
        AzureImageAnalysisClient(AzureImageAnalysisClientInternal::new(base_uri, key))
    }

    /// Analyses an image passed as a byte array.
    /// Returns the analysis result returned from Azure.
    ///
    ///  # Errors
    ///
    /// If something goes wrong, the Error will be returned. This incudes `HttpError`'s
    /// which will be wrapped in `ImageAnalysisError::HttpError`.
    pub async fn analyse(&self, image_data: Vec<u8>) -> Result<ImageAnalysis, ImageAnalysisError> {
        let http_client = DirectHttpClient(reqwest::Client::new());
        self.0.analyse(&http_client, image_data).await
    }
}
