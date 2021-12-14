use crate::data::config::AppConfiguration;
use crate::service::service_t::ImageAnalysisService;
use acs_image_analysis::ImageAnalysisError;

pub enum ImageAnalysisServiceError {
    FailedToDescribeImage,
    ImageAnalysisError(ImageAnalysisError),
}

pub struct AzureImageAnalysisService(acs_image_analysis::AzureImageAnalysisClient);

impl AzureImageAnalysisService {
    pub fn new(base_uri: &str, key: &str) -> Self {
        Self(acs_image_analysis::AzureImageAnalysisClient::new(
            base_uri, key,
        ))
    }
}

#[async_trait]
impl ImageAnalysisService for AzureImageAnalysisService {
    async fn get_description(
        &self,
        image_bytes: &[u8],
    ) -> Result<String, ImageAnalysisServiceError> {
        let image_analysis = self
            .0
            .analyse(Vec::from(image_bytes))
            .await
            .map_err(|err| ImageAnalysisServiceError::ImageAnalysisError(err))?;
        let mut image_captions = image_analysis.description.captions.clone();
        image_captions.sort_by(|a, b| a.confidence.partial_cmp(&b.confidence).unwrap());
        let descriptions = image_captions
            .iter()
            .map(|caption| caption.text.clone())
            .collect::<Vec<_>>();

        match descriptions.first() {
            Some(desc) => Ok(desc.clone()),
            None => Err(ImageAnalysisServiceError::FailedToDescribeImage),
        }
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
        rocket.manage(Box::new(AzureImageAnalysisService::new(
            acs_config.base_uri.as_str(),
            acs_config.key.as_str(),
        )) as Box<dyn ImageAnalysisService>)
    })
}
