import ftplib
import time

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'

def deliberate_restart():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        # Try to delete tmp/restart.txt
        try:
            ftp.delete('tmp/restart.txt')
            print("Deleted tmp/restart.txt")
        except Exception as e:
            print(f"Delete failed (maybe didn't exist): {e}")
            
        try:
            ftp.delete('restart.txt')
            print("Deleted restart.txt")
        except:
            pass

        time.sleep(5)
        
        print("Uploading fresh restart.txt...")
        timestamp = str(time.time())
        with open("restart.txt", "w") as f:
            f.write(timestamp)
            
        # Upload to tmp/
        try:
            ftp.cwd('tmp')
            with open("restart.txt", "rb") as f:
                ftp.storbinary('STOR restart.txt', f)
            print("Uploaded to tmp/restart.txt")
        except Exception as e:
            print(f"Failed upload to tmp: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    deliberate_restart()
