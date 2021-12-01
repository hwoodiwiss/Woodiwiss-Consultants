use std::collections::HashMap;

use async_trait::async_trait;

use crate::error::HttpError;

pub struct StatusCode(pub u16);

impl StatusCode {
    pub fn is_success(&self) -> bool {
        self.0 >= 200 && self.0 <= 299
    }
}

pub trait Response: ResponseSync + ResponseAsync {}

pub trait ResponseSync {
    fn status(&self) -> StatusCode;
}

#[async_trait]
pub trait ResponseAsync {
    async fn text(self: Box<Self>) -> Result<String, HttpError>;
}

#[async_trait]
pub trait HttpClient {
    async fn post(
        &self,
        uri: &str,
        data: Vec<u8>,
        headers: HashMap<String, String>,
    ) -> Result<Box<dyn Response>, HttpError>;
}
