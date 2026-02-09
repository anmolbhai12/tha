import ftplib

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'

def check_remote_assets():
    try:
        print(f"Connecting to {HOST}...")
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        print("\n--- Listing www/assets ---")
        try:
            ftp.cwd('www/assets')
            files = []
            ftp.retrlines('LIST', files.append)
            for f in files:
                print(f)
        except Exception as e:
            print(f"Failed to list assets: {e}")

        print("\n--- Checking www/index.html ---")
        try:
            ftp.cwd('..') # Back to www
            with open('remote_index_debug.html', 'wb') as f:
                ftp.retrbinary('RETR index.html', f.write)
            with open('remote_index_debug.html', 'r') as f:
                print(f.read())
        except Exception as e:
            print(f"Failed to read index.html: {e}")

        ftp.quit()
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    check_remote_assets()
