# DalaalStreet WhatsApp Bot 🏰

This is the dedicated WhatsApp OTP sender for **DalaalStreet**.
It runs on **Alwaysdata** and uses `@whiskeysockets/baileys` to connect.

## 🚀 How to deploy (Alwaysdata)

1. **Create a new Service**:
   - Log into Alwaysdata.
   - Create a new **Site** (Type: Node.js).
   - Suggested URL: `aurelio-bot.alwaysdata.net` (keeping the username for now).

2. **Upload Files**:
   - Use FTP to upload everything in this `whatsapp-bot` folder to the new site.

3. **Install Dependencies**:
   - Run `npm install` in your new site's directory via SSH/Terminal on Alwaysdata.

4. **Connect WhatsApp**:
   - Visit the `/status` page of your new site.
   - **Scan the QR code** with the phone number you want to use for DalaalStreet.

5. **Update Google Script**:
   - Once live, copy the new site's URL and update it in your `whatsapp_sync.gs` file.
   - Use `http://` instead of `https://` if you don't have SSL configured.

DalaalStreet is now connected to its own dedicated WhatsApp number! 🏰✨
