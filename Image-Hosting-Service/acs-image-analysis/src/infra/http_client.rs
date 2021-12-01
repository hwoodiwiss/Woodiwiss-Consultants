use super::{
    http_client_t::{HttpClient, HttpError, Response, ResponseAsync, ResponseSync},
    StatusCode,
};
use async_trait::async_trait;

pub struct ReqwestResponse(reqwest::Response);

fn map_reqwest_err(error: reqwest::Error) -> HttpError {
    if error.is_timeout() {
        HttpError::Timeout
    } else if error.is_connect() {
        HttpError::NetworkError
    } else if error.is_redirect() {
        HttpError::TooManyRedirects
    } else {
        HttpError::Unknown
    }
}

impl Response for ReqwestResponse {}

impl ResponseSync for ReqwestResponse {
    fn status(&self) -> StatusCode {
        StatusCode(self.0.status().into())
    }
}

#[async_trait]
impl ResponseAsync for ReqwestResponse {
    async fn text(self: Box<Self>) -> Result<String, HttpError> {
        let text_result = self.0.text().await;
        text_result.map_err(|err| map_reqwest_err(err))
    }
}

pub struct ReqwestHttpClient(pub reqwest::Client);

#[async_trait]
impl HttpClient for ReqwestHttpClient {
    async fn post(
        &self,
        uri: &str,
        data: Vec<u8>,
        headers: Vec<(String, String)>,
    ) -> Result<Box<dyn Response>, HttpError> {
        let http_client = reqwest::Client::new();
        let mut request = http_client.post(uri).body(data);
        for header in headers.into_iter() {
            request = request.header(header.0, header.1);
        }
        let response = request.send().await;

        match response {
            Ok(resp) => Ok(Box::new(ReqwestResponse(resp))),
            Err(err) => Err(map_reqwest_err(err)),
        }
    }
}
