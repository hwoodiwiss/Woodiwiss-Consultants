use rocket::{http::Header, response::Responder, Response};

/// A responder struct for responding to options requests
///
/// `allowed_methods`: A list of methods allowed by the
/// related endpoint
pub struct OptionsResponse {
    pub allowed_methods: Vec<&'static str>,
}

impl<'r> Responder<'r, 'static> for OptionsResponse {
    /// Sets pre-flight CORS headers for an options request
    ///
    /// ## Headers
    ///
    /// ### Access-Control-Allow-Headers
    /// Sets Access-Control-Allow-Headers header value to value of incoming
    /// Access-Control-Request-Headers header, plus 'Access-Control-Allow-Origin'
    ///
    /// ### Access-Control-Allow-Methods
    /// Sets Access-Control-Allow-Methods to the value off `allowed_methods` as
    /// a comma separated list
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
        requested_headers.push(String::from("Access-Control-Allow-Origin"));
        Response::build()
            .header(Header::new(
                "Access-Control-Allow-Methods",
                self.allowed_methods.join(", "),
            ))
            .header(Header::new(
                "Access-Control-Allow-Headers",
                requested_headers.join(", "),
            ))
            .ok()
    }
}
