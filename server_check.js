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
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
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

// --- PERSISTENCE LAYER ---

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

const DATA_FILE = path.join(__dirname, 'properties.json');

// Helper to read properties
const readProperties = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return []; // Return empty array if file doesn't exist
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading properties:', err);
        return [];
    }
};

// Helper to save properties
const saveProperties = (properties) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2));
        return true;
    } catch (err) {
        console.error('Error saving properties:', err);
        return false;
    }
};

const multer = require('multer');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// GET /properties
app.get('/properties', (req, res) => {
    const properties = readProperties();
    res.json(properties);
});

// POST /properties
app.post('/properties', upload.array('media'), (req, res) => {
    try {
        console.log('📦 Received property POST request');

        // Parse the property data (it comes as a JSON string in 'data' field or individual fields)
        let propertyData = req.body;

        // If data is sent as a stringified JSON field (common with FormData/JSON mixing)
        if (req.body.data) {
            try {
                propertyData = JSON.parse(req.body.data);
            } catch (e) {
                console.error("Error parsing body.data:", e);
            }
        }

        // Validate basic data
        if (!propertyData || !propertyData.seller || !propertyData.mobile) {
            return res.status(400).json({ error: 'Invalid property data' });
        }

        const newProperty = {
            ...propertyData,
            id: undefined, // Will be set below
            media: []
        };

        // Handle Uploaded Files
        if (req.files && req.files.length > 0) {
            const uploadedMedia = req.files.map(file => ({
                type: file.mimetype.startsWith('video') ? 'video' : 'image',
                url: `https://dalaalstreetss.alwaysdata.net/uploads/${file.filename}`
            }));
            newProperty.media = uploadedMedia;

            // Set legacy image field
            if (uploadedMedia.length > 0) {
                newProperty.image = uploadedMedia[0].url;
            }
        } else {
            // Fallback if no media uploaded (or handled purely as JSON without files)
            newProperty.media = [];
        }

        const properties = readProperties();

        // Assign ID and Timestamp
        newProperty.id = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
        newProperty.createdAt = new Date().toISOString();

        // Ensure numeric fields are numbers
        ['price', 'beds', 'baths', 'sqft'].forEach(field => {
            if (newProperty[field]) newProperty[field] = parseInt(newProperty[field]);
        });

        properties.unshift(newProperty); // Add to top
        saveProperties(properties);

        console.log(`✅ New Property Saved: ${newProperty.title} by ${newProperty.seller}`);
        res.status(201).json(newProperty);

    } catch (err) {
        console.error('Error saving property:', err);
        res.status(500).json({ error: 'Failed to save property' });
    }
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
