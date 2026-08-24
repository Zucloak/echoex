# 🧩 Echoex Chamber Add-ons

Welcome to the official open-source repository and catalog for **Echoex Chamber Add-ons**.

Echoex Add-ons allow users and chamber hosts to extend their ephemeral WebRTC mesh chambers with privacy-respecting, zero-tracking third-party services and utilities directly inside chat.

---

## 🛡️ Core Architecture & Privacy Principles

1. **100% Client-Side Execution**:
   - Add-on requests are initiated directly from the user's browser via standard browser `fetch` or rendered via sandboxed `<iframe>`.
   - No data is ever relayed through a central BME or Echoex server.
2. **Bring-Your-Own-Instance (BYOI)**:
   - Echoex does NOT operate public instances of upstream services.
   - Users and hosts provide their own self-hosted or trusted instance URL (e.g. self-hosted Piped, Invidious, LibreTranslate, PrivateBin).
   - Instance URLs and secrets are saved locally in the browser's IndexedDB and are never shared across the network.
3. **Open Catalog & Community Vouching**:
   - Anyone can submit new add-on templates or vouch for existing integrations via Pull Requests in this repository.

---

## 📦 Supported Add-on Response Types

| Response Type | Description | Example Use Case |
|:---|:---|:---|
| `list` | JSON API returning an array of items (titles, subtitles, URLs). Displayed as interactive cards with play/open buttons. | Piped music search, Invidious video search |
| `text` | JSON or plain text API response (e.g. translated string). Displayed cleanly inside chat output. | LibreTranslate |
| `embed` | Embeddable interactive UI rendered in a secure, sandboxed frame. | PrivateBin paste sharing |
| `iframe` | Full sandboxed web interface panel. | Custom web tools |

---

## 🚀 How to Use in Echoex

1. In any Echoex Chamber, open **Chamber Settings** (`⚙️`) -> **Add-ons**.
2. Click **Add from Library** to choose a pre-configured template, or click **Custom Add-on** to connect any REST API.
3. Enter your private instance URL (e.g. `https://piped.yourdomain.com`).
4. In any chamber channel, type `@<command> <query>` (e.g. `@piped lofi hip hop` or `@translate Bonjour le monde`) to execute the integration!

---

## 🤝 Contributing & Submitting Add-ons

Want to add a new add-on template to the official catalog? Read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide.
