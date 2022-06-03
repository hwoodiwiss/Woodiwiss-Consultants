pub mod image_analysis;
pub mod image_db_service;
pub mod resize;
mod service_t;

pub use service_t::*;

#[cfg_attr(not(feature = "remote-storage"), path = "storage_provider.rs")]
#[cfg_attr(feature = "remote-storage", path = "azure_storage_provider.rs")]
pub mod storage_service;

pub enum DbServiceError {
    DbError,
    SerializationError,
    DeserializationError,
    NotFound,
    UnknownError,
}

pub enum StorageProviderError {
    ImageError,
    InsufficientPermissions,
    FileNotFound,
    TimedOut,
    OutOfMemory,
    Unknown,
}
