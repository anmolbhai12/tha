import ftplib
import os

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_FILE = 'boot.log'
LOCAL_FILE = 'boot_check.log'

def check_log():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        # Try to find boot.log in root or www?
        # Usually it's in root for user-managed services, or redirected to a file.
        # Step 1539 showed boot.log in root.
        
        files = ftp.nlst()
        if REMOTE_FILE in files:
            print(f"Downloading {REMOTE_FILE}...")
            with open(LOCAL_FILE, 'wb') as f:
                ftp.retrbinary(f'RETR {REMOTE_FILE}', f.write)
            print("Log downloaded.")
            with open(LOCAL_FILE, 'r') as f:
                print("--- LOG CONTENT ---")
                print(f.read())
                print("-------------------")
        else:
            print(f"{REMOTE_FILE} not found in root.")
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_log()
