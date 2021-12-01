use async_trait::async_trait;
use std::fmt;

#[derive(Debug)]
pub enum HttpError {
    Timeout,
    TooManyRedirects,
    NetworkError,
    DecodingError,
    Unknown,
}

impl fmt::Display for HttpError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let desc = match self {
            HttpError::Timeout => "Connection Timed Out".to_owned(),
            HttpError::TooManyRedirects => "To Many Redirects".to_owned(),
            HttpError::NetworkError => "Network Error".to_owned(),
            HttpError::DecodingError => "Decoding Error".to_owned(),
            HttpError::Unknown => "Unknown Http Error Ocurred".to_owned(),
        };

        f.write_str(desc.as_str())
    }
}

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
        headers: Vec<(String, String)>,
    ) -> Result<Box<dyn Response>, HttpError>;
}
