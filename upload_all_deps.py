import json
import os
import ftplib
import time

# FTP Credentials
HOST = 'ftp-dalaalstreetss.alwaysdata.net'
USER = 'dalaalstreetss'
PASS = 'dalaalstreets123'
REMOTE_DIR = 'www/node_modules'
LOCAL_DIR = 'whatsapp-bot-new/node_modules'

def upload_all_deps():
    # Load deps
    with open('multer_deps.json', 'r') as f:
        modules = json.load(f)
        
    print(f"Connecting to {HOST}...")
    try:
        ftp = ftplib.FTP_TLS(HOST)
        ftp.login(USER, PASS)
        ftp.prot_p()
        
        total = len(modules)
        for i, module in enumerate(modules):
            print(f"[{i+1}/{total}] Uploading {module}...")
            
            local_module_path = os.path.join(LOCAL_DIR, module)
            if not os.path.exists(local_module_path):
                print(f"  Skipping {module} (not found locally)")
                continue
            
            # Recursive upload logic
            for root, dirs, files in os.walk(local_module_path):
                rel_path = os.path.relpath(root, LOCAL_DIR)
                # remote path uses forward slashes
                rel_path_remote = rel_path.replace('\\', '/')
                remote_path = f"{REMOTE_DIR}/{rel_path_remote}"
                
                # Ensure remote dir exists
                # This is slow if we do it for every dir.
                # Optimisation: Try CWD, if fail MKD
                # But here we just try to upload files.
                
                # Navigate to root
                ftp.cwd('/')
                
                # Split path and traverse/create
                parts = remote_path.split('/')
                for part in parts:
                    if not part: continue
                    try:
                        ftp.cwd(part)
                    except:
                        try:
                            ftp.mkd(part)
                            ftp.cwd(part)
                        except Exception as e:
                            # Could be race condition or error
                            pass
                            
                # Upload files
                for file in files:
                    local_file = os.path.join(root, file)
                    try:
                        with open(local_file, 'rb') as f:
                            ftp.storbinary(f'STOR {file}', f)
                    except Exception as e:
                        print(f"  Error uploading {file}: {e}")
                        # Retry once
                        try:
                             with open(local_file, 'rb') as f:
                                ftp.storbinary(f'STOR {file}', f)
                        except:
                            pass
                            
        print("All modules uploaded.")
        ftp.quit()
    except Exception as e:
        print(f"FTP Error: {e}")

if __name__ == "__main__":
    upload_all_deps()
