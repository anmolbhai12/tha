import ftplib
import os

# --- CONFIGURATION ---
HOST = 'ftp-aurelio-bot.alwaysdata.net'
USER = 'aurelio-bot'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www'
LOCAL_BOT_DIR = 'whatsapp-bot'

def fix_bot():
    try:
        print(f"🚀 Connecting to {HOST}...")
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        ftp.cwd(REMOTE_DIR)
        print(f"📂 Entered {REMOTE_DIR}")

        # 1. Remove conflicting index.html if it exists
        try:
            print("🗑️ Removing conflicting index.html...")
            ftp.delete('index.html')
            print("✅ index.html removed!")
        except:
            print("ℹ️ No index.html found (or already removed).")

        # 2. Upload latest scripts
        files = ['server.js', 'whatsapp.js', 'package.json']
        for filename in files:
            local_path = os.path.join(LOCAL_BOT_DIR, filename)
            if os.path.exists(local_path):
                print(f"📤 Uploading {filename}...")
                with open(local_path, 'rb') as f:
                    ftp.storbinary(f'STOR {filename}', f)
            else:
                print(f"⚠️ {filename} not found locally!")

        ftp.quit()
        print("\n✅ Bot Server files updated!")
        print("👉 The 502 error should resolve shortly once Alwaysdata restarts the process.")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    fix_bot()
