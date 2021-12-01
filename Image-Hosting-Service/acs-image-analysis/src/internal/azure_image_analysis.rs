use crate::data::ImageAnalysisResult;
use crate::error::ImageAnalysisError;
use crate::infra::HttpClient;

pub struct AzureImageAnalysisClientInternal {
    base_uri: String,
    key: String,
}

impl AzureImageAnalysisClientInternal {
    pub(crate) fn new(base_uri: &str, key: &str) -> Self {
        AzureImageAnalysisClientInternal {
            base_uri: String::from(base_uri),
            key: String::from(key),
        }
    }

    pub async fn analyse(
        &self,
        http_client: &dyn HttpClient,
        image_data: Vec<u8>,
    ) -> Result<ImageAnalysisResult, ImageAnalysisError> {
        let response = http_client
            .post(
                format!(
                    "{}/vision/v3.0/analyze?VisualFeatures=Description",
                    self.base_uri
                )
                .as_str(),
                image_data,
                HashMap::from_iter([
                    (
                        "content-type".to_owned(),
                        "application/octet-stream".to_owned(),
                    ),
                    ("Ocp-Apim-Subscription-Key".to_owned(), self.key.clone()),
                ]),
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
