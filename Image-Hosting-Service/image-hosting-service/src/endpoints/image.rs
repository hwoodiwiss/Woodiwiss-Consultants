use std::collections::HashMap;

use acs_image_analysis::ImageAnalysisError;

use rocket::{
    fs::NamedFile,
    http::Status,
    response::{self, status},
    serde::{
        self,
        json::{self},
    },
    Either, State,
};
use uuid::Uuid;

use crate::{
    data::{
        image::{ImageResponse, ImageSizeInfo},
        view_model::ImageDbModel,
    },
    guards::RequestImage,
    responders::OptionsResponse,
    service::{
        image_analysis::ImageAnalysisServiceError, image_db_service::ImageRepository,
        ImageAnalysisService, ImageDbRepository, ResizeService, StorageProvider,
    },
    ImageDb,
};

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Image", |rocket| async {
        rocket.mount("/", routes![post_image, get_image, options])
    })
}

fn map_analysis_service_error_to_status(
    err: &ImageAnalysisServiceError,
) -> status::Custom<Either<json::Json<ImageResponse>, &'static str>> {
    match err {
        ImageAnalysisServiceError::FailedToDescribeImage => status::Custom(
            Status::BadRequest,
            Either::Right("The provider could not describe the provided image"),
        ),
        ImageAnalysisServiceError::ImageAnalysisError(err) => map_analysis_error_to_status(err),
    }
}

fn map_analysis_error_to_status(
    err: &ImageAnalysisError,
) -> status::Custom<Either<json::Json<ImageResponse>, &'static str>> {
    match err {
        ImageAnalysisError::InvalidImageFormat => {
            status::Custom(Status::BadRequest, Either::Right("Invalid image format"))
        }
        ImageAnalysisError::UnexpectedResponseCode(_) => {
            status::Custom(Status::InternalServerError, Either::Right(""))
        }
        ImageAnalysisError::UnexpectedResponseFormat(_) => {
            status::Custom(Status::InternalServerError, Either::Right(""))
        }
        ImageAnalysisError::HttpError(_) => {
            status::Custom(Status::InternalServerError, Either::Right(""))
        }
        ImageAnalysisError::ServiceError => {
            status::Custom(Status::InternalServerError, Either::Right(""))
        }
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
    analysis_service: &State<Box<dyn ImageAnalysisService>>,
    resize_service: &State<Box<dyn ResizeService>>,
    storage_provider: &State<Box<dyn StorageProvider>>,
    request_image: RequestImage,
    hidden: Option<bool>,
) -> status::Custom<Either<json::Json<ImageResponse>, &'static str>> {
    post_image_internal(
        &(Box::new(ImageRepository::new(db_conn)) as _),
        analysis_service.inner(),
        resize_service.inner(),
        storage_provider.inner(),
        request_image,
        hidden,
    )
    .await
}

#[inline]
async fn post_image_internal(
    image_repository: &Box<dyn ImageDbRepository>,
    analysis_service: &Box<dyn ImageAnalysisService>,
    resize_service: &Box<dyn ResizeService>,
    storage_provider: &Box<dyn StorageProvider>,
    request_image: RequestImage,
    hidden: Option<bool>,
) -> status::Custom<Either<json::Json<ImageResponse>, &'static str>> {
    let hidden = hidden.unwrap_or(false);
    let image_analysis = analysis_service
        .get_description(&request_image.bytes[..])
        .await;

    let description = match image_analysis {
        Ok(description) => description,
        Err(err) => return map_analysis_service_error_to_status(&err),
    };
    let id = Uuid::new_v4().to_hyphenated_ref().to_string();
    let mut image_sizes = HashMap::<String, ImageSizeInfo>::new();
    let resized_images = resize_service.resize(&request_image.as_image).await;
    for (size, image) in &resized_images {
        image_sizes.insert(
            size.clone(),
            match storage_provider.save_image(
                id.clone(),
                size.clone(),
                image,
                request_image.image_format,
            ) {
                Ok(res) => res,
                Err(_) => return status::Custom(Status::InternalServerError, Either::Right("")),
            },
        );
    }
    image_sizes.insert(
        String::from("original"),
        match storage_provider.save_image(
            id.clone(),
            String::from("original"),
            &request_image.as_image,
            request_image.image_format,
        ) {
            Ok(res) => res,
            Err(_) => return status::Custom(Status::InternalServerError, Either::Right("")),
        },
    );
    let response = ImageResponse {
        id: id.clone(),
        image_sizes: image_sizes.clone(),
        description: description.clone(),
    };
    let image_size_json = match serde::json::serde_json::to_string(&image_sizes.clone()) {
        Ok(res) => res,
        Err(_) => return status::Custom(Status::InternalServerError, Either::Right("")),
    };

    match image_repository
        .add(ImageDbModel {
            id: id,
            image_data: image_size_json,
            description: description.clone(),
            hidden,
            file_type: request_image.image_format.extensions_str()[0].to_string(),
        })
        .await
    {
        Ok(_) => response::status::Custom(Status::Ok, Either::Left(json::Json(response))),
        Err(_) => status::Custom(Status::InternalServerError, Either::Right("")),
    }
}

#[get("/image/<id>/<size>")]
async fn get_image(
    db_conn: ImageDb,
    id: String,
    size: String,
) -> response::status::Custom<Option<NamedFile>> {
    get_image_internal(&(Box::new(ImageRepository::new(db_conn)) as _), &id, &size).await
}

#[inline]
async fn get_image_internal(
    image_repository: &Box<dyn ImageDbRepository>,
    id: &String,
    size: &String,
) -> response::status::Custom<Option<NamedFile>> {
    //Returns not found if not found in the database
    let image_metadata = match image_repository.get_by_id(id.clone()).await {
        Ok(item) => item,
        Err(_) => return response::status::Custom(Status::NotFound, None),
    };

    match NamedFile::open(format!("./images/{}/{}.{}", id, size, image_metadata.file_type).as_str())
        .await
    {
        Ok(file) => response::status::Custom(Status::Ok, Some(file)),
        Err(_) => response::status::Custom(Status::NotFound, None),
    }
}

#[cfg(test)]
mod test {
    use std::{
        fs::{create_dir_all, File},
        io::Write,
    };

    use mockall::predicate::*;
    use mockall::*;
    use rocket::http::Status;

    use crate::{data::view_model::ImageDbModel, service::MockImageDbRepository};

    use super::get_image_internal;

    fn setup_test_file(id: String, size: String, file_type: String) {
        create_dir_all(format!("./images/{}/", id).as_str()).expect(
            "Failed to create image base path. Check you have permissions to read and write there.",
        );
        let mut file = File::create(format!("./images/{}/{}.{}", id, size, file_type).as_str())
            .expect("Failed to create test file");
        file.write_all(b"NOW I'VE GOT A TEST FILE, HO HO HO!")
            .expect("Failed to write to test file");
    }

    #[tokio::test]
    async fn returns_ok_and_some_if_found_in_db_and_file_exists() {
        const EXPECTED_ID: &str = "TEST_ID";
        const EXPECTED_SIZE: &str = "TEST_SIZE";
        const EXPECTED_TYPE: &str = "png";
        setup_test_file(
            EXPECTED_ID.to_owned(),
            EXPECTED_SIZE.to_owned(),
            EXPECTED_TYPE.to_owned(),
        );

        let mut mock_repo = MockImageDbRepository::default();
        mock_repo
            .expect_get_by_id()
            .with(predicate::function(|id: &String| id == EXPECTED_ID))
            .returning(|_| {
                Ok(ImageDbModel {
                    id: EXPECTED_ID.to_owned(),
                    image_data: "".to_owned(),
                    description: "".to_owned(),
                    hidden: false,
                    file_type: EXPECTED_TYPE.to_owned(),
                })
            });

        let result = get_image_internal(
            &(Box::new(mock_repo) as _),
            &EXPECTED_ID.to_owned(),
            &EXPECTED_SIZE.to_owned(),
        )
        .await;

        assert_eq!(result.0, Status::Ok);
        assert!(result.1.is_some());
    }
}
