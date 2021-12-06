use crate::responders::OptionsResponse;

pub fn stage() -> rocket::fairing::AdHoc {
    rocket::fairing::AdHoc::on_ignite("Home", |rocket| async {
        rocket.mount("/", routes![options, index])
    })
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
