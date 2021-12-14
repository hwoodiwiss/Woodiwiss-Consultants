use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[cfg_attr(test, derive(PartialEq))]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSizeInfo {
    pub uri: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageResponse {
    pub id: String,
    pub image_sizes: HashMap<String, ImageSizeInfo>,
    pub description: String,
}
