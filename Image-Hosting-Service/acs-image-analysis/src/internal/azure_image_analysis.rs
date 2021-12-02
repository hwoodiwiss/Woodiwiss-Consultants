use std::collections::HashMap;

use serde::Deserialize;

use crate::data::ImageAnalysis;
use crate::error::{ImageAnalysisError, RequestError};
use crate::infra::{
    HttpClient, StatusCode, BAD_REQUEST, INTERNAL_SERVER_ERROR, SERVICE_UNAVAILABLE,
};

pub struct AzureImageAnalysisClientInternal {
    base_uri: String,
    key: String,
}

fn deserialize_response_body<'a, T: Deserialize<'a>>(
    str: &'a str,
) -> Result<T, ImageAnalysisError> {
    serde_json::from_str(str)
        .map_err(|_err| ImageAnalysisError::UnexpectedResponseFormat(str.to_owned()))
}

fn map_error_for_non_success(
    status_code: StatusCode,
    response_body: &String,
) -> Result<ImageAnalysisError, ImageAnalysisError> {
    match status_code {
        BAD_REQUEST => {
            let error_info: RequestError = deserialize_response_body(&response_body)?;
            Ok(error_info.error.inner_error.map_or(
                ImageAnalysisError::UnexpectedResponseFormat(response_body.clone()),
                |val| match val.code.as_str() {
                    "InvalidImageFormat" => ImageAnalysisError::InvalidImageFormat,
                    _ => ImageAnalysisError::UnexpectedResponseFormat(response_body.clone()),
                },
            ))
        }
        INTERNAL_SERVER_ERROR | SERVICE_UNAVAILABLE => Ok(ImageAnalysisError::ServiceError),
        _ => Ok(ImageAnalysisError::UnexpectedResponseCode(status_code.0)),
    }
}

impl AzureImageAnalysisClientInternal {
    pub(crate) fn new(base_uri: &str, key: &str) -> Self {
        AzureImageAnalysisClientInternal {
            base_uri: String::from(base_uri),
            key: String::from(key),
        }
    }

    pub async fn analyse<TClient: HttpClient>(
        &self,
        http_client: &TClient,
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
            .await
            .map_err(|err| ImageAnalysisError::HttpError(err))?;

        if !response.status().is_success() {
            let status_code = response.status();
            let response_text = response
                .text()
                .await
                .map_err(|err| ImageAnalysisError::HttpError(err))?;
            Err(map_error_for_non_success(status_code, &response_text)?)
        } else {
            let response_text = response
                .text()
                .await
                .map_err(|err| ImageAnalysisError::HttpError(err))?;
            Ok(deserialize_response_body(response_text.as_str())?)
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        data::{
            ImageAnalysis, ImageAnalysisDescription, ImageAnalysisDescriptionCaption,
            ImageAnalysisMetadata,
        },
        error::{HttpError, ImageAnalysisError},
        infra::{StatusCode, TestHttpClient, TestResponse},
    };

    use super::AzureImageAnalysisClientInternal;

    #[tokio::test]
    async fn sets_api_key_header() {
        const EXPECTED_KEY: &str = "123456Secret";
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, headers| {
            assert!(
                headers.contains_key("Ocp-Apim-Subscription-Key"),
                "No key header was found"
            );
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
            assert!(
                headers.contains_key("content-type"),
                "No content-type header was found"
            );
            let content_type = headers.get("content-type").expect("No API key header set");
            assert_eq!("application/octet-stream", content_type);
            Ok(Box::new(TestResponse::new(None, None)))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let _ = analyser.analyse(&test_client, vec![0; 0]).await;
    }

    #[tokio::test]
    async fn calls_correct_image_analysis_endpoint() {
        const EXPECTED_BASE_URI: &str = "https://a-cog-svc.cognitiveservices.azure.com";
        let test_client = TestHttpClient::new(Some(Box::new(|_client, uri, _data, _headers| {
            let expected_endpoint = &format!("{}/vision/v3.0/analyze?", EXPECTED_BASE_URI);
            assert!(
                uri.starts_with(expected_endpoint),
                "Uri did not start with the expected pattern. Uri: {}",
                uri
            );

            Ok(Box::new(TestResponse::new(None, None)))
        })));

        let analyser = AzureImageAnalysisClientInternal::new(EXPECTED_BASE_URI, "test");
        let _ = analyser.analyse(&test_client, vec![0; 0]).await;
    }

    #[tokio::test]
    async fn propagates_http_errors() {
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Err(HttpError::Unknown)
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(ImageAnalysisError::HttpError(HttpError::Unknown), err)
    }

    #[tokio::test]
    async fn safely_handles_internal_server_error() {
        const EXPECTED_STATUS: u16 = 500;
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                None,
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(ImageAnalysisError::ServiceError, err);
    }

    #[tokio::test]
    async fn safely_handles_service_unavailable() {
        const EXPECTED_STATUS: u16 = 503;
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                None,
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(ImageAnalysisError::ServiceError, err);
    }

    #[tokio::test]
    async fn safely_handles_unexpected_response_code() {
        const EXPECTED_STATUS: u16 = 420;
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                None,
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(
            ImageAnalysisError::UnexpectedResponseCode(EXPECTED_STATUS),
            err
        );
    }

    #[tokio::test]
    async fn safely_handles_bad_request_image_format() {
        const EXPECTED_STATUS: u16 = 400;
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                Some(Box::new(|_response| {
                    Ok(include_str!("../../test/invalid_image_format.json").to_owned())
                })),
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(ImageAnalysisError::InvalidImageFormat, err);
    }

    #[tokio::test]
    async fn safely_handles_bad_request_with_unexpected_body() {
        const EXPECTED_STATUS: u16 = 400;
        const UNEXPECTED_RESPONSE: &str = "\u{1f600}";
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                Some(Box::new(|_response| Ok(UNEXPECTED_RESPONSE.to_owned()))),
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(
            ImageAnalysisError::UnexpectedResponseFormat(UNEXPECTED_RESPONSE.to_owned()),
            err
        );
    }

    #[tokio::test]
    async fn safely_handles_ok_with_unexpected_body() {
        const EXPECTED_STATUS: u16 = 200;
        const UNEXPECTED_RESPONSE: &str = "\u{1f600}";
        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                Some(Box::new(|_response| Ok(UNEXPECTED_RESPONSE.to_owned()))),
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_err(), "Result was Ok, expected Error");
        let err = result.unwrap_err();
        assert_eq!(
            ImageAnalysisError::UnexpectedResponseFormat(UNEXPECTED_RESPONSE.to_owned()),
            err
        );
    }

    #[tokio::test]
    async fn returns_image_analysis_if_successful() {
        const EXPECTED_STATUS: u16 = 200;

        let expected_response = ImageAnalysis {
            request_id: String::from("8945a17b-2064-463b-8255-848875f0b2a3"),
            metadata: ImageAnalysisMetadata {
                width: 3000,
                height: 1500,
                format: String::from("Jpeg"),
            },
            description: ImageAnalysisDescription {
                tags: vec![String::from("computer"), String::from("table")],
                captions: vec![ImageAnalysisDescriptionCaption {
                    text: String::from("a screenshot of a computer"),
                    confidence: 0.5741573228533609f64,
                }],
            },
        };

        let test_client = TestHttpClient::new(Some(Box::new(|_client, _uri, _data, _headers| {
            Ok(Box::new(TestResponse::new(
                Some(Box::new(|_response| StatusCode(EXPECTED_STATUS))),
                Some(Box::new(|_response| {
                    Ok(include_str!("../../test/image_description_response.json").to_owned())
                })),
            )))
        })));

        let analyser = AzureImageAnalysisClientInternal::new("test", "test");
        let result = analyser.analyse(&test_client, vec![0; 0]).await;
        assert!(result.is_ok(), "Result was Error, expected Ok");
        let image_analysis = result.unwrap();
        assert_eq!(expected_response, image_analysis);
    }
}
