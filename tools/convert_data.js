const fs = require('fs');
const path = require('path');

const files = [
    { json: 'airpods.json', js: 'airpods_data.js', varName: 'AIRPODS_DATA' },
    { json: 'apple_tv.json', js: 'apple_tv_data.js', varName: 'APPLE_TV_DATA' },
    { json: 'apple_watch.json', js: 'apple_watch_data.js', varName: 'APPLE_WATCH_DATA' },
    { json: 'homepod.json', js: 'homepod_data.js', varName: 'HOMEPOD_DATA' },
    { json: 'imac.json', js: 'imac_data.js', varName: 'IMAC_DATA' },
    { json: 'ipod.json', js: 'ipod_data.js', varName: 'IPOD_DATA' },
    { json: 'mac_mini.json', js: 'mac_mini_data.js', varName: 'MAC_MINI_DATA' },
    { json: 'mac_pro.json', js: 'mac_pro_data.js', varName: 'MAC_PRO_DATA' },
    { json: 'mac_studio.json', js: 'mac_studio_data.js', varName: 'MAC_STUDIO_DATA' },
    { json: 'macbook_air.json', js: 'macbook_air_data.js', varName: 'MACBOOK_AIR_DATA' },
    { json: 'macbook_pro.json', js: 'macbook_pro_data.js', varName: 'MACBOOK_PRO_DATA' },
    { json: 'macbook.json', js: 'macbook_data.js', varName: 'MACBOOK_DATA' }
];

const dir = '/Users/shunsuke/Downloads/りんご';

files.forEach(file => {
    try {
        const jsonPath = path.join(dir, file.json);
        const jsPath = path.join(dir, file.js);
        if (fs.existsSync(jsonPath)) {
            const data = fs.readFileSync(jsonPath, 'utf8');
            // Check if valid JSON
            JSON.parse(data);
            const content = `const ${file.varName} = ${data};\n`;
            fs.writeFileSync(jsPath, content);
            console.log(`Converted ${file.json} to ${file.js}`);
        } else {
            console.error(`File not found: ${file.json}`);
        }
    } catch (e) {
        console.error(`Error converting ${file.json}:`, e.message);
    }
});
