import ftplib

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www/uploads'

def list_uploads():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        try:
            ftp.cwd(REMOTE_DIR)
            files = ftp.nlst()
            print(f"Files in uploads ({len(files)}):")
            for f in files[-5:]: # Last 5
                print(f" - {f}")
        except Exception as e:
            print(f"Could not list uploads: {e}")

        # Check properties.json
        print("\nChecking properties.json...")
        ftp.cwd('/') # Go back to root
        ftp.cwd('www')
        
        import io
        bio = io.BytesIO()
        ftp.retrbinary('RETR properties.json', bio.write)
        print(f"Properties Data Size: {bio.tell()} bytes")
        
        ftp.quit()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_uploads()
