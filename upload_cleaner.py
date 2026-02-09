import ftplib
import os

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'

def upload_cleaner():
    try:
        print(f"Connecting to {HOST}...")
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        if os.path.exists('public/clear_cache.html'):
            print("Uploading clear_cache.html to www/...")
            with open('public/clear_cache.html', 'rb') as f:
                ftp.storbinary('STOR www/clear_cache.html', f)
            print("Upload successful!")
        else:
            print("public/clear_cache.html not found!")

        ftp.quit()
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    upload_cleaner()
