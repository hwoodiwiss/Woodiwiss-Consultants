mod data;
mod endpoints;
mod middleware;
mod service;

#[macro_use]
extern crate rocket;

use data::config::AppConfiguration;
use endpoints::home;
use figment::providers::{Format, Serialized};
use middleware::CorsMiddleware;
use rocket::{
    fairing::AdHoc,
    figment::{providers::Json, Figment},
    Config,
};

#[launch]
fn rocket() -> _ {
    let figment = Figment::from(rocket::Config::default())
        .merge(Serialized::defaults(Config::default()))
        .merge(Json::file("config.json"));

    #[cfg(debug_assertions)] // Only load local secrets file if we're running locally
    let figment = figment.merge(Json::file("config.secrets.json"));

    rocket::custom(figment)
        .attach(AdHoc::config::<AppConfiguration>())
        .attach(CorsMiddleware)
        .mount("/", routes![home::index])
}
