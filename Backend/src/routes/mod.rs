pub mod routes;

use axum::Router;
use crate::models::EtherscanConfig;
use crate::routes::routes::eth_routes;

pub fn create_routes() -> Router<EtherscanConfig> {
    Router::new().nest("/eth", eth_routes())
}