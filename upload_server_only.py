import ftplib
import os

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www'
LOCAL_FILE = 'whatsapp-bot-new/server.js'

def upload_server():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        ftp.cwd(REMOTE_DIR)
        
        print("Uploading server.js...")
        with open(LOCAL_FILE, 'rb') as f:
            ftp.storbinary('STOR server.js', f)
            
        print("Upload complete.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    upload_server()
