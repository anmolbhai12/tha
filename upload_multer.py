import os
import ftplib

# FTP Credentials
HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www/node_modules'
LOCAL_DIR = 'whatsapp-bot-new/node_modules'

# Dependencies of multer
MODULES = [
    'multer',
    'busboy',
    'streamsearch',
    'append-field',
    'mkdirp',
    'minimist',
    'type-is',
    'media-typer',
    'mime-types',
    'mime-db',
    'process-nextick-args',
    'readable-stream',
    'string_decoder',
    'safe-buffer',
    'util-deprecate',
    'inherits',
    'core-util-is',
    'isarray',
    'object-assign',
    'xtend'
]

def upload_modules():
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        for module in MODULES:
            local_module_path = os.path.join(LOCAL_DIR, module)
            if not os.path.exists(local_module_path):
                print(f"Skipping {module} (not found locally)")
                continue
                
            remote_module_path = f"{REMOTE_DIR}/{module}"
            print(f"Uploading {module}...")
            
            # Recursive upload
            for root, dirs, files in os.walk(local_module_path):
                rel_path = os.path.relpath(root, LOCAL_DIR)
                remote_path = f"www/node_modules/{rel_path}".replace('\\', '/')
                
                try:
                    ftp.cwd('/')
                    for part in remote_path.split('/'):
                        if part:
                            try:
                                ftp.cwd(part)
                            except:
                                ftp.mkd(part)
                                ftp.cwd(part)
                except Exception as e:
                    print(f"Error navigating to {remote_path}: {e}")
                    
                for file in files:
                    local_file = os.path.join(root, file)
                    with open(local_file, 'rb') as f:
                        ftp.storbinary(f'STOR {file}', f)
                        
        print("Modules uploaded.")
        ftp.quit()
    except Exception as e:
        print(f"FTP Error: {e}")

if __name__ == "__main__":
    upload_modules()
