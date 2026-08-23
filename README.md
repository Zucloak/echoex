# 🌐 Echoex Node Anchor

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg?logo=node.js)](https://nodejs.org/)

**Echoex Node Anchor** is an ultra-lightweight, headless daemon that anchors your private [Echoex Chambers](https://github.com/Zucloak/bulkmetadataeditor) 24/7 in Cloudflare Durable Object memory.

By running a Node Anchor on a Raspberry Pi, home server, NAS (Synology, QNAP), or cloud VPS, you eliminate the need to keep your personal browser tab open or your computer running just to maintain chamber state and WebRTC connectivity.

---

## ⚡ Quick Start

### 1. Instant Run via NPX (No installation required)

```bash
npx echoex-node --token <YOUR_TOKEN> --chamber <CHAMBER_CODE>
```

---

### 2. Docker Run (Recommended for Linux, Raspberry Pi, VPS)

```bash
docker run -d \
  --name echoex-node \
  --restart unless-stopped \
  zucloak/echoex:latest \
  --token <YOUR_TOKEN> \
  --chamber <CHAMBER_CODE>
```

---

### 3. Docker Compose (NAS / Portainer / TrueNAS)

```yaml
version: '3.8'

services:
  echoex-node:
    image: zucloak/echoex:latest
    container_name: echoex-node
    restart: unless-stopped
    environment:
      - ECHOEX_TOKEN=your_token_here
      - ECHOEX_CHAMBER=your_chamber_code_here
      - ECHOEX_NODE_NAME=Raspberry Pi 4
```

Start the container:
```bash
docker compose up -d
```

---

## ⚙️ Configuration Reference

| Flag | Environment Variable | Default | Description |
| :--- | :--- | :--- | :--- |
| `-t`, `--token` | `ECHOEX_TOKEN` | *(Required)* | Secret node token generated from the Chamber Settings modal |
| `-c`, `--chamber` | `ECHOEX_CHAMBER` | *(Required)* | 8-character Chamber Room Code |
| `-n`, `--name` | `ECHOEX_NODE_NAME` | `Echoex Node` | Friendly anchor display name in the Chamber Member List |
| `-s`, `--server` | `ECHOEX_SERVER` | `https://bulkmetadataeditor.com` | Signaling server host |
| `--no-relay` | `ECHOEX_DISABLE_RELAY` | `false` | Disable blind WebRTC encrypted packet relay donation |

---

## 🔒 Security & Ephemeral Architecture

- **Zero Plaintext Storage**: The anchor daemon never writes chat messages, decryption keys, or metadata to disk. All data is processed purely in ephemeral RAM.
- **End-to-End Encrypted**: Swarm packet relays only route ciphertext. The anchor cannot inspect user payloads.
- **Token-Authenticated**: Authenticates directly with the chamber’s Cloudflare Durable Object SQLite memory.

---

## 📜 License

Licensed under the [Apache License, Version 2.0](LICENSE).
