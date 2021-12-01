mod infra;

use std::error;
use std::fmt::{self};

use infra::DirectHttpClient;
use infra::{HttpClient, HttpError};

#[macro_use]
extern crate serde;

#[derive(Debug)]
pub enum ImageAnalysisError {
    InvalidImageSize,
    InvalidImageFormat,
    UnexpectedResponseFormat(String),
    HttpError(HttpError),
}

impl fmt::Display for ImageAnalysisError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let desc = match self {
            ImageAnalysisError::InvalidImageSize => String::from("Invalid Image Size"),
            ImageAnalysisError::InvalidImageFormat => String::from("Invalid Image Format"),
            ImageAnalysisError::UnexpectedResponseFormat(response_body) => {
                format!("Unexpected response format. Response: {}", response_body)
            }
            ImageAnalysisError::HttpError(http_err) => {
                format!("Http Error: {}", http_err)
            }
        };
        f.write_str(desc.as_str())
    }
}

impl error::Error for ImageAnalysisError {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageAnalysisDescriptionCaption {
    pub text: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageAnalysisDescription {
    pub tags: Vec<String>,
    pub captions: Vec<ImageAnalysisDescriptionCaption>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageAnalysisMetadata {
    pub width: i32,
    pub height: i32,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageAnalysisResult {
    #[serde(rename(deserialize = "requestId"))]
    pub request_id: String,
    pub metadata: ImageAnalysisMetadata,
    pub description: ImageAnalysisDescription,
}

pub struct AzureImageAnalysis {
    base_uri: String,
    key: String,
}

impl AzureImageAnalysis {
    pub fn new(base_uri: &str, key: &str) -> Self {
        AzureImageAnalysis {
            base_uri: String::from(base_uri),
            key: String::from(key),
        }
    }

    pub async fn analyse(
        &self,
        image_data: Vec<u8>,
    ) -> Result<ImageAnalysisResult, ImageAnalysisError> {
        let http_client = DirectHttpClient(reqwest::Client::new());

        let response = http_client
            .post(
                format!(
                    "{}/vision/v3.0/analyze?VisualFeatures=Description",
                    self.base_uri
                )
                .as_str(),
                image_data,
                vec![
                    (
                        "content-type".to_owned(),
                        "application/octet-stream".to_owned(),
                    ),
                    ("Ocp-Apim-Subscription-Key".to_owned(), self.key.clone()),
                ],
            )
            .await;

        if let Err(http_error) = response {
            return Err(ImageAnalysisError::HttpError(http_error));
        }

        let response = response.unwrap();

        if !response.status().is_success() {}

        let response_text = response.text().await;

        if let Err(http_error) = response_text {
            return Err(ImageAnalysisError::HttpError(http_error));
        }

        let response_text = response_text.unwrap();

        let des_result = serde_json::from_str::<ImageAnalysisResult>(response_text.as_str());

        match des_result {
            Ok(result) => Ok(result),
            Err(_) => Err(ImageAnalysisError::UnexpectedResponseFormat(response_text)),
        }
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
