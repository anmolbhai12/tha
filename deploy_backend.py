import os
import ftplib
import ssl

# FTP Credentials
HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www'

# Local paths
BASE_DIR = 'whatsapp-bot-new'
FILES_TO_UPLOAD = [
    ('server.js', 'server.js'),
    ('whatsapp.js', 'whatsapp.js'),
    ('package.json', 'package.json')
]

def upload_files():
    print(f"Connecting to {HOST}...")
    try:
        ftps = ftplib.FTP_TLS(HOST)
        ftps.login(USER, PASS)
        ftps.prot_p()
        
        print(f"Connected. Changing to {REMOTE_DIR}...")
        try:
            ftps.cwd(REMOTE_DIR)
        except:
            print(f"Directory {REMOTE_DIR} not found, creating...")
            ftps.mkd(REMOTE_DIR)
            ftps.cwd(REMOTE_DIR)

        # Upload files
        for local_name, remote_name in FILES_TO_UPLOAD:
            local_path = os.path.join(BASE_DIR, local_name)
            if os.path.exists(local_path):
                print(f"Uploading {local_name} -> {remote_name}...")
                with open(local_path, 'rb') as f:
                    ftps.storbinary(f'STOR {remote_name}', f)
                print(f"Uploaded {remote_name}")
            else:
                print(f"Skipping {local_name} (not found)")

        # Create uploads directory if not exists
        try:
            ftps.cwd('uploads')
            ftps.cwd('..')
        except:
            print("Creating uploads directory...")
            ftps.mkd('uploads')

        ftps.quit()
        print("Backend deployment complete.")
    except Exception as e:
        print(f"FTP Error: {e}")

if __name__ == "__main__":
    upload_files()
