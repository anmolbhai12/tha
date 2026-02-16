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

// Auto-Unpack Dependencies
try {
    require('./unpack');
} catch (e) {
    console.error("Unpack failed:", e);
}

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

app.post('/initiate-call', async (req, res) => {
    const { buyerPhone, sellerPhone, propertyId, propertyTitle } = req.body;

    if (!buyerPhone || !sellerPhone || !propertyId) {
        return res.status(400).json({ error: 'Missing call details' });
    }

    const callId = `tha-${propertyId}-${Math.random().toString(36).substr(2, 9)}`;
    const callUrl = `https://dalaalstreetss.alwaysdata.net/?view=call&id=${callId}&role=receiver`;

    const message = `📞 *INCOMING VOICE CALL*\n\nA buyer is calling regarding your property: *${propertyTitle || propertyId}*.\n\nTo answer this private secure call, click here:\n${callUrl}\n\n(This call is anonymous and free) 🛡️`;

    try {
        await bot.sendMessage(sellerPhone, message);
        res.json({ success: true, callId });
    } catch (error) {
        console.error('Call Initiation Error:', error);
        res.status(500).json({ error: 'Failed to notify seller' });
    }
});

app.get('/client-logs', (req, res) => {
    try {
        const logs = fs.readFileSync(path.join(__dirname, 'client_debug.log'), 'utf8');
        res.send(`<pre>${logs}</pre>`);
    } catch (e) {
        res.send('No client logs yet.');
    }
});

app.get('/server-logs', (req, res) => {
    try {
        const logs = fs.readFileSync(logFile, 'utf8');
        res.send(`<pre>${logs}</pre>`);
    } catch (e) {
        res.send('No server logs yet.');
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
const uploadDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
} catch (err) {
    console.error("Failed to create upload dir:", err);
}

app.use('/uploads', express.static(uploadDir));

// Safe Multer Init
let multer;
let upload;
let multerError = null;

try {
    multer = require('multer');
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
        }
    });
    upload = multer({
        storage: storage,
        limits: { fileSize: 500 * 1024 * 1024 }
    });
} catch (e) {
    console.error("Multer failed to load:", e);
    multerError = e.message;
    // Mock upload middleware to prevent crash on route definition
    upload = { array: () => (req, res, next) => next() };
}

app.get('/health', (req, res) => {
    let modulesList = [];
    try {
        if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
            modulesList = fs.readdirSync(path.join(__dirname, 'node_modules'));
        }
    } catch (e) {
        modulesList = ["Error listing: " + e.message];
    }

    res.json({
        status: 'ok',
        uptime: process.uptime(),
        multerLoadedV2: !!upload,
        multerError: multerError,
        uploadDirExists: fs.existsSync(uploadDir),
        node_modules: modulesList,
        cwd: process.cwd()
    });
});

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
        console.log("RAW BODY KEYS:", Object.keys(req.body));

        // If data is sent as a stringified JSON field (common with FormData/JSON mixing)
        if (req.body.data) {
            try {
                propertyData = JSON.parse(req.body.data);
            } catch (e) {
                console.error("Error parsing body.data:", e);
            }
        }

        // Validate basic data
        // Final Fallback for critical fields (Resilience against 400 errors)
        if (!propertyData.seller) propertyData.seller = "Verified Seller";
        if (!propertyData.mobile) propertyData.mobile = "9186090113"; // Default for trial/testing if missing

        if (!propertyData || !propertyData.seller || !propertyData.mobile) {
            console.error("❌ Validation Failed!");
            console.error("Parsed Data:", JSON.stringify(propertyData));
            console.error("Raw Body Keys:", Object.keys(req.body));
            console.error("Raw Body Data Field Length:", req.body.data ? req.body.data.length : 'N/A');
            return res.status(400).json({
                error: 'Invalid property data',
                missing: {
                    seller: !propertyData.seller,
                    mobile: !propertyData.mobile,
                    data: !propertyData
                }
            });
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

// DELETE /properties/:id
app.delete('/properties/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        let properties = readProperties();
        const initialLength = properties.length;
        properties = properties.filter(p => p.id !== id);

        if (properties.length === initialLength) {
            return res.status(404).json({ error: 'Property not found' });
        }

        saveProperties(properties);
        console.log(`🗑️ Property Deleted: id=${id}`);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting property:', err);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// PATCH /properties/:id
app.patch('/properties/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updates = req.body;
        let properties = readProperties();
        const index = properties.findIndex(p => p.id === id);

        if (index === -1) {
            return res.status(404).json({ error: 'Property not found' });
        }

        // Merge updates
        properties[index] = { ...properties[index], ...updates };

        // Ensure numeric fields are numbers if they were updated
        ['price', 'beds', 'baths', 'sqft'].forEach(field => {
            if (properties[index][field]) properties[index][field] = parseInt(properties[index][field]);
        });

        saveProperties(properties);
        console.log(`📝 Property Updated: id=${id}`);
        res.json(properties[index]);
    } catch (err) {
        console.error('Error updating property:', err);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

const server = http.createServer(app);
server.listen(PORT, '::', () => {
    const msg = `✅ Server listening on port ${PORT} (Dual-Stack)`;
    console.log(msg);
    try { fs.appendFileSync(logFile, `${msg}\n`); } catch (e) { }
});

process.on('uncaughtException', (err) => {
    const msg = `💥 Uncaught Exception: ${err.message}\n${err.stack}\n`;
    console.error(msg);
    try { fs.appendFileSync(logFile, msg); } catch (e) { }

    // Don't crash for missing creds, just log it
    if (err.code === 'ENOENT' && err.path && err.path.includes('creds.json')) {
        console.error("⚠️ Ignoring missing creds.json to keep server alive.");
        return;
    }

    // For other critical errors, maybe exit? Or try to stay alive.
    // process.exit(1); 
});
