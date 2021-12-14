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
) -> Result<(DynamicImage, ImageFormat), ()> {
    let image_format = image::guess_format(bytes).map_err(|_| ())?;
    if !allowed_formats
        .iter()
        .map(|val| ImageFormat::from_extension(val))
        .collect::<Vec<Option<ImageFormat>>>()
        .contains(&Some(image_format))
    {
        return Err(());
    }
    Ok((
        image::load_from_memory(bytes).map_err(|_| ())?,
        image_format,
    ))
}

/// Stores image request data from request body
///
/// `bytes`: The raw byte representation of the image
///
/// `as_image`: The `image::DynamicImage` representation
///  of the image for image processing
///
/// `image_format`: The `image::ImageFormat` of the image
pub struct RequestImage {
    pub bytes: Vec<u8>,
    pub as_image: image::DynamicImage,
    pub image_format: image::ImageFormat,
}

#[rocket::async_trait]
impl<'r> FromData<'r> for RequestImage {
    type Error = &'r str;

    /// Parses an image file from the users request body, limited to
    /// a configurable number of bytes
    ///  
    /// ## Failures
    /// - Fails if AppConfiguration cannot be found in the managed state
    /// - Fails if data cannot be read from the body
    /// - If after reading n bytes of body data where n is the configured
    /// size limit, the body has not been completely read
    /// - If the image is not in a format configured to be allowed
    /// - If the image fails to parse into an `image::DynamicImage`
    async fn from_data(req: &'r Request<'_>, data: Data<'r>) -> Outcome<'r, Self> {
        let app_config = req
            .rocket()
            .state::<AppConfiguration>()
            .expect("Application Misconfigured");

        let body_data = data
            .open(app_config.app_limits.max_file_size.bytes())
            .into_bytes()
            .await
            .expect("Data not bytes");

        if !body_data.n.complete {
            return Outcome::Failure((Status::BadRequest, "Provided image was too large"));
        };

        let image_bytes = body_data.value;
        let (loaded_image, image_format) = match load_dynamic_image_for_bytes(
            &image_bytes[..],
            &app_config.app_limits.allowed_formats,
        ) {
            Ok(image_data) => image_data,
            Err(_) => {
                return Outcome::Failure((
                    Status::BadRequest,
                    "Provided image was incorrect format",
                ))
            }
        };

        Outcome::Success(RequestImage {
            bytes: image_bytes,
            as_image: loaded_image,
            image_format,
        })
    }
}
