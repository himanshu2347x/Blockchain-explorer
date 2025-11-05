use axum::{Router, routing::get};
use crate::{handlers::blockchain::{get_eth_balance, get_transactions}, models::EtherscanConfig};

pub fn eth_routes() -> Router<EtherscanConfig> {
    Router::new()
        .route("/balance", get(get_eth_balance))
        .route("/transactions", get(get_transactions))
}