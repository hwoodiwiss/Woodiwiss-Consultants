use image::{DynamicImage, ImageFormat};
use rocket::{
    data::{FromData, Outcome, ToByteUnit},
    http::Status,
    Data, Request,
};

use crate::data::config::AppConfiguration;

fn load_dynamic_image_for_bytes(
    bytes: &[u8],
    allowed_formats: &Vec<String>,
) -> Result<DynamicImage, ()> {
    let image_format = image::guess_format(bytes).map_err(|_| ())?;
    if !allowed_formats
        .iter()
        .map(|val| ImageFormat::from_extension(val))
        .collect::<Vec<Option<ImageFormat>>>()
        .contains(&Some(image_format))
    {
        return Err(());
    }
    Ok(image::load_from_memory(bytes).map_err(|_| ())?)
}

pub struct RequestImage {
    pub bytes: Vec<u8>,
    pub as_image: image::DynamicImage,
}

#[rocket::async_trait]
impl<'r> FromData<'r> for RequestImage {
    type Error = &'r str;
    async fn from_data(req: &'r Request<'_>, data: Data<'r>) -> Outcome<'r, Self> {
        let app_config = req
            .rocket()
            .state::<AppConfiguration>()
            .expect("Application Misconfigured");

        let body_data = data
            .open(app_config.app_limits.max_file_size.bytes())
            .into_bytes()
            .await
            .expect("");

        if !body_data.n.complete {
            return Outcome::Failure((Status::BadRequest, "Provided image was too large"));
        };

        let image_bytes = body_data.value;
        let loaded_image =
            load_dynamic_image_for_bytes(&image_bytes[..], &app_config.app_limits.allowed_formats);
        if loaded_image.is_err() {
            return Outcome::Failure((Status::BadRequest, "Provided image was incorrect format"));
        };

        let loaded_image = loaded_image.unwrap();

        Outcome::Success(RequestImage {
            bytes: image_bytes,
            as_image: loaded_image,
        })
    }
}
