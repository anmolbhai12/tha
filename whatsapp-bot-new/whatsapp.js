const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const path = require('path');

class WhatsAppBot {
    constructor() {
        this.sock = null;
        this.qr = null;
        this.isConnected = false;
        this.authFolder = path.join(__dirname, 'auth_info');
        this.sessions = new Map(); // Store chat sessions: code -> { buyer, seller, propertyId }
        this.userSessions = new Map(); // buyerNumber -> lastCode
    }

    async initialize() {
        try {
            if (!fs.existsSync(this.authFolder)) {
                fs.mkdirSync(this.authFolder, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(this.authFolder);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: ['Tha OTP', 'Chrome', '1.0.0']
            });

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qr = qr;
                    console.log('\n📱 SCAN THIS QR CODE WITH WHATSAPP:\n');
                    qrcode.generate(qr, { small: true });
                }

                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    console.log('❌ Connection closed. Reconnecting:', shouldReconnect);

                    if (shouldReconnect) {
                        setTimeout(() => this.initialize(), 3000);
                    } else {
                        this.isConnected = false;
                    }
                } else if (connection === 'open') {
                    console.log('✅ WhatsApp Connected Successfully!');
                    this.isConnected = true;
                    this.qr = null;
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

            // Listen for incoming messages
            this.sock.ev.on('messages.upsert', async (m) => {
                if (m.type === 'notify') {
                    for (const msg of m.messages) {
                        if (!msg.key.fromMe && msg.message) {
                            await this.handleIncomingMessage(msg);
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error initializing WhatsApp:', error);
            // Don't re-throw, let the server live without the bot
            this.isConnected = false;
        }
    }

    async sendMessage(phoneNumber, message) {
        try {
            if (!this.isConnected) {
                throw new Error('WhatsApp not connected. Please scan QR code first.');
            }

            let cleaned = phoneNumber.replace(/\D/g, '');
            if (cleaned.length === 10) {
                cleaned = '91' + cleaned;
            }
            const formattedNumber = phoneNumber.includes('@s.whatsapp.net')
                ? phoneNumber
                : `${cleaned}@s.whatsapp.net`;

            const result = await this.sock.sendMessage(formattedNumber, {
                text: message
            });

            console.log(`✅ Message sent to ${phoneNumber}`);
            return {
                success: true,
                messageId: result.key.id,
                timestamp: result.messageTimestamp
            };

        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    async handleIncomingMessage(msg) {
        const from = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();

        if (!text) return;
        console.log(`📩 Incoming from ${from}: ${text}`);

        // 1. Handle "Property #ID" (Buyer Initiation)
        const inquiryMatch = text.match(/Property #(\d+)/i);
        if (inquiryMatch) {
            const propId = inquiryMatch[1];
            await this.handleInquiry(from, propId, text);
            return;
        }

        // 2. Handle "@reply #CODE [message]" (Seller or Buyer Response)
        const replyMatch = text.match(/^@reply #(\d+) (.+)/is);
        if (replyMatch) {
            const code = replyMatch[1];
            const content = replyMatch[2];
            await this.handleRelay(from, code, content);
            return;
        }

        // 3. Default Help message
        if (text.toLowerCase() === 'help') {
            await this.sendMessage(from, "*THA PRIVATE CHAT HELP*\n\nTo inquire about a property: Send 'Property #ID'\nTo reply to a chat: Send '@reply #CODE [your message]'\n\nThis keeps your personal number hidden! 🛡️");
        }
    }

    async handleInquiry(buyerJid, propertyId, fullText) {
        try {
            const DATA_FILE = path.join(__dirname, 'properties.json');
            if (!fs.existsSync(DATA_FILE)) return;

            const properties = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            const prop = properties.find(p => p.id == propertyId);

            if (!prop || !prop.mobile) {
                await this.sendMessage(buyerJid, "⚠️ Sorry, I couldn't find that property or the seller details are missing.");
                return;
            }

            // Generate a random 4-digit session code
            const code = Math.floor(1000 + Math.random() * 9000).toString();
            const sellerJid = prop.mobile.replace(/\D/g, '').length === 10
                ? `91${prop.mobile.replace(/\D/g, '')}@s.whatsapp.net`
                : `${prop.mobile.replace(/\D/g, '')}@s.whatsapp.net`;

            // Store session
            this.sessions.set(code, { buyer: buyerJid, seller: sellerJid, propId: propertyId });

            // Notify Buyer
            await this.sendMessage(buyerJid, `🛡️ *THA PRIVACY RELAY*\n\nYour message for *${prop.title}* has been sent anonymously to the seller.\n\nYour Session Code is: *#${code}*\nWhen you receive a reply, use: \`@reply #${code} [message]\` to answer.`);

            // Notify Seller
            await this.sendMessage(sellerJid, `🔔 *NEW ENQUIRY - Property #${propertyId}*\n\nSomeone is interested in: *${prop.title}*\n\n*Buyer says:* "${fullText}"\n\nTo reply anonymously, send:\n\`@reply #${code} [Your Message]\`\n\n(The buyer will NOT see your phone number) 🕵️`);

        } catch (e) {
            console.error("Error handling inquiry:", e);
        }
    }

    async handleRelay(fromJid, code, content) {
        const session = this.sessions.get(code);
        if (!session) {
            await this.sendMessage(fromJid, "❌ Error: Invalid or expired Chat Code. Please check the code and try again.");
            return;
        }

        const isSeller = fromJid === session.seller;
        const targetJid = isSeller ? session.buyer : session.seller;
        const senderLabel = isSeller ? "SELLER" : "BUYER";

        await this.sendMessage(targetJid, `💬 *PRIVACY CHAT (#${code})*\n*${senderLabel}:* ${content}\n\n*To reply:* \`@reply #${code} [message]\``);
        await this.sendMessage(fromJid, "✅ Message relayed matching code #" + code);
    }

    getStatus() {
        return {
            connected: this.isConnected,
            qrCode: this.qr,
            needsQR: !this.isConnected && !this.qr
        };
    }

    async disconnect() {
        if (this.sock) {
            await this.sock.logout();
            this.isConnected = false;
        }
    }
}

module.exports = WhatsAppBot;
