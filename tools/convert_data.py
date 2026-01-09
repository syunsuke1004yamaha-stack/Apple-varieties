import json
import os

files = [
    { "json": "airpods.json", "js": "airpods_data.js", "varName": "AIRPODS_DATA" },
    { "json": "apple_tv.json", "js": "apple_tv_data.js", "varName": "APPLE_TV_DATA" },
    { "json": "apple_watch.json", "js": "apple_watch_data.js", "varName": "APPLE_WATCH_DATA" },
    { "json": "homepod.json", "js": "homepod_data.js", "varName": "HOMEPOD_DATA" },
    { "json": "imac.json", "js": "imac_data.js", "varName": "IMAC_DATA" },
    { "json": "ipod.json", "js": "ipod_data.js", "varName": "IPOD_DATA" },
    { "json": "mac_mini.json", "js": "mac_mini_data.js", "varName": "MAC_MINI_DATA" },
    { "json": "mac_pro.json", "js": "mac_pro_data.js", "varName": "MAC_PRO_DATA" },
    { "json": "mac_studio.json", "js": "mac_studio_data.js", "varName": "MAC_STUDIO_DATA" },
    { "json": "macbook_air.json", "js": "macbook_air_data.js", "varName": "MACBOOK_AIR_DATA" },
    { "json": "macbook_pro.json", "js": "macbook_pro_data.js", "varName": "MACBOOK_PRO_DATA" },
    { "json": "macbook.json", "js": "macbook_data.js", "varName": "MACBOOK_DATA" }
]

dir_path = "/Users/shunsuke/Downloads/りんご"

for f in files:
    try:
        json_path = os.path.join(dir_path, f["json"])
        js_path = os.path.join(dir_path, f["js"])
        
        if os.path.exists(json_path):
            with open(json_path, 'r', encoding='utf-8') as jf:
                data = jf.read()
                # Validate JSON
                json.loads(data)
                
                # Changed to window assignment
                content = f"window.{f['varName']} = {data};\n"
                with open(js_path, 'w', encoding='utf-8') as jsf:
                    jsf.write(content)
                print(f"Verified and Converted {f['json']} to {f['js']}")
        else:
            print(f"File not found: {f['json']}")
    except Exception as e:
        print(f"Error converting {f['json']}: {e}")

