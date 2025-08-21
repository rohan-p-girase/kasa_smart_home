# Kasa Smart Device Web App — README

A Flask + asyncio web application for discovering, controlling, and monitoring **TP-Link Kasa Smart Bulbs & Plugs** (e.g., KL125 bulbs, HS103 plugs).

---

## Overview

This app provides a simple web interface (with REST-like endpoints) to:

- Discover all Kasa devices on the local network
- Toggle all lights (on/off)
- Change brightness for bulbs
- Get individual device status (on/off)
- Wake up devices (trigger Kasa discovery broadcast)
- Collect detailed info about each device (brightness, HSV, power consumption, etc.)

The app uses **[python-kasa](https://python-kasa.readthedocs.io/en/stable/smartbulb.html)** for device communication and runs via **Flask** as a lightweight web server.

---

## Required Libraries

Tested with Python **3.10+**. Install dependencies:

```bash
pip install flask python-kasa
```

> Note: `python-kasa` requires `asyncio`. If using Windows, install via WSL/Linux for full compatibility.

---

## Setup & Run

### 1) Configure device IPs

In the script, update placeholder IPs (`"x.x.x.x", ...`) under:

- `toggle_all_lights`
- `wake_up_devices`

to the local IP addresses of your Kasa devices.

### 2) Run the app

Save the script as `kasa_app.py` and run:

```bash
python kasa_app.py
```

The app will start on:

```
http://<your-host-ip>:5000/
```

### 3) Endpoints

- **`GET /`** → Serves index page (`index.html` template)
- **`POST /toggle_all_lights`**  
  Form data: `status=true/false`  
  Toggles all bulbs on/off
- **`POST /change_brightness`**  
  Form data: `id, deviceAddr, deviceNewBrightness`  
  Sets bulb brightness (0–100)
- **`POST /get_device_status`**  
  Parameters: `device_model`, `device_address`  
  Returns on/off status
- **`GET /wake_up_devices`**  
  Sends wake-up broadcast to all devices in list
- **`GET /get_device_info`**  
  Runs device discovery and returns JSON with all details per device

---

## Example Workflow

1. **Wake devices**  
   ```bash
   curl http://localhost:5000/wake_up_devices
   ```

2. **Toggle all lights on**  
   ```bash
   curl -X POST -F "status=true" http://localhost:5000/toggle_all_lights
   ```

3. **Set brightness**  
   ```bash
   curl -X POST -F "deviceAddr=192.168.1.50" -F "deviceNewBrightness=75" http://localhost:5000/change_brightness
   ```

4. **Fetch info**  
   ```bash
   curl http://localhost:5000/get_device_info
   ```

---

## Notes & Suggestions

- **Duplicate `wake_up_device` definition**: The code currently defines it twice. Clean up to avoid confusion.
- **`get_device_status` signature**: Flask route should pull parameters from `request.form` instead of direct args.
- **ThreadPoolExecutor** is imported but not used; you can remove if not needed.
- Ensure you have proper **network permissions** (firewall open for port 5000 and local subnet).
- Flask is running in **debug mode** — disable for production (`debug=False`).
- Consider adding authentication if deploying outside your LAN.

---

## Example `requirements.txt`

```txt
flask>=2.3.0
python-kasa>=0.5.0
```

---

## File Structure (suggested)

```
project/
├─ kasa_app.py
├─ templates/
│  └─ index.html
├─ requirements.txt
```

---

## Credits

- Built using [python-kasa](https://python-kasa.readthedocs.io/en/stable/) for device control.
- Flask web framework: [https://flask.palletsprojects.com/](https://flask.palletsprojects.com/)

---

## License

This project is for educational/personal smart-home use. Ensure compliance with your device’s terms and use responsibly on your local network.
