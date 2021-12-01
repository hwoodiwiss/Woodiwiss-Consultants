mod http_client;
mod http_client_t;
#[cfg(test)]
mod test;

pub use http_client::DirectHttpClient;
pub use http_client_t::*;

#[cfg(test)]
pub use test::{TestHttpClient, TestResponse};
