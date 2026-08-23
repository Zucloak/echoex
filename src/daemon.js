// Use global WebSocket if available (Node >= 21), fallback to ws package
const WS = globalThis.WebSocket || (() => {
  try { return require('ws'); } catch (e) {
    console.error('[ERROR] WebSocket implementation not found. Install dependencies with npm install.');
    process.exit(1);
  }
})();

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function runDaemon({ token, chamber, server, name, enableRelay = true }) {
  const cleanServer = server.replace(/^http/, 'ws').replace(/\/+$/, '');
  const wsUrl = `${cleanServer}/api/share/signaling?code=${chamber}&type=node&token=${token}`;

  console.log('\x1b[36m' + '='.repeat(62) + '\x1b[0m');
  console.log('  \x1b[1m\x1b[35mEchoex Node Anchor Daemon\x1b[0m \x1b[32m[Online Mesh Mode]\x1b[0m');
  console.log('\x1b[36m' + '='.repeat(62) + '\x1b[0m');
  console.log(`  • \x1b[1mNode Name:\x1b[0m     ${name}`);
  console.log(`  • \x1b[1mChamber Room:\x1b[0m  ${chamber}`);
  console.log(`  • \x1b[1mSignaling:\x1b[0m     ${cleanServer}`);
  console.log(`  • \x1b[1mToken Preview:\x1b[0m ${token.substring(0, 8)}...`);
  console.log(`  • \x1b[1mRelay Karma:\x1b[0m   ${enableRelay ? 'Enabled (Donating bandwidth)' : 'Disabled'}`);
  console.log('\x1b[36m' + '='.repeat(62) + '\x1b[0m\n');

  let ws = null;
  let isConnected = false;
  let connectTime = null;
  let heartbeatTimer = null;
  let reconnectAttempts = 0;
  let rtt = 0;
  let lastPingSent = 0;

  function connect() {
    console.log(`[\x1b[34m${new Date().toLocaleTimeString()}\x1b[0m] Connecting to signaling server...`);
    
    ws = new WS(wsUrl);

    const onOpen = () => {
      isConnected = true;
      connectTime = Date.now();
      reconnectAttempts = 0;
      console.log(`[\x1b[32m${new Date().toLocaleTimeString()}\x1b[0m] \x1b[32m✓ Successfully authenticated with Chamber DO.\x1b[0m`);
      console.log(`[\x1b[32m${new Date().toLocaleTimeString()}\x1b[0m] 24/7 Anchor is ACTIVE. Chamber stays in DO memory.`);

      if (heartbeatTimer) clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(sendHeartbeat, 15000);
      sendHeartbeat();
    };

    const onMessage = (event) => {
      try {
        const rawData = typeof event.data !== 'undefined' ? event.data : event;
        const msg = JSON.parse(rawData.toString());
        
        if (msg.type === 'node_ping') {
          ws.send(JSON.stringify({ type: 'node_pong', timestamp: msg.timestamp || Date.now() }));
          return;
        }

        if (msg.type === 'node_pong') {
          if (lastPingSent > 0) {
            rtt = Math.max(1, Date.now() - lastPingSent);
          }
          return;
        }

        if (msg.type === 'chamber_ttl_extended') {
          console.log(`[\x1b[35m${new Date().toLocaleTimeString()}\x1b[0m] Chamber TTL extended by ${msg.lastExtendedBy || 'Host'}.`);
          return;
        }

        if (msg.type === 'chamber_ttl_auto_renewed') {
          console.log(`[\x1b[36m${new Date().toLocaleTimeString()}\x1b[0m] Chamber TTL auto-renewed (${msg.autoRenewalsRemaining} grace renewals remaining).`);
          return;
        }

        if (msg.type === 'node_authenticated') {
          console.log(`[\x1b[32m${new Date().toLocaleTimeString()}\x1b[0m] Node acknowledged as "${msg.name}" for Chamber ${msg.chamberRoomCode}.`);
          return;
        }
      } catch (e) {}
    };

    const onClose = (eventOrCode, reasonStr) => {
      isConnected = false;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      const code = typeof eventOrCode === 'object' ? eventOrCode.code : eventOrCode;
      const reason = typeof eventOrCode === 'object' ? eventOrCode.reason : reasonStr;
      console.warn(`[\x1b[33m${new Date().toLocaleTimeString()}\x1b[0m] Connection closed (${code}): ${reason || 'Server disconnected'}`);
      scheduleReconnect();
    };

    const onError = (err) => {
      console.error(`[\x1b[31m${new Date().toLocaleTimeString()}\x1b[0m] WebSocket error:`, err.message || err);
    };

    if (typeof ws.addEventListener === 'function') {
      ws.addEventListener('open', onOpen);
      ws.addEventListener('message', onMessage);
      ws.addEventListener('close', onClose);
      ws.addEventListener('error', onError);
    } else if (typeof ws.on === 'function') {
      ws.on('open', onOpen);
      ws.on('message', (data) => onMessage({ data }));
      ws.on('close', onClose);
      ws.on('error', onError);
    }
  }

  function sendHeartbeat() {
    if (!ws || ws.readyState !== 1) return;
    
    lastPingSent = Date.now();
    ws.send(JSON.stringify({
      type: 'node_heartbeat_ack',
      rtt,
      packetLoss: 0,
      timestamp: lastPingSent
    }));

    const uptimeSecs = Math.floor((Date.now() - (connectTime || Date.now())) / 1000);
    process.stdout.write(`\r[\x1b[32m${new Date().toLocaleTimeString()}\x1b[0m] Anchor Running | Uptime: ${formatUptime(uptimeSecs)} | RTT: ${rtt}ms   `);
  }

  function scheduleReconnect() {
    reconnectAttempts++;
    const delay = Math.min(30000, 1000 * Math.pow(1.5, Math.min(reconnectAttempts, 8)));
    console.log(`[\x1b[34m${new Date().toLocaleTimeString()}\x1b[0m] Reconnecting in ${Math.round(delay / 1000)}s (Attempt #${reconnectAttempts})...`);
    setTimeout(connect, delay);
  }

  process.on('SIGINT', () => {
    console.log('\n\n[Echoex] Shutting down node anchor...');
    if (ws && ws.readyState === 1) {
      ws.close(1000, 'Node anchor stopped by user');
    }
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n[Echoex] Terminating node anchor...');
    if (ws && ws.readyState === 1) {
      ws.close(1000, 'Node anchor terminated');
    }
    process.exit(0);
  });

  connect();
}

module.exports = { runDaemon };
