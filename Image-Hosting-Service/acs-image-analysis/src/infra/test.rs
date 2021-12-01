use crate::error::HttpError;

use async_trait::async_trait;

use super::{HttpClient, Response, ResponseAsync, ResponseSync, StatusCode};

struct TestResponse<'a> {
    status_handler: Option<Box<dyn Fn(&Self) -> StatusCode + Send + Sync>>,
    text_handler: Option<Box<dyn Fn(&Self) -> Result<String, HttpError> + Send + Sync>>,
}

impl<'a> TestResponse<'a> {
    pub fn new(
        status_handler: Option<Box<dyn Fn(&Self) -> StatusCode + Send + Sync>>,
        text_handler: Option<Box<dyn Fn(&Self) -> Result<String, HttpError> + Send + Sync>>,
    ) -> Self {
        Self {
            status_handler,
            text_handler,
        }
    }
}

impl ResponseSync for TestResponse<'_> {
    fn status(&self) -> StatusCode {
        self.status_handler
            .as_ref()
            .map_or(StatusCode(200), |func| func(&self))
    }
}

#[async_trait]
impl ResponseAsync for TestResponse<'_> {
    async fn text(self: Box<Self>) -> Result<String, HttpError> {
        self.text_handler
            .as_ref()
            .map_or(Ok("test".to_owned()), |func| func(&self))
    }
}

impl Response for TestResponse<'_> {}

struct TestHttpClient<'a> {
    post_handler: Option<
        Box<
            dyn Fn(
                    &Self,
                    &str,
                    Vec<u8>,
                    Vec<(String, String)>,
                ) -> Result<Box<dyn Response>, HttpError>
                + Send
                + Sync,
        >,
    >,
}

impl<'a> TestHttpClient<'a> {
    pub fn new(
        post_handler: Option<
            Box<
                dyn Fn(
                        &Self,
                        &str,
                        Vec<u8>,
                        Vec<(String, String)>,
                    ) -> Result<Box<dyn Response>, HttpError>
                    + Send
                    + Sync,
            >,
        >,
    ) -> Self {
        Self { post_handler }
    }
}

#[async_trait]
impl HttpClient for TestHttpClient<'_> {
    async fn post(
        &self,
        uri: &str,
        data: Vec<u8>,
        headers: Vec<(String, String)>,
    ) -> Result<Box<dyn Response>, HttpError> {
        self.post_handler
            .as_ref()
            .map_or(Err(HttpError::Unknown), |func| {
                func(&self, uri, data, headers)
            })
    }
}
