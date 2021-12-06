mod data;
mod endpoints;
mod fairings;
mod guards;
mod responders;
mod service;

#[macro_use]
extern crate rocket;

use data::config::AppConfiguration;
use endpoints::{home, image};
use fairings::CorsMiddleware;
use figment::providers::{Format, Serialized};
use rocket::{
    fairing::AdHoc,
    figment::{providers::Json, Figment},
    Config,
};
use service::{image_analysis, resize, storage_provider};

#[launch]
fn rocket() -> _ {
    let figment = Figment::from(rocket::Config::default())
        .merge(Serialized::defaults(Config::default()))
        .merge(Json::file("config.json"))
        .merge(Json::file("config.secrets.json"));

    rocket::custom(figment)
        .attach(AdHoc::config::<AppConfiguration>())
        .attach(CorsMiddleware)
        .attach(home::stage())
        .attach(image::stage())
        .attach(image_analysis::stage())
        .attach(resize::stage())
        .attach(storage_provider::stage())
}
