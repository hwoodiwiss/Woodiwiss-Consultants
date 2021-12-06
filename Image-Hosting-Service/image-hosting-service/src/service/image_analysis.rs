use acs_image_analysis::ImageAnalysisError;

use crate::data::config::AppConfiguration;

pub struct ImageAnalysisService(acs_image_analysis::AzureImageAnalysisClient);

impl ImageAnalysisService {
    pub fn new(base_uri: &str, key: &str) -> Self {
        Self(acs_image_analysis::AzureImageAnalysisClient::new(
            base_uri, key,
        ))
    }

    pub async fn get_description(&self, image_bytes: &[u8]) -> Result<String, ImageAnalysisError> {
        let image_analysis = self.0.analyse(Vec::from(image_bytes)).await?;
        let mut image_captions = image_analysis.description.captions.clone();
        image_captions.sort_by(|a, b| a.confidence.partial_cmp(&b.confidence).unwrap());
        let descriptions = image_captions
            .iter()
            .map(|caption| caption.text.clone())
            .collect::<Vec<_>>();
        let err_msg = String::from("Image analysis failed for an unknown reason");
        Ok(descriptions.first().unwrap_or(&err_msg).clone())
    }
}

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Setup Image Analysis Service", |rocket| async {
        let acs_config = {
            let config = match rocket.state::<AppConfiguration>() {
                Some(config) => config,
                None => panic!(""),
            };

            config.azure_cognitive_services.clone()
        };
        rocket.manage(ImageAnalysisService::new(
            acs_config.base_uri.as_str(),
            acs_config.key.as_str(),
        ))
    })
}
