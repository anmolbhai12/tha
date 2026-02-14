import json
import os
import base64

BASE_DIR = 'whatsapp-bot-new/node_modules'
OUTPUT_FILE = 'modules.json'

def pack_modules():
    with open('multer_deps.json', 'r') as f:
        modules = json.load(f)
        
    packed = {}
    
    for module in modules:
        module_path = os.path.join(BASE_DIR, module)
        if not os.path.exists(module_path):
            print(f"Skipping {module}")
            continue
            
        for root, dirs, files in os.walk(module_path):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, BASE_DIR)
                # Use forward slashes and prepend node_modules
                key = f"node_modules/{rel_path}".replace('\\', '/')
                
                with open(file_path, 'rb') as f:
                    content = f.read()
                    packed[key] = base64.b64encode(content).decode('ascii')
                    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(packed, f)
        
    print(f"Packed {len(packed)} files into {OUTPUT_FILE}")
    print(f"Size: {os.path.getsize(OUTPUT_FILE) / 1024 / 1024:.2f} MB")

if __name__ == "__main__":
    pack_modules()
