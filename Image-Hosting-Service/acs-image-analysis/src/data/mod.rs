#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImageAnalysisDescriptionCaption {
    pub text: String,
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImageAnalysisDescription {
    pub tags: Vec<String>,
    pub captions: Vec<ImageAnalysisDescriptionCaption>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImageAnalysisMetadata {
    pub width: i32,
    pub height: i32,
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ImageAnalysis {
    #[serde(rename(deserialize = "requestId"))]
    pub request_id: String,
    pub metadata: ImageAnalysisMetadata,
    pub description: ImageAnalysisDescription,
}
