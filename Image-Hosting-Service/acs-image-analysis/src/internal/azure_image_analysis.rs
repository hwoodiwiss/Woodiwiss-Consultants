use std::collections::HashMap;

use crate::data::ImageAnalysis;
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
    ) -> Result<ImageAnalysis, ImageAnalysisError> {
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

        let des_result = serde_json::from_str::<ImageAnalysis>(response_text.as_str());

        match des_result {
            Ok(result) => Ok(result),
            Err(_) => Err(ImageAnalysisError::UnexpectedResponseFormat(response_text)),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::infra::{TestHttpClient, TestResponse};

    use super::AzureImageAnalysisClientInternal;

    #[tokio::test]
    async fn sets_api_key_header() {
        const EXPECTED_KEY: &str = "123456Secret";
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, headers| {
            assert!(headers.contains_key("Ocp-Apim-Subscription-Key"));
            let actual_key = headers
                .get("Ocp-Apim-Subscription-Key")
                .expect("No API key header set");
            assert_eq!(EXPECTED_KEY, actual_key);
            Ok(Box::new(TestResponse::new(None, None)))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", EXPECTED_KEY);
        let _ = analyser.analyse(&test_client, vec![0; 0]).await;
    }

    #[tokio::test]
    async fn sets_content_type_header() {
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, headers| {
            assert!(headers.contains_key("content-type"));
            let content_type = headers.get("content-type").expect("No API key header set");
            assert_eq!("application/octet-stream", content_type);
            Ok(Box::new(TestResponse::new(None, None)))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let _ = analyser.analyse(&test_client, vec![0; 0]).await;
    }
}
