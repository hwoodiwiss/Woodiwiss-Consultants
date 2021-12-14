use rocket::{
    fairing::{Fairing, Info, Kind},
    http::Header,
    Request, Response,
};

use crate::data::config::{AppConfiguration, CorsConfiguration};

/// A dummy struct to use to provide CORS middleware
pub struct CorsMiddleware;

#[rocket::async_trait]
impl Fairing for CorsMiddleware {
    fn info(&self) -> Info {
        Info {
            name: "CORS Handler",
            kind: Kind::Response,
        }
    }

    /// Sets CORS headers based on incoming CORS request headers and configuration
    ///
    /// # Headers
    ///
    /// ## Access-Control-Allow-Origin
    /// If config `allow_all` is true, sets to `*`
    /// Otherwise checks whether value of incoming `Origin` header
    /// is in `allowed_origins`. If so, sets ACAO = Origin, otherwise
    /// Does not set ACAO.
    ///  
    /// # Failures
    /// Fails if AppConfiguration cannot be found in the managed state
    async fn on_response<'r>(&self, req: &'r Request<'_>, res: &mut Response) -> () {
        let cors_config = req
            .rocket()
            .state::<AppConfiguration>()
            .map(|app_config| &app_config.cors);
        if cors_config.is_none() {
            return;
        }

        let cors_config = cors_config.unwrap_or(&CorsConfiguration {
            allow_all: false,
            allowed_origins: None,
        });

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
