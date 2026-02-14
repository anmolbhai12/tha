import os
import ftplib

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www'
LOCAL_DIR = 'whatsapp-bot-new'

FILES = ['modules.json', 'unpack.js', 'server.js']

def upload_pack():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        ftp.cwd(REMOTE_DIR)
        
        # Upload modules.json first (up one level since python script is elsewhere)
        # modules.json is in c:\Users\DELL\Desktop\New folder\modules.json
        # unpack.js and server.js are in c:\Users\DELL\Desktop\New folder\whatsapp-bot-new
        
        print(f"Uploading modules.json...")
        if os.path.exists('modules.json'):
            with open('modules.json', 'rb') as f:
                ftp.storbinary('STOR modules.json', f)
        else:
             print("Error: modules.json not found in CWD")
        
        for file in ['unpack.js', 'server.js']:
            local_path = os.path.join(LOCAL_DIR, file)
            print(f"Uploading {file}...")
            with open(local_path, 'rb') as f:
                ftp.storbinary(f'STOR {file}', f)
                
        print("Upload complete.")
        ftp.quit()
    except Exception as e:
        print(f"FTP Error: {e}")

if __name__ == "__main__":
    upload_pack()
