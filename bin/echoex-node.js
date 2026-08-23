#!/usr/bin/env node

const args = process.argv.slice(2);
function getArg(flag, shortFlag, envVar) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag || (shortFlag && args[i] === shortFlag)) {
      return args[i + 1];
    }
    if (args[i].startsWith(flag + '=')) {
      return args[i].split('=')[1];
    }
  }
  return process.env[envVar] || '';
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  ======================================================
     Echoex Node Anchor Daemon (24/7 Mesh Relay)
  ======================================================

  Usage:
    echoex-node --token <TOKEN> --chamber <CHAMBER_CODE> [options]

  Options:
    -t, --token <string>      Node authentication token (required)
    -c, --chamber <string>    Chamber room code (required)
    -s, --server <url>        Signaling server host (default: https://bulkmetadataeditor.com)
    -n, --name <string>       Friendly node name (default: Echoex Node)
    --no-relay                Disable WebRTC blind relay donation
    -v, --version             Show version
    -h, --help                Show help screen

  Environment Variables:
    ECHOEX_TOKEN              Node authentication token
    ECHOEX_CHAMBER            Chamber room code
    ECHOEX_SERVER             Signaling server URL
    ECHOEX_NODE_NAME          Friendly node name
  `);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  const pkg = require('../package.json');
  console.log(`echoex-node v${pkg.version}`);
  process.exit(0);
}

const token = getArg('--token', '-t', 'ECHOEX_TOKEN');
const chamber = getArg('--chamber', '-c', 'ECHOEX_CHAMBER');
const server = getArg('--server', '-s', 'ECHOEX_SERVER') || 'https://bulkmetadataeditor.com';
const name = getArg('--name', '-n', 'ECHOEX_NODE_NAME') || 'Echoex Node';
const disableRelay = args.includes('--no-relay') || process.env.ECHOEX_DISABLE_RELAY === 'true';

if (!token || !chamber) {
  console.error('\x1b[31m[ERROR] Missing required arguments: --token and --chamber are required.\x1b[0m');
  console.error('Run \x1b[36mechoex-node --help\x1b[0m for usage details.');
  process.exit(1);
}

const { runDaemon } = require('../src/daemon');
runDaemon({ token, chamber, server, name, enableRelay: !disableRelay });
