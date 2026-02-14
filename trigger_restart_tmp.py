import ftplib
import time

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'

def trigger_restart_tmp():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        # Check/Create tmp
        try:
            ftp.cwd('tmp')
        except:
            print("Creating tmp directory...")
            ftp.cwd('/') # root
            try:
                ftp.mkd('tmp')
                ftp.cwd('tmp')
            except Exception as e:
                print(f"Failed to create tmp: {e}")
                ftp.quit()
                return

        print("Triggering restart via tmp/restart.txt...")
        with open("restart.txt", "w") as f:
            f.write(str(time.time()))
            
        with open("restart.txt", "rb") as f:
            ftp.storbinary('STOR restart.txt', f)
            
        print("Restart triggered in tmp/.")
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_restart_tmp()
