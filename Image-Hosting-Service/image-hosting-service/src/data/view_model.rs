use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSizeInfo {
    pub uri: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageViewModel {
    pub image_sizes: HashMap<String, ImageSizeInfo>,
    pub description: String,
}

#[derive(Debug, Queryable)]
pub struct ImageDbModel {
    pub id: String,
    pub image_data: String,
    pub description: String,
}
