const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const QRCode = require('qrcode');
const WhatsAppBot = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('PORT config:', PORT);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - prevent spam
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: {
        status: 'error',
        message: 'Too many requests. Please try again later.'
    }
});

app.use('/send-otp', limiter);

// Initialize WhatsApp bot
const bot = new WhatsAppBot();

// Start bot initialization
console.log('🚀 Starting DalaalStreet WhatsApp Bot...');
bot.initialize().then(() => {
    console.log('✅ Bot initialization started successfully');
}).catch(err => {
    console.error('❌ Failed to initialize bot:', err);
});

// Routes

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        service: 'DalaalStreet WhatsApp OTP Bot',
        version: '1.0.0'
    });
});

// Get bot status and QR code
app.get('/status', async (req, res) => {
    const status = bot.getStatus();

    if (!status.connected && status.qrCode) {
        try {
            const qrImage = await QRCode.toDataURL(status.qrCode);
            return res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>DalaalStreet | WhatsApp Connection</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #ffffff; }
                        .card { background: white; padding: 2.5rem; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; border: 1px solid #c5a05933; }
                        img { margin-top: 1.5rem; max-width: 100%; border-radius: 10px; }
                        h1 { color: #c5a059; margin-bottom: 0.5rem; }
                        p { color: #475569; }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>DalaalStreet Bot</h1>
                        <p>Scan this QR code with WhatsApp to connect:</p>
                        <img src="${qrImage}" alt="QR Code" />
                        <p style="margin-top: 1.5rem; font-size: 0.9rem; color: #94a3b8;">Settings > Linked Devices > Link a Device</p>
                    </div>
                    <script>
                        setTimeout(() => location.reload(), 5000);
                    </script>
                </body>
                </html>
            `);
        } catch (err) {
            console.error('Error generating QR image:', err);
        }
    }

    res.json({
        status: 'success',
        ...status,
        message: status.connected ? 'WhatsApp is connected' : 'Connecting...'
    });
});

// Send OTP message (POST)
app.post('/send-otp', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        }

        if (!bot.isConnected) {
            return res.status(503).json({ status: 'error', message: 'Bot not connected' });
        }

        const result = await bot.sendMessage(phone, message);
        res.json({ status: 'success', data: result });

    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Send OTP message (GET) for simple triggers
app.get('/send-otp', async (req, res) => {
    try {
        const { phone, message } = req.query;
        if (!phone || !message) return res.status(400).json({ status: 'error', message: 'Missing parameters' });
        if (!bot.isConnected) return res.status(503).json({ status: 'error', message: 'Bot not connected' });

        const result = await bot.sendMessage(phone, message);
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Start server
console.log('Attempting to start server on port:', PORT);
app.listen(PORT, () => {
    console.log(`\n✅ DalaalStreet Bot running on port ${PORT}`);
});
