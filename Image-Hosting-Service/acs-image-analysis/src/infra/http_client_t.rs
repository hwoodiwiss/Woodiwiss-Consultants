use std::collections::HashMap;

use async_trait::async_trait;

use crate::error::HttpError;

#[cfg(test)]
use mockall::{self, mock};

#[derive(PartialEq, Eq)]
pub struct StatusCode(pub u16);
pub const BAD_REQUEST: StatusCode = StatusCode(400);
pub const INTERNAL_SERVER_ERROR: StatusCode = StatusCode(500);
pub const SERVICE_UNAVAILABLE: StatusCode = StatusCode(503);

impl StatusCode {
    pub fn is_success(&self) -> bool {
        self.0 >= 200 && self.0 <= 299
    }
}

pub trait Response: ResponseSync + ResponseAsync + Send + Sync {}

pub trait ResponseSync {
    fn status(&self) -> StatusCode;
}

#[async_trait]
pub trait ResponseAsync {
    async fn text(self: Box<Self>) -> Result<String, HttpError>;
}

#[cfg(test)]
mock! {
    #[derive(Debug)]
    pub HttpResponse {}

    impl Response for HttpResponse {
    }

    impl ResponseSync for HttpResponse {
        fn status(&self) -> StatusCode;
    }

    #[async_trait]
    impl ResponseAsync for HttpResponse {
        async fn text(self: Box<Self>) -> Result<String, HttpError>;
    }
}

#[cfg(test)]
impl MockHttpResponse {
    pub fn default_assertions(status: bool, text: bool) -> MockHttpResponse {
        let mut mock_response = MockHttpResponse::default();
        if status {
            mock_response
                .expect_status()
                .returning(|| StatusCode(200u16));
        }
        if text {
            mock_response
                .expect_text()
                .returning(|| Ok(String::from("test")));
        }
        mock_response
    }
}

#[cfg_attr(test, mockall::automock)]
#[async_trait]
pub trait HttpClient {
    async fn post(
        &self,
        uri: &str,
        data: Vec<u8>,
        headers: HashMap<String, String>,
    ) -> Result<Box<dyn Response>, HttpError>;
}
