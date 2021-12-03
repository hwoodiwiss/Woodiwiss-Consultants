use std::collections::HashMap;

use rocket::serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CorsConfiguration {
    pub allow_all: bool,
    pub allowed_origins: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AzureCognitiveServicesConfig {
    pub base_uri: String,
    pub key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageSizeConfig {
    pub max_width: u32,
    pub max_height: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApplicationConfig {
    pub max_file_size: u32,
    pub allowed_formats: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfiguration {
    pub image_sizes: HashMap<String, ImageSizeConfig>,
    pub azure_cognitive_services: AzureCognitiveServicesConfig,
    pub cors: CorsConfiguration,
}
