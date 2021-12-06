use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSizeInfo {
    uri: String,
    width: u32,
    height: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageResponse(pub HashMap<String, ImageSizeInfo>);
