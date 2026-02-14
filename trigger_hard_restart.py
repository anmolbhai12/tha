import ftplib
import time

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'

def trigger_hard_restart():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        timestamp = str(time.time())
        with open("restart.txt", "w") as f:
            f.write(timestamp)
            
        paths = [
            'restart.txt',
            'tmp/restart.txt',
            'www/restart.txt',
            'www/tmp/restart.txt'
        ]
        
        for path in paths:
            print(f"Uploading to {path}...")
            # Ensure dir exists
            parts = path.split('/')
            if len(parts) > 1:
                dir_path = '/'.join(parts[:-1])
                try:
                    ftp.cwd('/')
                    for part in dir_path.split('/'):
                         try: ftp.cwd(part)
                         except: 
                             ftp.mkd(part)
                             ftp.cwd(part)
                except Exception as e:
                    print(f"  Error navigating to {dir_path}: {e}")
                    continue
            else:
                ftp.cwd('/')

            try:
                with open("restart.txt", "rb") as f:
                    ftp.storbinary(f'STOR {parts[-1]}', f)
                print(f"  Success: {path}")
            except Exception as e:
                print(f"  Failed: {e}")
                
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    trigger_hard_restart()
