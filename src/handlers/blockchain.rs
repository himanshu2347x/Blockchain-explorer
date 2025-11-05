use axum::{Json, extract::State};
use serde_json::{json, Value};
use crate::models::EtherscanConfig;
use crate::services::blockchain_service::{fetch_address_balance, fetch_transactions};

/// Handler for getting ETH balance
pub async fn get_eth_balance(State(config): State<EtherscanConfig>) -> Json<Value> {
    match fetch_address_balance(&config.address, &config.api_key).await {
        Ok(data) => {
            if data["status"] == "1" {
                if let Some(balance_str) = data["result"].as_str() {
                    if let Ok(balance_wei) = balance_str.parse::<u128>() {
                        let balance_eth = balance_wei as f64 / 1e18;
                        return Json(json!({
                            "address": &config.address,
                            "balance_wei": balance_wei.to_string(),
                            "balance_eth": format!("{:.6}", balance_eth),
                            "status": "success"
                        }));
                    }
                }
            }
            Json(data)
        }
        Err(e) => Json(json!({
            "error": format!("Failed to fetch data from Etherscan: {}", e),
            "status": "error"
        })),
    }
}

/// Handler for getting transactions
pub async fn get_transactions(State(config): State<EtherscanConfig>) -> Json<Value> {
    match fetch_transactions(&config.address, &config.api_key).await {
        Ok(data) => {
            if data["status"] == "1" {
                Json(json!({
                    "address": config.address,
                    "transactions": data["result"],
                    "status": "success"
                }))
            } else {
                Json(json!({
                    "address": config.address,
                    "error": data["message"],
                    "status": "error"
                }))
            }
        }
        Err(e) => Json(json!({
            "error": format!("Failed to fetch transactions: {}", e),
            "status": "error"
        })),
    }
}
