use std::collections::HashMap;

use rocket::serde::json::Json;

use crate::{data::image::ImageResponse, responders::ApiResponse};

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Image", |rocket| async {
        rocket.mount("/", routes![post_image])
    })
}

#[post("/image")]
async fn post_image() -> ApiResponse<Json<ImageResponse>> {
    ApiResponse(Ok(Json(ImageResponse(HashMap::new()))))
}
