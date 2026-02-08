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
                printQRInTerminal: true,
                logger: pino({ level: 'info' }),
                browser: ['DalaalStreet OTP', 'Chrome', '1.0.0']
            });

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qr = qr;
                    console.log('\n📱 DALAALSTREET - SCAN THIS QR CODE:\n');
                    qrcode.generate(qr, { small: true });
                }

                if (connection === 'close') {
                    const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
                    if (shouldReconnect) setTimeout(() => this.initialize(), 3000);
                    else this.isConnected = false;
                } else if (connection === 'open') {
                    console.log('✅ DalaalStreet WhatsApp Connected!');
                    this.isConnected = true;
                    this.qr = null;
                }
            });

            this.sock.ev.on('creds.update', saveCreds);

        } catch (error) {
            console.error('❌ Error initializing WhatsApp:', error);
            throw error;
        }
    }

    async sendMessage(phoneNumber, message) {
        try {
            if (!this.isConnected) throw new Error('WhatsApp not connected');

            const formattedNumber = phoneNumber.includes('@s.whatsapp.net')
                ? phoneNumber
                : `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;

            const result = await this.sock.sendMessage(formattedNumber, { text: message });
            return {
                success: true,
                messageId: result.key.id
            };
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    }

    getStatus() {
        return {
            connected: this.isConnected,
            qrCode: this.qr
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
