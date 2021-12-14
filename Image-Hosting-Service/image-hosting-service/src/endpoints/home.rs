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

/// Returns Ok with no content
///
/// Intended mostly to be used as an 'up' detector
#[get("/")]
pub fn index() -> String {
    String::from("")
}
