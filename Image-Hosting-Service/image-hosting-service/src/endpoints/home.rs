use rocket::{http::Header, Response};

#[get("/")]
pub fn index() -> String {
    String::from("hello world")
}
