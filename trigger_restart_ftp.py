import ftplib
import time

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www'

def trigger_restart():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        ftp.cwd(REMOTE_DIR)
        
        print("Triggering restart via restart.txt...")
        with open("restart.txt", "w") as f:
            f.write(str(time.time()))
            
        with open("restart.txt", "rb") as f:
            ftp.storbinary('STOR restart.txt', f)
            
        print("Restart triggered.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_restart()
