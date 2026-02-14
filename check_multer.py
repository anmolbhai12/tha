import ftplib

HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www/node_modules'

def check_modules():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        try:
            ftp.cwd(REMOTE_DIR)
            files = ftp.nlst()
            if 'multer' in files:
                print("✅ multer found in node_modules")
            else:
                print("❌ multer NOT found in node_modules")
                
            print(f"Total modules: {len(files)}")
        except Exception as e:
            print(f"Error checking node_modules: {e}")
            
        ftp.quit()
    except Exception as e:
        print(f"FTP Error: {e}")

if __name__ == "__main__":
    check_modules()
