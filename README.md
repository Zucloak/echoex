# 🌐 Echoex Node Anchor

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Language](https://img.shields.io/badge/Language-Rust-orange.svg?logo=rust)](https://www.rust-lang.org/)

**Echoex Node Anchor** is an ultra-fast, zero-knowledge Rust daemon that anchors your private [Echoex Chambers](https://github.com/Zucloak/bulkmetadataeditor) 24/7 in Cloudflare Durable Object memory.

By running an Echoex Node Anchor on a Raspberry Pi, home server, NAS (Synology, QNAP), or cloud VPS, you eliminate the need to keep your personal browser tab open or your computer running just to maintain chamber state and WebRTC connectivity.

---

## ⚡ Quick Start

### 1. Download Binary (Recommended)

Pick your platform from the latest release:

| Platform | Download |
|----------|----------|
| Linux x64 | `echoex-node-linux-x64` |
| Linux ARM64 (Raspberry Pi) | `echoex-node-linux-arm64` |
| macOS Intel | `echoex-node-macos-x64` |
| macOS Apple Silicon | `echoex-node-macos-arm64` |
| Windows | `echoex-node-windows-x64.exe` |

```bash
chmod +x echoex-node-linux-x64
./echoex-node-linux-x64 --token <YOUR_TOKEN> --chamber <CHAMBER_CODE>
```

---

### 2. Docker

```bash
docker run -d \
  --name echoex-node \
  --restart unless-stopped \
  -e ECHOEX_TOKEN=your_token \
  -e ECHOEX_CHAMBER=your_room_code \
  echoex/node:latest
```

---

### 3. Docker Compose

```yaml
version: '3.8'

services:
  echoex-node:
    image: echoex/node:latest
    restart: unless-stopped
    environment:
      - ECHOEX_TOKEN=your_token
      - ECHOEX_CHAMBER=your_room_code
```

Start the container:
```bash
docker compose up -d
```

---

## ⚙️ Configuration Reference

| Flag | Environment Variable | Default | Description |
| :--- | :--- | :--- | :--- |
| `--token` | `ECHOEX_TOKEN` | *(Required)* | Secret node token generated from Chamber Settings |
| `--chamber` | `ECHOEX_CHAMBER` | *(Required)* | 8-character Chamber Room Code |
| `--name` | `ECHOEX_NAME` | `Echoex Node` | Friendly anchor display name in the Member List |
| `--host` | `ECHOEX_HOST` | `bulkmetadataeditor.com` | Signaling server host |
| `--reconnect-delay` | `ECHOEX_RECONNECT_DELAY` | `5` | Delay in seconds before reconnecting on disconnect |

---

---

## 🧩 Echoex Add-ons Library

Echoex Chambers can be extended with privacy-respecting, zero-tracking third-party integrations (Piped, Invidious, LibreTranslate, PrivateBin, custom REST APIs).

- **Catalog & Specs**: See [`addons/README.md`](./addons/README.md)
- **Official Registry**: See [`addons/catalog.json`](./addons/catalog.json)
- **Contributing & Submissions**: See [`addons/CONTRIBUTING.md`](./addons/CONTRIBUTING.md)

---

## 🔒 Security & Privacy Guarantee

- **Zero Content Storage**: The anchor daemon never writes chat messages, decryption keys, or metadata to disk.
- **Zero Inspection**: Does not inspect, decrypt, or log any message payloads.
- **End-to-End Encrypted**: Operates purely as a headless signaling presence.
- **Client-Side Add-ons**: Add-on queries execute client-to-instance directly without intermediate logging.

---

## 📜 License

Licensed under the [Apache License, Version 2.0](LICENSE).
