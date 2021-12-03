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
