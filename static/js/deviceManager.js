class DeviceManager {
    constructor() {
        this.timeoutId = null;

        // Set up event listeners
        this.setupEventListeners();

        // Load device info
        this.loadDeviceInfo();

        // Initialize devices
        this.refreshDevices();

        // Set up interval to refresh devices
        setTimeout(() => {
            setInterval(this.refreshDevices, 2 * 60 * 1000);
        }, 2 * 60 * 1000);
        
    }

    setupEventListeners() {
        // Toggle fullscreen
        document.getElementById("toggleFullscreen").addEventListener("click", () => {
            this.toggleFullscreen();
        });

        // Brightness input
        $(document).on('input', '.brightness-input', (event) => {
            this.handleBrightnessInput(event);
        });

        // Toggle device
        $(document).on('click', '.form-check-input', (event) => {
            this.handleToggleDevice(event);
        });

        // Toggle all devices
        $(document).on('click', '#toggleAllDevices', (event) => {
            this.handleToggleAllDevice(event);
        });

        // Device list toggle button
        $("#device-list").on("click", ".btn-toggle", (event) => {
            this.handleDeviceListToggleButton(event);
        });
    }

    toggleFullscreen() {
        const elem = document.documentElement;
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    handleBrightnessInput(event) {
        const target = $(event.currentTarget);
        const id = target.attr('id').replace('setBrightness_', '');
        const deviceNewBrightness = target.val();
        const deviceAddr = $(`#deviceAddr_${id}`).val();
        const deviceMac = $(`#deviceMac_${id}`).val();
        const deviceModel = $(`#deviceModel_${id}`).val();
        const deviceBrightness = $(`#deviceBrightness_${id}`).val();

        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
            $.ajax({
                url: '/change_brightness',
                type: 'POST',
                data: {
                    id,
                    deviceAddr,
                    deviceMac,
                    deviceModel,
                    deviceBrightness,
                    deviceNewBrightness,
                },
                success: function (response) {
                    console.log('Success:', response);
                },
                error: function (xhr, status, error) {
                    console.log('Error:', error);
                },
            });
        }, 500);
    }

    handleToggleDevice(event) {
        const target = $(event.currentTarget);
        const id = target.attr('id');
        const isChecked = target.prop('checked');
        const deviceAddr = $(`#deviceAddr_${id}`).val();
        const deviceMac = $(`#deviceMac_${id}`).val();
        const deviceModel = $(`#deviceModel_${id}`).val();

        $.ajax({
            url: '/toggle_light',
            type: 'POST',
            data: {
                id,
                status: isChecked,
                deviceAddr,
                deviceMac,
                deviceModel,
            },
            success: function (response) {
                console.log(response);
            },
            error: function (xhr, status, error) {
                console.error('Error occurred:', error);
            },
        });
    }

    handleToggleAllDevice(event) {
        const target = $(event.currentTarget);
        const isChecked = target.prop('checked');
        $.ajax({
            url: '/toggle_all_lights',
            type: 'POST',
            data: {
                status: isChecked
            },
            success: function (response) {
                console.log(response);
            },
            error: function (xhr, status, error) {
                console.error('Error occurred:', error);
            },
        });
    }

    handleDeviceListToggleButton(event) {
        event.preventDefault();
        const target = $(event.currentTarget);
        target.find('.btn').toggleClass('active');
        if (target.find('.btn-primary').length > 0) {
            target.find('.btn').toggleClass('btn-primary');
        }
        target.find('.btn').toggleClass('btn-default');
    }

    refreshDevices() {
        $.get('/wake_up_devices', function (data) {});
    }

    loadDeviceInfo() {
        $.ajax({
            url: '/get_device_info',
            type: 'GET',
            success: (response) => {
                $("#device-load-status").addClass("visually-hidden");
                for (const ip in response) {
                    if (response.hasOwnProperty(ip)) {
                        const device = response[ip];

                        // SET DISPLAY VARIABLES
                        const deviceModel = device.model;
                        const deviceName = device.name;
                        const state = device.state;
                        const deviceAddr = device.addr;
                        const deviceMac = device.mac;
                        const deviceKey = device.key;
                        const deviceGroup = device.group;
                        let devChecked = 'checked';
                        if (state != true) {
                            devChecked = '';
                        }
                        let isDimmable = '';
                        let deviceIcon = '';
                        let colorTemp = '';
                        let validTemp = '';
                        let deviceHSV = '';
                        let appendTo = '';
                        let ledState = '';
                        let onSince = '';
                        let currentConsumption = '';
                        let deviceBrightness = '';
                        const lightDetails = device.light_details;
                        const lightState = device.light_state;
                        const sysInfo = device.sys_info;
                        const turnOnBehavior = device.turn_on_behavior;
                        const features = device.features;
                        let emeterRealtime = '';
                        let emeterThisMonth = '';
                        let emeterToday = '';
                        let subCategory = '';
                        
                        if (deviceModel === 'HS103(US)') {
                            ledState = device.led_state;
                            onSince = device.on_since;
                            deviceIcon = 'bi-outlet';
                            if (onSince === null) {
                                onSince = 'device turned off';
                            }
                            currentConsumption = device.current_consumption;
                            subCategory = `
                                <p class="card-text">${onSince}</p>
                            `;
                            appendTo = `#${deviceGroup}-list`;
                        }
                        
                        // KL125(US) -> Wi-Fi Bulb
                        if (deviceModel === 'KL125(US)') {
                            deviceIcon = 'bi-lamp';
                            deviceBrightness = device.brightness;
                            isDimmable = device.is_dimmable;
                            colorTemp = device.color_temp;
                            validTemp = device.valid_temp;
                            deviceHSV = device.hsv;
                            currentConsumption = device.current_consumption;
                            onSince = device.on_since;
                            emeterRealtime = device.emeter_realtime;
                            emeterThisMonth = device.emeter_this_month;
                            emeterToday = device.emeter_today;
                            subCategory = `
                                <input type="range" class="form-range brightness-input" min="0" max="100" step="1" value="${deviceBrightness}" id="setBrightness_${deviceKey}">
                            `;
                            appendTo = `#${deviceGroup}-list`;
                        }
                        
                        let listItem = `
                        <div class="col-3 my-2">
                            <div class="shadow card">
                                <div class="card-body">
                                    <i class="bi ${deviceIcon} mx-1" style="font-size: 4rem;"></i>
                                    <div class="form-check form-switch float-end">
                                        <input class="form-check-input" type="checkbox" role="switch" id="${deviceKey}" ${devChecked}>
                                        <label class="form-check-label" for="${deviceKey}"></label>
                                        <input type="hidden" id="deviceAddr_${deviceKey}" value="${deviceAddr}">
                                        <input type="hidden" id="deviceMac_${deviceKey}" value="${deviceMac}">
                                        <input type="hidden" id="deviceModel_${deviceKey}" value="${deviceModel}">
                                        <input type="hidden" id="deviceBrightness_${deviceKey}" value="${deviceBrightness}">
                                    </div>
                                    <h4 class="card-title mt-3 text-nowrap">${deviceName}</h4>
                                    <h6 class="card-title mt-3 text-nowrap text-secondary">${currentConsumption}</h6>`;
                        listItem += subCategory;
                        listItem += ` </div>
                            </div>
                        </div>`;
                        
                        $(appendTo).append(listItem);
                        console.log(deviceName);
                        console.log(currentConsumption);
                        console.log('----------------');
                    }
                }
            },
            error: (xhr, status, error) => {
                console.error('Error occurred:', error);
            },
        });
    }

}

$(document).ready(function () {
    const deviceManager = new DeviceManager();
});
