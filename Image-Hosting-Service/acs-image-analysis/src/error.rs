use std::{error, fmt};

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
