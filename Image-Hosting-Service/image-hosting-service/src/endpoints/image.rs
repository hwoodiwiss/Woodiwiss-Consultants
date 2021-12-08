use std::collections::HashMap;

use acs_image_analysis::ImageAnalysisError;

use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use rocket::{
    fs::NamedFile,
    http::{self, Status},
    response,
    serde::{self, json::Json},
    State,
};
use uuid::Uuid;

use crate::{
    data::{
        image::{ImageResponse, ImageSizeInfo},
        view_model::ImageDbModel,
    },
    database::{self, Images::dsl},
    guards::RequestImage,
    responders::{ApiResponse, OptionsResponse},
    service::{
        image_analysis::ImageAnalysisService, resize::ResizeService,
        storage_provider::StorageProvider,
    },
    ImageDb,
};

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Image", |rocket| async {
        rocket.mount("/", routes![post_image, get_image, options])
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

#[options("/image")]
async fn options() -> OptionsResponse {
    OptionsResponse {
        allowed_methods: vec!["GET", "POST", "OPTIONS"],
    }
}

/// A thin wrapper around the actual functionality to improve IDE support.
#[post("/image?<hidden>", data = "<request_image>")]
async fn post_image(
    db_conn: ImageDb,
    analysis_service: &State<ImageAnalysisService>,
    resize_service: &State<ResizeService>,
    storage_provider: &State<StorageProvider>,
    request_image: RequestImage,
    hidden: Option<bool>,
) -> ApiResponse<Json<ImageResponse>> {
    post_image_internal(
        db_conn,
        analysis_service,
        resize_service,
        storage_provider,
        request_image,
        hidden,
    )
    .await
}

#[inline]
async fn post_image_internal(
    db_conn: ImageDb,
    analysis_service: &State<ImageAnalysisService>,
    resize_service: &State<ResizeService>,
    storage_provider: &State<StorageProvider>,
    request_image: RequestImage,
    hidden: Option<bool>,
) -> ApiResponse<Json<ImageResponse>> {
    let hidden = hidden.unwrap_or(false);
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
    let image_row = (
        dsl::Id.eq(id),
        dsl::ImageData.eq(image_size_json),
        dsl::Description.eq(description.clone()),
        dsl::Hidden.eq(hidden),
    );
    match db_conn
        .run(move |conn| {
            diesel::insert_into(database::Images::dsl::Images)
                .values(&image_row)
                .execute(conn)
        })
        .await
    {
        Ok(_) => ApiResponse(Ok(Json(response))),
        Err(_) => ApiResponse(Err(http::Status::InternalServerError)),
    }
}

#[get("/image/<id>/<size>")]
async fn get_image(
    db_conn: ImageDb,
    id: String,
    size: String,
) -> response::status::Custom<Option<NamedFile>> {
    get_image_internal(db_conn, &id, &size).await
}

#[inline]
async fn get_image_internal(
    db_conn: ImageDb,
    id: &String,
    size: &String,
) -> response::status::Custom<Option<NamedFile>> {
    let qry_id = id.clone();
    //Returns not found if not found in the database
    let _ = match db_conn
        .run(|conn| {
            dsl::Images
                .filter(&dsl::Id.eq(qry_id))
                .first::<ImageDbModel>(conn)
        })
        .await
    {
        Ok(item) => item,
        Err(_) => return response::status::Custom(Status::NotFound, None),
    };

    match NamedFile::open(format!("./images/{}/{}.jpg", id, size).as_str()).await {
        Ok(file) => response::status::Custom(Status::Ok, Some(file)),
        Err(_) => response::status::Custom(Status::NotFound, None),
    }
}
