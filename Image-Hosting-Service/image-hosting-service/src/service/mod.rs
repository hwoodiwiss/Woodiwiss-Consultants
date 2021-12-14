pub mod image_analysis;
pub mod image_db_service;
pub mod resize;
mod service_t;
pub mod storage_provider;

pub use service_t::*;

pub enum DbServiceError {
    DbError,
    SerializationError,
    DeserializationError,
    NotFound,
    UnknownError,
}
