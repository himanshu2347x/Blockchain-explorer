mod config;
mod handlers;
mod models;
mod routes;
mod services;

use config::load_config;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    let config = load_config();

    // Create app router with config state
    let app = routes::create_routes().with_state(config);

    // Add CORS middleware
    let app = app.layer(
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any)
    );

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(addr).await.unwrap();

    println!("Server running at http://{}", addr);
    println!("Available endpoints:");
    println!("GET /eth/balance - Get Ethereum wallet balance");
    println!("GET /eth/transactions - Get Transaction details");

    axum::serve(listener, app).await.unwrap();
}
