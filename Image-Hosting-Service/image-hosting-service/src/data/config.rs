use std::collections::HashMap;

use rocket::serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorsConfiguration {
    pub allow_all: bool,
    pub allowed_origins: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureCognitiveServicesConfig {
    pub base_uri: String,
    pub key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AzureStorageBlobConfig {
    pub account_key: String,
    pub account_name: String,
    pub container_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSizeConfig {
    pub max_width: u32,
    pub max_height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApplicationLimits {
    pub allowed_formats: Vec<String>,
    pub max_file_size: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfiguration {
    pub image_sizes: HashMap<String, ImageSizeConfig>,
    pub azure_cognitive_services: AzureCognitiveServicesConfig,
    pub cors: CorsConfiguration,
    pub app_limits: ApplicationLimits,
    pub storage_base: Option<String>,
    pub azure_storage: Option<AzureStorageBlobConfig>,
}
