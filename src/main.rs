use clap::Parser;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::time::Duration;
use tokio::time::{interval, sleep};
use tokio_tungstenite::{connect_async, tungstenite::Message};
use url::Url;

#[derive(Parser, Debug)]
#[command(
    name = "echoex-node",
    about = "Echoex Node Anchor — keeps your Chamber alive 24/7",
    long_about = "A zero-knowledge anchor daemon that maintains \
                  your Echoex Chamber without storing any messages, \
                  files, or communication content."
)]
struct Args {
    /// Node authentication token (from Chamber Settings)
    #[arg(long, env = "ECHOEX_TOKEN")]
    token: String,

    /// Chamber room code
    #[arg(long, env = "ECHOEX_CHAMBER")]
    chamber: String,

    /// Node display name (optional)
    #[arg(long, env = "ECHOEX_NAME", default_value = "Echoex Node")]
    name: String,

    /// BME host (default: bulkmetadataeditor.com)
    #[arg(
        long, 
        env = "ECHOEX_HOST", 
        default_value = "bulkmetadataeditor.com"
    )]
    host: String,

    /// Reconnect delay in seconds on disconnect (default: 5)
    #[arg(long, default_value_t = 5)]
    reconnect_delay: u64,
}

#[allow(dead_code)]
#[derive(Serialize, Deserialize, Debug)]
struct WsMessage {
    #[serde(rename = "type")]
    msg_type: String,
    #[serde(flatten)]
    extra: serde_json::Map<String, Value>,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    
    println!("╔══════════════════════════════════════╗");
    println!("║        Echoex Node Anchor            ║");
    println!("║  Zero-knowledge Chamber daemon       ║");
    println!("╚══════════════════════════════════════╝");
    println!();
    println!("  Node name : {}", args.name);
    println!("  Chamber   : {}", args.chamber);
    println!("  Host      : {}", args.host);
    println!();

    loop {
        println!("[*] Connecting to Chamber...");
        
        match run_connection(&args).await {
            Ok(_) => {
                println!("[!] Connection closed. Reconnecting in {}s...", 
                         args.reconnect_delay);
            }
            Err(e) => {
                println!("[!] Connection error: {}. Retrying in {}s...", 
                         e, args.reconnect_delay);
            }
        }
        
        sleep(Duration::from_secs(args.reconnect_delay)).await;
    }
}

async fn run_connection(args: &Args) -> Result<(), Box<dyn std::error::Error>> {
    let clean_host = args.host
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_start_matches("wss://")
        .trim_start_matches("ws://")
        .trim_end_matches('/');

    let ws_url = format!(
        "wss://{}/api/share/signaling?code={}&token={}&type=node&name={}",
        clean_host,
        args.chamber,
        args.token,
        urlencoding::encode(&args.name)
    );

    let url = Url::parse(&ws_url)?;
    let (ws_stream, _) = connect_async(url).await?;
    let (mut write, mut read) = ws_stream.split();

    println!("[✓] Connected to Chamber: {}", args.chamber);

    // Keepalive interval — 30 seconds matching DO expectation
    let mut keepalive_interval = interval(Duration::from_secs(30));
    
    // Start time for uptime tracking
    let start = std::time::Instant::now();

    loop {
        tokio::select! {
            // Send keepalive ping every 30s
            _ = keepalive_interval.tick() => {
                let uptime = start.elapsed().as_secs();
                let ping = json!({
                    "type": "node_heartbeat_ack",
                    "uptime": uptime,
                    "rtt": 0,
                    "packetLoss": 0
                });
                write.send(Message::Text(ping.to_string())).await?;
            }

            // Handle incoming messages
            msg = read.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        handle_message(&text, &mut write, start.elapsed().as_secs()).await?;
                    }
                    Some(Ok(Message::Close(_))) => {
                        println!("[!] Chamber closed connection.");
                        return Ok(());
                    }
                    Some(Err(e)) => {
                        return Err(Box::new(e));
                    }
                    None => {
                        println!("[!] Connection stream ended.");
                        return Ok(());
                    }
                    _ => {} // Ignore binary, ping, pong frames
                }
            }
        }
    }
}

async fn handle_message(
    text: &str,
    write: &mut (impl SinkExt<Message, Error = tungstenite::Error> + Unpin),
    uptime_secs: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    // Parse only the type field — never log or store content
    let Ok(value) = serde_json::from_str::<Value>(text) else {
        return Ok(());
    };

    let msg_type = value.get("type")
        .and_then(|t| t.as_str())
        .unwrap_or("");

    match msg_type {
        "node_authenticated" => {
            let name = value.get("name")
                .and_then(|n| n.as_str())
                .unwrap_or("Node");
            println!("[✓] Authenticated as: {}", name);
            println!("[✓] Chamber is now anchored. Staying alive...");
        }

        "node_ping" => {
            let timestamp = value.get("timestamp")
                .and_then(|ts| ts.as_i64())
                .unwrap_or(0);
            let pong = json!({
                "type": "node_pong",
                "timestamp": timestamp
            });
            write.send(Message::Text(pong.to_string())).await?;
        }

        "node_heartbeat" => {
            // Respond with ack — report uptime only, no content
            let ack = json!({
                "type": "node_heartbeat_ack",
                "uptime": uptime_secs,
                "rtt": 0,
                "packetLoss": 0
            });
            write.send(Message::Text(ack.to_string())).await?;
        }

        "chamber_expired" => {
            let reason = value.get("reason")
                .and_then(|r| r.as_str())
                .unwrap_or("unknown");
            println!("[!] Chamber expired: {}. Stopping.", reason);
            std::process::exit(0);
        }

        "chamber_ttl_auto_renewed" => {
            println!("[✓] Chamber TTL auto-renewed.");
        }

        "chamber_ttl_extended" => {
            let extended_by = value.get("lastExtendedBy")
                .and_then(|e| e.as_str())
                .unwrap_or("Host");
            println!("[✓] Chamber TTL extended by {}.", extended_by);
        }

        // All other message types: acknowledged but never 
        // logged or stored — content privacy guaranteed
        _ => {}
    }

    Ok(())
}
