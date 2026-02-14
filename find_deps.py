import json
import os

BASE_DIR = 'whatsapp-bot-new/node_modules'
START_PKG = 'multer'

visited = set()
queue = [START_PKG]
all_deps = []

while queue:
    pkg = queue.pop(0)
    if pkg in visited:
        continue
    visited.add(pkg)
    all_deps.append(pkg)
    
    pkg_json_path = os.path.join(BASE_DIR, pkg, 'package.json')
    if os.path.exists(pkg_json_path):
        try:
            with open(pkg_json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                deps = data.get('dependencies', {})
                for dep in deps:
                    if dep not in visited:
                        queue.append(dep)
        except Exception as e:
            print(f"Error reading {pkg}: {e}")
    else:
        print(f"Warning: {pkg} not found in node_modules")

print(json.dumps(all_deps, indent=2))
with open('multer_deps.json', 'w') as f:
    json.dump(all_deps, f)
