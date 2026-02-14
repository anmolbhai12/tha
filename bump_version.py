import ftplib
import json

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_FILE = 'www/package.json'
LOCAL_FILE = 'package_remote.json'

def bump_version():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        print("Downloading package.json...")
        with open(LOCAL_FILE, 'wb') as f:
            ftp.retrbinary(f'RETR {REMOTE_FILE}', f.write)
            
        with open(LOCAL_FILE, 'r') as f:
            data = json.load(f)
            
        old_ver = data.get('version', '0.0.0')
        parts = old_ver.split('.')
        parts[-1] = str(int(parts[-1]) + 1)
        new_ver = '.'.join(parts)
        data['version'] = new_ver
        print(f"Bumping version {old_ver} -> {new_ver}")
        
        with open(LOCAL_FILE, 'w') as f:
            json.dump(data, f, indent=4)
            
        print("Uploading package.json...")
        with open(LOCAL_FILE, 'rb') as f:
            ftp.storbinary(f'STOR {REMOTE_FILE}', f)
            
        print("Upload complete.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    bump_version()
