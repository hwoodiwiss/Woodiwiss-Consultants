use std::collections::HashMap;

use acs_image_analysis::ImageAnalysisError;

use diesel::{ExpressionMethods, RunQueryDsl};
use rocket::{
    http::{self},
    serde::{self, json::Json},
    State,
};
use uuid::Uuid;

use crate::{
    data::image::{ImageResponse, ImageSizeInfo},
    database::{self, Images::dsl::*},
    guards::RequestImage,
    responders::ApiResponse,
    service::{
        image_analysis::ImageAnalysisService, resize::ResizeService,
        storage_provider::StorageProvider,
    },
    ImageDb,
};

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Image", |rocket| async {
        rocket.mount("/", routes![post_image_endpoint])
    })
}

fn map_analysis_error_to_status(err: &ImageAnalysisError) -> http::Status {
    match err {
        ImageAnalysisError::InvalidImageFormat => http::Status::BadRequest,
        ImageAnalysisError::UnexpectedResponseCode(_) => http::Status::InternalServerError,
        ImageAnalysisError::UnexpectedResponseFormat(_) => http::Status::InternalServerError,
        ImageAnalysisError::HttpError(_) => http::Status::InternalServerError,
        ImageAnalysisError::ServiceError => http::Status::InternalServerError,
    }
}

/// A thin wrapper around the actual functionality to improve IDE support.
#[post("/image", data = "<request_image>")]
async fn post_image_endpoint(
    db_conn: ImageDb,
    analysis_service: &State<ImageAnalysisService>,
    resize_service: &State<ResizeService>,
    storage_provider: &State<StorageProvider>,
    request_image: RequestImage,
) -> ApiResponse<Json<ImageResponse>> {
    post_image(
        db_conn,
        analysis_service,
        resize_service,
        storage_provider,
        request_image,
    )
    .await
}

#[inline]
async fn post_image(
    db_conn: ImageDb,
    analysis_service: &State<ImageAnalysisService>,
    resize_service: &State<ResizeService>,
    storage_provider: &State<StorageProvider>,
    request_image: RequestImage,
) -> ApiResponse<Json<ImageResponse>> {
    let image_analysis = analysis_service
        .get_description(&request_image.bytes[..])
        .await;

    let description = match image_analysis {
        Ok(description) => description,
        Err(err) => return ApiResponse(Err(map_analysis_error_to_status(&err))),
    };
    let id = Uuid::new_v4().to_hyphenated_ref().to_string();
    let mut image_sizes = HashMap::<String, ImageSizeInfo>::new();
    let resized_images = resize_service.resize(&request_image.as_image).await;
    for (size, image) in &resized_images {
        image_sizes.insert(
            size.clone(),
            match storage_provider.save_image(id.clone(), size.clone(), image) {
                Ok(res) => res,
                Err(_) => return ApiResponse(Err(http::Status::InternalServerError)),
            },
        );
    }
    image_sizes.insert(
        String::from("original"),
        match storage_provider.save_image(
            id.clone(),
            String::from("original"),
            &request_image.as_image,
        ) {
            Ok(res) => res,
            Err(_) => return ApiResponse(Err(http::Status::InternalServerError)),
        },
    );
    let response = ImageResponse {
        id: id.clone(),
        image_sizes: image_sizes.clone(),
        description: description.clone(),
    };
    let image_size_json = match serde::json::serde_json::to_string(&image_sizes.clone()) {
        Ok(res) => res,
        Err(_) => return ApiResponse(Err(http::Status::InternalServerError)),
    };
    let row_vals = (
        Id.eq(id),
        ImageData.eq(image_size_json),
        Description.eq(description.clone()),
    );
    match db_conn
        .run(move |conn| {
            diesel::insert_into(database::Images::dsl::Images)
                .values(&row_vals)
                .execute(conn)
        })
        .await
    {
        Ok(_) => ApiResponse(Ok(Json(response))),
        Err(_) => ApiResponse(Err(http::Status::InternalServerError)),
    }
}
