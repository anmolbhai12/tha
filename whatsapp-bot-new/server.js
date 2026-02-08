const fs = require('fs');
const path = require('path');

// --- EARLY LOGGING ---
const logFile = path.join(__dirname, 'boot.log');
try {
    fs.writeFileSync(logFile, `🚀 Bot entry point reached at ${new Date().toISOString()}\n`);
    fs.appendFileSync(logFile, `📍 Port Env: ${process.env.PORT}\n`);
    fs.appendFileSync(logFile, `📍 Dir: ${__dirname}\n`);
} catch (e) {
    console.error('Failed to write boot log:', e);
}

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const http = require('http');

console.log('🚀 DalaalStreet Bot v2.0 Starting...');

// --- PORT CONFIGURATION ---
const PORT_RANGES = [3000, 8000, 8100, 8300]; // Ports to try // Replaced DEFAULT_PORT and FALLBACK_PORTS

// --- APP SETUP ---
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- BOT LOGIC ---
let sock;
let isConnected = false;
let qrCode = null;

async function startBot() {
    const authFolder = path.join(__dirname, 'auth_info');
    if (!fs.existsSync(authFolder)) fs.mkdirSync(authFolder, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }), // Minimal logs
        browser: ['DalaalStreet OTP', 'Chrome', '1.0.0'],
        markOnlineOnConnect: true
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrCode = qr; // Keep for API status
            console.log('\n\n=============================================================');
            console.log('🚨 SCAN THIS QR CODE TO LOGIN 🚨');
            console.log('=============================================================');
            qrcode.generate(qr, { small: true });
            console.log('=============================================================\n\n');
        }
        if (connection === 'close') {
            isConnected = false;
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            isConnected = true;
            qrCode = null;
            console.log('✅ WA Connected!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// --- API ROUTES ---
app.get('/', (req, res) => res.send('DalaalStreet Bot Online'));
app.get('/status', (req, res) => {
    res.json({
        status: isConnected ? 'connected' : 'disconnected',
        scanned: isConnected,
        qr: qrCode
    });
});

app.all('/send-otp', async (req, res) => {
    const phone = req.query.phone || req.body.phone;
    const message = req.query.message || req.body.message;

    if (!phone || !message) return res.status(400).json({ error: 'Missing phone or message' });
    if (!isConnected) return res.status(503).json({ error: 'Bot not connected' });

    try {
        const id = `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
        await sock.sendMessage(id, { text: message });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- SERVER START ---
function startServer() {
    const port = process.env.PORT || 8100;

    const server = http.createServer(app);

    // Bind to 0.0.0.0 as per Alwaysdata requirements
    server.listen(port, '0.0.0.0', () => {
        const msg = `✅ Server listening on port ${port}`;
        console.log(msg);
        try { fs.appendFileSync(logFile, `${msg}\n`); } catch (e) { }
        if (!sock) startBot();
    });

    server.on('error', (err) => {
        const msg = `❌ Server failed: ${err.message}`;
        console.error(msg);
        try { fs.appendFileSync(logFile, `${msg}\n`); } catch (e) { }
    });

    // Catch uncaught exceptions to log them
    process.on('uncaughtException', (err) => {
        try { fs.appendFileSync(logFile, `💥 Uncaught Exception: ${err.message}\n${err.stack}\n`); } catch (e) { }
        process.exit(1);
    });
}

startServer();
