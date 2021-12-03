use rocket::{
    fairing::{Fairing, Info, Kind},
    http::Header,
    Request, Response,
};

use crate::data::config::AppConfiguration;

pub struct CorsMiddleware;

#[rocket::async_trait]
impl Fairing for CorsMiddleware {
    fn info(&self) -> Info {
        Info {
            name: "CORS Handler",
            kind: Kind::Response,
        }
    }
    async fn on_response<'r>(&self, req: &'r Request<'_>, res: &mut Response) -> () {
        let cors_config = req
            .rocket()
            .state::<AppConfiguration>()
            .map(|app_config| &app_config.cors);
        if cors_config.is_none() {
            panic!("Failed to load config or");
        }

        let cors_config = cors_config.unwrap();

        if cors_config.allow_all {
            res.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        } else {
            cors_config.allowed_origins.as_ref().map(|allowed_origins| {
                if let Some(origin) = req.headers().get_one("Origin") {
                    if allowed_origins
                        .into_iter()
                        .map(|ao| ao.to_lowercase())
                        .collect::<Vec<String>>()
                        .contains(&origin.to_owned().to_lowercase())
                    {
                        res.set_header(Header::new(
                            "Access-Control-Allow-Origin",
                            origin.to_owned(),
                        ));
                    }
                }
            });
        };
    }
}
