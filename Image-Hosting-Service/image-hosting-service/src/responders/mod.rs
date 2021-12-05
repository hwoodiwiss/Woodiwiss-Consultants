use rocket::{http::Header, response::Responder, Response};

pub struct OptionsResponse {
    pub allowed_methods: Vec<&'static str>,
}

impl<'r> Responder<'r, 'static> for OptionsResponse {
    fn respond_to(self, request: &'r rocket::Request<'_>) -> rocket::response::Result<'static> {
        let mut requested_headers = request
            .headers()
            .get_one("Access-Control-Request-Headers")
            .map_or(Vec::<String>::new(), |header_val| {
                header_val
                    .split(',')
                    .map(|x| String::from(x.trim()))
                    .collect()
            });
        requested_headers.push(String::from("Access-Control-Allowed-Origin"));
        Response::build()
            .header(Header::new(
                "Access-Control-Allowed-Methods",
                self.allowed_methods.join(", "),
            ))
            .header(Header::new(
                "Access-Control-Allowed-Headers",
                requested_headers.join(", "),
            ))
            .ok()
    }
}
