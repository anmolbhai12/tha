const fs = require('fs');
const path = require('path');

const MODULES_FILE = path.join(__dirname, 'modules.json');

if (fs.existsSync(MODULES_FILE)) {
    console.log("📦 Found modules.json. Unpacking...");
    try {
        const content = fs.readFileSync(MODULES_FILE, 'utf8');
        const modules = JSON.parse(content);

        // Ensure node_modules exists
        if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
            fs.mkdirSync(path.join(__dirname, 'node_modules'));
        }

        let count = 0;
        Object.keys(modules).forEach(relPath => {
            const filePath = path.join(__dirname, relPath);
            const dir = path.dirname(filePath);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            const buffer = Buffer.from(modules[relPath], 'base64');
            fs.writeFileSync(filePath, buffer);
            count++;
        });

        console.log(`✅ Unpacked ${count} files.`);

        // Rename modules.json to modules.json.done to prevent re-run
        fs.renameSync(MODULES_FILE, MODULES_FILE + '.done');

    } catch (e) {
        console.error("❌ Error unpacking:", e);
    }
} else {
    console.log("No modules.json to unpack.");
}
