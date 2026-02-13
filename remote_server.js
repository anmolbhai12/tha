const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const WhatsAppBot = require('./whatsapp');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8100;
const HOST = process.env.IP || '0.0.0.0';
const logFile = path.join(__dirname, 'boot.log');
const messageLogs = []; // Store last 20 messages for debugging

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname, {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        // FORCE NO CACHE FOR EVERYTHING
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('Surrogate-Control', 'no-store');
    }
})); // Serve static files from the current directory

const bot = new WhatsAppBot();

console.log('🚀 Starting Tha WhatsApp Bot...');
bot.initialize().catch(err => {
    const msg = `❌ Initialization failed: ${err.message}`;
    console.error(msg);
    try { fs.appendFileSync(logFile, `${msg}\n`); } catch (e) { }
});

app.get('/bot', (req, res) => {
    res.json({
        status: 'online',
        service: 'Tha WhatsApp OTP Bot',
        version: '2.5.0'
    });
});

app.get('/status', async (req, res) => {
    const status = bot.getStatus();
    status.version = '2.5.0-ANTIGRAVITY';
    status.account = 'dalaalstreetss';

    if (!status.connected && status.qrCode) {
        try {
            const qrImage = await QRCode.toDataURL(status.qrCode);
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>WhatsApp QR Code</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; }
                        .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
                        img { margin-top: 1rem; max-width: 100%; border: 1px solid #ddd; }
                        h1 { color: #128c7e; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>Link WhatsApp</h1>
                        <p>Scan this QR code with WhatsApp to connect:</p>
                        <img src="${qrImage}" alt="QR Code" />
                        <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">Settings > Linked Devices > Link a Device</p>
                    </div>
                    <script>setTimeout(() => location.reload(), 5000);</script>
                </body>
                </html>
            `);
        } catch (err) {
            console.error('Error generating QR image:', err);
        }
    }

    res.json(status);
});

app.get('/debug', (req, res) => {
    res.json({
        status: bot.getStatus(),
        logs: messageLogs
    });
});

app.all('/send-otp', async (req, res) => {
    const phone = req.query.phone || req.body.phone;
    const message = req.query.message || req.body.message;
    console.log(`📩 Incoming OTP request: phone=${phone}`);
    try {
        if (!phone || !message) {
            return res.status(400).json({ error: 'Missing phone or message' });
        }
        if (!bot.isConnected) {
            return res.status(503).json({ error: 'WhatsApp not connected. Visit /status' });
        }
        const result = await bot.sendMessage(phone, message);
        console.log(`✅ Message Dispatched: id=${result.messageId} to ${phone}`);
        messageLogs.push({
            time: new Date().toISOString(),
            phone,
            message,
            success: true,
            id: result.messageId,
            details: result
        });
        if (messageLogs.length > 20) messageLogs.shift();
        res.json(result);
    } catch (error) {
        console.error(`❌ Send Error: ${error.message} for ${phone}`);
        res.status(500).json({ error: error.message });
    }
});

app.post('/client-log', (req, res) => {
    const { msg, data } = req.body;
    const logEntry = `[CLIENT] ${new Date().toISOString()} - ${msg} - ${JSON.stringify(data)}\n`;
    console.log(logEntry.trim());
    try { fs.appendFileSync(path.join(__dirname, 'client_debug.log'), logEntry); } catch (e) { }
    res.sendStatus(200);
});

app.get('/client-logs', (req, res) => {
    try {
        const logs = fs.readFileSync(path.join(__dirname, 'client_debug.log'), 'utf8');
        res.send(`<pre>${logs}</pre>`);
    } catch (e) {
        res.send('No client logs yet.');
    }
});

app.all('/send-msg', async (req, res) => {
    const phone = req.query.phone || req.body.phone;
    const message = req.query.message || req.body.message;
    console.log(`📩 Incoming professional message: phone=${phone}`);
    try {
        if (!phone || !message) {
            return res.status(400).json({ error: 'Missing phone or message' });
        }
        if (!bot.isConnected) {
            return res.status(503).json({ error: 'WhatsApp not connected' });
        }
        const result = await bot.sendMessage(phone, message);
        messageLogs.push({
            time: new Date().toISOString(),
            phone,
            message: "[Professional Update]",
            success: true,
            id: result.messageId
        });
        if (messageLogs.length > 20) messageLogs.shift();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/ping', (req, res) => {
    res.send('pong');
});

const server = http.createServer(app);
server.listen(PORT, '::', () => {
    const msg = `✅ Server listening on port ${PORT} (Dual-Stack)`;
    console.log(msg);
    try { fs.appendFileSync(logFile, `${msg}\n`); } catch (e) { }
});

process.on('uncaughtException', (err) => {
    try { fs.appendFileSync(logFile, `💥 Uncaught Exception: ${err.message}\n${err.stack}\n`); } catch (e) { }
    process.exit(1);
});
