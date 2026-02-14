import ftplib

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_FILE = 'www/server.js'
LOCAL_FILE = 'server_check.js'

def check_server_file():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        print(f"Downloading {REMOTE_FILE}...")
        with open(LOCAL_FILE, 'wb') as f:
            ftp.retrbinary(f'RETR {REMOTE_FILE}', f.write)
            
        with open(LOCAL_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'multer' in content:
                print("✅ Remote server.js contains 'multer'. Code IS updated on disk.")
            else:
                print("❌ Remote server.js DOES NOT contain 'multer'. Code is OLD on disk.")
                
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_server_file()
