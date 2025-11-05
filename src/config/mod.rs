use dotenvy::dotenv;
use std::env;
use crate::models::EtherscanConfig;

pub fn load_config() -> EtherscanConfig {
    dotenv().ok(); // Load .env automatically

    let api_key = env::var("ETHERSCAN_API_KEY")
        .expect("Missing ETHERSCAN_API_KEY in .env");
    let address = env::var("ETH_ADDRESS")
        .expect("Missing ETH_ADDRESS in .env");

    EtherscanConfig { api_key, address }
}
