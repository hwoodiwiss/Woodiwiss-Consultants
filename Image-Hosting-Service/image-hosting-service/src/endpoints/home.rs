use rocket::{Build, Rocket};

use crate::responders::OptionsResponse;

pub fn mount(rocket: Rocket<Build>) -> Rocket<Build> {
    let rocket = rocket.mount("/", routes![options, index]);
    rocket
}

#[options("/")]
pub fn options() -> OptionsResponse {
    OptionsResponse {
        allowed_methods: vec!["OPTIONS", "GET"],
    }
}

#[get("/")]
pub fn index() -> String {
    String::from("hello world")
}
