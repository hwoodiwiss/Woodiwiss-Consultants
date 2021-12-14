use crate::{
    data::view_model::ImageViewModel,
    responders::OptionsResponse,
    service::{image_db_service::ImageRepository, ImageDbRepository},
    ImageDb,
};

use rocket::{http::Status, response::status, serde::json};

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Images", |rocket| async {
        rocket.mount("/", routes![options, get_images])
    })
}

#[options("/images")]
async fn options() -> OptionsResponse {
    OptionsResponse {
        allowed_methods: vec!["GET", "OPTIONS"],
    }
}

#[get("/images")]
async fn get_images(db_pool: ImageDb) -> status::Custom<Option<json::Json<Vec<ImageViewModel>>>> {
    get_images_internal(&(Box::new(ImageRepository::new(db_pool)) as _)).await
}

#[inline]
async fn get_images_internal(
    image_repository: &Box<dyn ImageDbRepository>,
) -> status::Custom<Option<json::Json<Vec<ImageViewModel>>>> {
    match image_repository.get_all().await {
        Ok(db_items) => status::Custom(
            Status::Ok,
            Some(json::Json(
                db_items
                    .into_iter()
                    .map(|item| ImageViewModel {
                        image_sizes: json::from_str(item.image_data.as_str())
                            .expect("Invalid json in database"),
                        description: item.description,
                    })
                    .collect(),
            )),
        ),
        Err(_) => status::Custom(Status::InternalServerError, None),
    }
}
