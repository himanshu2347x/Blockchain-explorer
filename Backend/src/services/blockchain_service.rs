use reqwest;
use serde_json::Value;
use std::time::Duration;

const ETHERSCAN_API_V2_URL: &str = "https://api.etherscan.io/v2/api";
const CHAINID: &str = "1"; 
const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

pub async fn fetch_address_balance(address: &str, api_key: &str) -> Result<Value, reqwest::Error> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()?;

    let url = format!(
        "{}?chainid={}&module=account&action=balance&address={}&tag=latest&apikey={}",
        ETHERSCAN_API_V2_URL, CHAINID, address, api_key
    );

    let response = client.get(&url).send().await?.json::<Value>().await?;
    Ok(response)
}

pub async fn fetch_transactions(address: &str, api_key: &str) -> Result<Value, reqwest::Error> {
    let client = reqwest::Client::builder()
        .timeout(REQUEST_TIMEOUT)
        .build()?;

    let url = format!(
        "{}?chainid={}&module=account&action=txlist&address={}&page=1&offset=100&sort=desc&apikey={}",
        ETHERSCAN_API_V2_URL, CHAINID, address, api_key
    );

    let response = client.get(&url).send().await?.json::<Value>().await?;
    Ok(response)
}
