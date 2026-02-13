import os
import ftplib

# FTP Credentials
HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www'
REMOTE_DIR = 'www'
LOCAL_DIR = '.' # Root directory
FILES_TO_UPLOAD = [
    ('server_remote_ver.js', 'server_remote_ver.js'),
    ('remote_server.js', 'remote_server.js'),
    ('whatsapp.js', 'whatsapp.js'),
    ('remote_package.json', 'package.json') # Upload as package.json
]

def upload_files(ftp):
    print(f"Uploading bot files from {LOCAL_DIR} to {REMOTE_DIR}...")
    
    # Ensure remote directory exists
    try:
        ftp.cwd(REMOTE_DIR)
    except:
        print(f"Creating remote directory {REMOTE_DIR}...")
        ftp.mkd(REMOTE_DIR)
        ftp.cwd(REMOTE_DIR)

    if not os.path.exists(LOCAL_DIR):
        print(f"Local dir {LOCAL_DIR} not found!")
        return

    for local_file, remote_file in FILES_TO_UPLOAD:
        local_path = os.path.join(LOCAL_DIR, local_file)
        if os.path.exists(local_path):
            with open(local_path, 'rb') as f:
                print(f"   - Uploading {local_file} as {remote_file}...")
                ftp.storbinary(f'STOR {remote_file}', f)
    print("Upload complete.")

def main():
    try:
        print(f"Connecting to {HOST} as {USER}...")
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p() # Secure the connection
        
        upload_files(ftp)
        
        ftp.quit()
        print("Done!")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
