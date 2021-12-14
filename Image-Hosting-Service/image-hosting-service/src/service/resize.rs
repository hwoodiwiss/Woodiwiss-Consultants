use std::collections::HashMap;

use image::DynamicImage;

use crate::data::config::{AppConfiguration, ImageSizeConfig};

use super::ResizeService;

pub struct DynamicImageResizeService {
    image_sizes: HashMap<String, ImageSizeConfig>,
}

impl DynamicImageResizeService {
    pub fn new(image_sizes: HashMap<String, ImageSizeConfig>) -> Self {
        Self { image_sizes }
    }

    fn resize_image(image: &DynamicImage, config: &ImageSizeConfig) -> DynamicImage {
        image.resize(
            config.max_width,
            config.max_height,
            image::imageops::Triangle,
        )
    }
}

#[async_trait]
impl ResizeService for DynamicImageResizeService {
    async fn resize(&self, image: &DynamicImage) -> HashMap<String, DynamicImage> {
        let mut out_map = HashMap::new();
        for (name, config) in &self.image_sizes {
            out_map.insert(name.clone(), Self::resize_image(&image, config));
        }

        out_map
    }
}

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Setup Resize Service", |rocket| async {
        let image_sizes = {
            let config = match rocket.state::<AppConfiguration>() {
                Some(config) => config,
                None => panic!(""),
            };

            config.image_sizes.clone()
        };
        rocket
            .manage(Box::new(DynamicImageResizeService::new(image_sizes)) as Box<dyn ResizeService>)
    })
}
