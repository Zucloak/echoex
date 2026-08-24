# 🤝 Contributing to Echoex Add-ons

Thank you for your interest in contributing to the open-source **Echoex Add-ons Catalog**!

This catalog provides built-in templates that allow Echoex Chamber members to easily connect self-hosted, privacy-first services directly into their ephemeral WebRTC chat.

---

## 📋 Contribution Guidelines

To ensure security, privacy, and seamless usability for all users, all submitted add-on templates must adhere to the following rules:

### 1. Privacy & Zero-Knowledge First
- Add-ons must **never** send telemetry, tracking cookies, or user identifiers to central servers.
- The service must support self-hosting by individuals (e.g. Docker, Raspberry Pi, VPS).
- Plaintext API endpoints must support HTTPS.

### 2. CORS Compatibility
- The upstream API or instance should support Cross-Origin Resource Sharing (`CORS`) so that browser clients can query it directly without requiring a server-side proxy.

### 3. Template Format
Add your new template entry to [`catalog.json`](./catalog.json) following this JSON schema:

```json
{
  "templateId": "unique_id",
  "displayName": "Friendly Service Name",
  "description": "Short explanation of what the integration does.",
  "category": "media | productivity | utility | custom",
  "defaultName": "command_prefix",
  "instanceUrlPlaceholder": "https://service.your-domain.com",
  "instanceUrlLabel": "Your Service instance URL",
  "endpoints": {
    "search": "/api/search?q={query}",
    "action": "/api/action"
  },
  "responseType": "list | text | embed | iframe",
  "disclaimer": "Legal notice regarding third-party service usage.",
  "learnMoreUrl": "https://github.com/upstream-repo/project"
}
```

---

## 🛠️ Submission Process

1. Fork this repository: `https://github.com/Zucloak/echoex`.
2. Create a new branch: `git checkout -b feat/add-my-addon`.
3. Add your template definition to `addons/catalog.json` and document it in `addons/README.md`.
4. Open a Pull Request with details about:
   - What the service does
   - Upstream open-source project repository
   - Verification that it works client-side over HTTPS with CORS.

---

## 📜 License

By submitting a contribution, you agree that your contribution is licensed under the [Apache License 2.0](../LICENSE).
