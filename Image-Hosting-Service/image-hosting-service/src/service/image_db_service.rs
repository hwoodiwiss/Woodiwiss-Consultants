use crate::{data::view_model::ImageDbModel, database::Images::dsl, ImageDb};
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};

use super::{DbServiceError, ImageDbRepository};

pub struct ImageRepository(ImageDb);

impl ImageRepository {
    pub fn new(connection_pool: ImageDb) -> Self {
        Self(connection_pool)
    }
}

fn map_diesel_error_to_db_error(err: diesel::result::Error) -> DbServiceError {
    match err {
        diesel::result::Error::DatabaseError(_, _) => DbServiceError::DbError,
        diesel::result::Error::DeserializationError(_) => DbServiceError::DeserializationError,
        diesel::result::Error::SerializationError(_) => DbServiceError::SerializationError,
        _ => DbServiceError::UnknownError,
    }
}

#[async_trait]
impl ImageDbRepository for ImageRepository {
    async fn get_by_id(&self, id: String) -> Result<ImageDbModel, DbServiceError> {
        self.0
            .run(|conn| {
                dsl::Images
                    .filter(&dsl::Id.eq(id))
                    .first::<ImageDbModel>(conn)
            })
            .await
            .map_err(|err| map_diesel_error_to_db_error(err))
    }
    async fn get_all(&self) -> Result<Vec<ImageDbModel>, DbServiceError> {
        self.0
            .run(|conn| {
                dsl::Images
                    .filter(&dsl::Hidden.eq(false))
                    .load::<ImageDbModel>(conn)
            })
            .await
            .map_err(|err| map_diesel_error_to_db_error(err))
    }
    async fn add(&self, image_metadata: ImageDbModel) -> Result<(), DbServiceError> {
        let image_row = (
            dsl::Id.eq(image_metadata.id.clone()),
            dsl::ImageData.eq(image_metadata.image_data.clone()),
            dsl::Description.eq(image_metadata.description.clone()),
            dsl::Hidden.eq(image_metadata.hidden),
            dsl::FileType.eq(image_metadata.file_type.clone()),
        );

        self.0
            .run(move |conn| {
                diesel::insert_into(dsl::Images)
                    .values(&image_row)
                    .execute(conn)
            })
            .await
            .map(|_| ())
            .map_err(|err| map_diesel_error_to_db_error(err))
    }
}
