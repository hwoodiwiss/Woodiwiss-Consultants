use acs_image_analysis::AzureImageAnalysisClient;

#[macro_use]
extern crate serde;

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    base_uri: String,
    key: String,
}

#[tokio::main]
async fn main() {
    let image_bytes = include_bytes!("../../test-image.jpg");
    let analyzer = AzureImageAnalysisClient::new(
        "https://hw-uni-cogsvc.cognitiveservices.azure.com",
        "<ENTER KEY>",
    );
    let analysis = analyzer.analyse(image_bytes.to_vec()).await;

    if let Ok(result) = &analysis {
        print!("{:?}", result);
        let mut captions = result.description.captions.to_vec();
        captions.sort_by(|s1, s2| s2.confidence.partial_cmp(&s1.confidence).unwrap());
    }

    if let Err(result) = &analysis {
        print!("{:?}", result);
    }
}
