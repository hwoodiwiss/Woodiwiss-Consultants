use std::{error, fmt};

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct RequestErrorDetails {
    pub(crate) code: String,
    pub(crate) message: String,
    #[serde(rename(deserialize = "innererror"))]
    pub(crate) inner_error: Option<Box<RequestErrorDetails>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub(crate) struct RequestError {
    pub(crate) error: RequestErrorDetails,
}

#[derive(Debug, PartialEq)]
pub enum ImageAnalysisError {
    InvalidImageFormat,
    UnexpectedResponseCode(u16),
    UnexpectedResponseFormat(String),
    HttpError(HttpError),
    ServiceError,
}

impl fmt::Display for ImageAnalysisError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let desc = match self {
            ImageAnalysisError::InvalidImageFormat => String::from("Invalid Image Format"),
            ImageAnalysisError::UnexpectedResponseFormat(response_body) => {
                format!("Unexpected response format. Response: {}", response_body)
            }
            ImageAnalysisError::HttpError(http_err) => {
                format!("Http Error: {}", http_err)
            }
            ImageAnalysisError::UnexpectedResponseCode(response_code) => {
                format!("Unexpected response code. Status: {}", response_code)
            }
            ImageAnalysisError::ServiceError => String::from("A Service Error Occurred"),
        };
        f.write_str(desc.as_str())
    }
}

impl error::Error for ImageAnalysisError {}

#[derive(Debug, PartialEq)]
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
