import asyncio
from concurrent.futures import ThreadPoolExecutor
from time import sleep
from datetime import datetime
from kasa import Discover, SmartBulb, SmartPlug
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/toggle_light', methods=['POST'])
async def toggle_light():
    try:
        device_id = request.form['id']
        status = request.form['status']
        device_addr = request.form['deviceAddr']
        device_mac = request.form['deviceMac']
        device_model = request.form['deviceModel']
        # await Discover.discover(target=device_addr)
        bulb = SmartBulb(device_addr)
        await bulb.update()
        if status!='false':
            await bulb.turn_on()
        else:
            await bulb.turn_off()
        await bulb.update()
        return 'true'
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@app.route('/change_brightness', methods=['POST'])
async def change_brightness():
    try:
        device_id = request.form['id']
        device_addr = request.form['deviceAddr']
        device_brightness = request.form['devicebrightness']
        deviceNewBrightness = request.form['deviceNewBrightness']
        brightness_int = int(deviceNewBrightness)
        bulb = SmartBulb(device_addr)
        await bulb.update()
        await bulb.set_brightness(brightness_int)
        await bulb.update()
        return 'true'
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

@app.route('/get_device_status', methods=['POST'])
async def get_device_status(device_model, device_address):
    try:
        if device_model == 'KL125(US)':
            device = SmartBulb(device_address)
        if device_model == 'HS103(US)':
            device = SmartPlug(device_address)
        await device.update()
        return device.is_on
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
@app.route('/wake_up_devices', methods=['GET'])
async def wake_up_devices():
    try:
        device_addresses = [
            "192.168.1.42",
            "192.168.1.153",
            "192.168.1.152",
            "192.168.1.113",
            "192.168.1.6",
            "192.168.1.218",
            "192.168.1.215",
            "192.168.1.184",
            "192.168.1.165",
            "192.168.1.86"
        ]
        tasks = [wake_up_device(device) for device in device_addresses]
        await asyncio.gather(*tasks)
        now = datetime.now()
        time_str = now.strftime('%H:%M')
        print(f'devices woken up at: {time_str}')
        return 'true'
    except Exception as e:
        print(f"An error occurred: {e}")

async def wake_up_device(device):
    try:
        await Discover.discover(target=device)
        # for addr, device in device_sleep.items():
        #     print(f'waking up: {device.alias}')
    except Exception as e:
        print(f"An error occurred while waking up {device}: {e}")

@app.route('/get_device_info', methods=['GET'])
async def get_device_info():
    try:
        device_info = await discover_devices()
        # device_info = {ip: details for ip, details in device_info.items() if details['model'] == 'KL125(US)'}
        return jsonify(device_info)
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

async def wake_up_device(device):
    try:
        await Discover.discover(target=device)
        # for addr, device in device_sleep.items():
            # print(device.alias)
            # print('---------------------------')
    except Exception as e:
        print(f"ERROR: {device}: {e}")

async def wake_up_devices():
    try:
        device_addresses = [
            "192.168.1.42",
            "192.168.1.153",
            "192.168.1.152",
            "192.168.1.113",
            "192.168.1.6",
            "192.168.1.218",
            "192.168.1.215",
            "192.168.1.184",
            "192.168.1.165",
            "192.168.1.86"
        ]
        tasks = [wake_up_device(device) for device in device_addresses]
        await asyncio.gather(*tasks)
        now = datetime.now()
        time_str = now.strftime('%H:%M')
        print(f'devices woken up at: {time_str}')
    except Exception as e:
        print(f"An error occurred: {e}")

async def process_device(addr, device, device_details):
    try:
        await device.update()

        brightness_val = 0
        is_dimmable = False
        color_temp = False
        valid_temp = False
        hsv = False
        led_state = False
        on_since = False
        current_consumption = False
        light_details = False
        light_state = False
        sys_info = False
        time = False
        timezone = False
        turn_on_behavior = False
        features = False
        emeter_realtime = False
        emeter_this_month = False
        emeter_today = False

        if device.model == 'KL125(US)':
            brightness_val = device.state_information["Brightness"]
            is_dimmable = device.state_information["Is dimmable"]
            color_temp = device.state_information["Color temperature"]
            valid_temp = device.state_information["Valid temperature range"]
            hsv = device.state_information["HSV"]
            current_consumption = str( await device.current_consumption())
            light_details = str( await device.get_light_details())
            light_state = str( await device.get_light_state())
            sys_info = str( await device.get_sys_info())
            # time = str( await device.get_time())
            # timezone = str( await device.get_timezone())
            turn_on_behavior = str( await device.get_turn_on_behavior())
            on_since = device.on_since
            emeter_realtime = str(await device.get_emeter_realtime())
            emeter_this_month = device.emeter_this_month
            emeter_today = device.emeter_today
            features = str(device.features)

        if device.model == 'HS103(US)':
            led_state = device.state_information['LED state']
            on_since = device.state_information['On since']
            if on_since is not None:
                on_since = on_since.strftime("%b %d, %y at %I:%M %p")

        # this only works if a naming convention is followed
        # not sure how to extract group settings from kasa
        device_group = device.alias.split(' ')[0].lower()
        
        if device_group == 'dining':
            device_group = 'living'

        device_key = device.alias.lower().replace(' ', '')
        device_details[device_key] = {
            "model": device.model,
            "name": device.alias,
            "key": device_key,
            "group": device_group,
            "state": device.is_on,
            "type": str(device.device_type),
            "addr": addr,
            "mac": device.mac,
            "brightness": brightness_val,
            "is_dimmable": is_dimmable,
            "color_temp": color_temp,
            "valid_temp": valid_temp,
            "hsv": hsv,
            "led_state": led_state,
            "on_since": on_since,
            "current_consumption": current_consumption,
            "light_details": light_details,
            "light_state": light_state,
            "sys_info": sys_info,
            "time": time,
            "timezone": timezone,
            "features": features,
            "turn_on_behavior": turn_on_behavior,
            "emeter_realtime": emeter_realtime,
            "emeter_this_month": emeter_this_month,
            "emeter_today": emeter_today,
        }
    except Exception as e:
        print(f"An error occurred {addr}: {e}")

async def discover_devices():
    try:
        await wake_up_devices()
        devices_discovered = await Discover.discover()
        device_details = {}
        tasks = [
            process_device(addr, device, device_details)
            for addr, device in devices_discovered.items()
        ]
        await asyncio.gather(*tasks)
        return device_details
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
