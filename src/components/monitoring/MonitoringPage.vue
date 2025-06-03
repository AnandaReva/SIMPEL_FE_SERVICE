<template>
    <v-container fluid class="pa-0 ma-0 elevation-2 fill-height fill-width"
        :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay loading -->
        <div v-if="isLoading" class="loading-overlay">
            <v-progress-circular color="secondary" indeterminate size="64"></v-progress-circular>
        </div>


        <v-dialog v-model="isShowDeviceList" max-width="500">
            <template #default>
                <v-card color="base">
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span class="text-h6">Pilih Perangkat Aktif</span>
                        <v-btn icon @click="isShowDeviceList = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <!-- Filter controls -->
                        <div class="d-flex flex-wrap mb-0 ">
                            <v-select v-model="selectedOrderByActiveDeviceList" :items="[
                                { title: 'Waktu terakhir', value: 'last_tstamp' },
                                { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                                { title: 'Nama perangkat', value: 'name' }
                            ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />
                            <v-btn @click="toogleSortType" icon>
                                <v-icon>{{ selectedSortTypeActiveDeviceList === 'ASC' ? 'mdi-arrow-up' :
                                    'mdi-arrow-down' }}</v-icon>
                            </v-btn>
                        </div>

                        <!-- Search box -->
                        <div class="d-flex align-center mb-4">
                            <v-text-field v-model="filterActiveDeviceList" label="Search"
                                placeholder="Masukkan Nama device" variant="solo" clearable class="px-1"
                                style="max-height: 50px;" maxlength="50"
                                :rules="[v => v.length <= 30 || 'Maksimal 30 karakter']"
                                @input="filterActiveDeviceList = filterActiveDeviceList.slice(0, 30)">
                            </v-text-field>
                            <v-btn icon color="primary" class="ml-2" @click="searchActiveDevice">
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>
                        </div>


                        <div>


                            <v-infinite-scroll :key="scrollKeyActiveDevices" id="DeviceListBox" ref="DeviceListBox"
                                height="550" side="end" @load="loadActiveDevices" class="overflow-auto">
                                <DeviceListInfiniteScroll :devices="available_devices_to_monitor"
                                    :total_devices="totalActiveDevices" @select-device="selectDevice" />

                            </v-infinite-scroll>


                        </div>


                    </v-card-text>
                </v-card>
            </template>
        </v-dialog>





        <v-container>
            <v-row class="align-center" style="flex: 1">
                <!-- Kolom 1: Jumlah perangkat -->
                <v-col cols="4" class="d-flex align-center justify-center">
                    <span class="text-body-1 font-weight-medium" style="color: var(--v-theme-primary);">
                        <strong>Jumlah Perangkat Dimonitor: {{ monitored_devices.length }}</strong>
                    </span>
                </v-col>

                <!-- Kolom 2: Zona waktu -->
                <v-col cols="4" class="d-flex align-center justify-center">
                    <v-card class="pa-3 rounded-lg elevation-2 text-center" color="base" style="width: auto;">
                        <span class="text-body-1 font-weight-medium" style="color: var(--v-theme-primary);">
                            <strong>Zona Waktu: {{ userTimeZone }}</strong>
                        </span>
                    </v-card>
                </v-col>

                <!-- Kolom 3: Tombol ganti mode tampilan -->
                <v-col cols="4" class="d-flex align-center justify-end">
                    <v-btn @click="changeViewMode()" variant="outlined" color="primary" class="d-flex align-center">
                        <v-icon start>{{ is_view_mode_compact ? 'mdi-view-grid' : 'mdi-view-agenda' }}</v-icon>
                        <span class="text-caption font-weight-medium">
                            {{ is_view_mode_compact ? 'Tampilan kompak' : 'Tampilan detail' }}
                        </span>
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>






        <v-row v-if="monitored_devices.length > 0" class="d-flex flex-column fit-content" style=" overflow-y: auto;">
            <v-container v-show="is_view_mode_compact" fluid class="pa-4">
                <!-- Grid Device -->
                <div v-if="monitored_devices.length" class="device-grid"
                    style=" display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px;justify-items: center;width: 100%;">
                    <v-card v-for="(device, index) in monitored_devices" :key="device.device_id" elevation="2"
                        rounded="xl" color="base"
                        class="d-flex flex-column align-center justify-center position-relative"
                        style="width: 160px; height: 140px; border: 1px solid #90CAF9;">
                        <!-- Button Close -->
                        <v-btn icon size="x-small" class="position-absolute" style="top: 4px; right: 4px;"
                            @click="removeMonitoredDevice(index)">
                            <v-icon size="16">mdi-close</v-icon>
                        </v-btn>

                        <!-- Device Name -->
                        <div class="text-subtitle-2 font-weight-bold text-center mt-4 mb-2"
                            style="color: var(--v-theme-primary);">
                            {{ device.device_name }}
                        </div>

                        <!-- Energy Display -->
                        <v-sheet color="primary" class="d-flex align-center justify-center text-white font-weight-bold"
                            rounded style="width: 80px; height: 40px;">
                            {{ formatValue(device.sensorData.energy) }} kWh
                        </v-sheet>
                    </v-card>
                </div>


            </v-container>

            <v-container v-show="!is_view_mode_compact">



                <v-row style="flex: 11;">
                    <div v-if="monitored_devices.length != 0" class="device-grid pa-1" style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
                gap: 16px;
                width: 100%;
                min-height: 400px;
                overflow-y: auto;
                padding-right: 8px;
                max-width: 100vw;">


                        <v-card v-for="(device, index) in monitored_devices" :key="device.device_id" elevation="2"
                            rounded="lg" color="base" class="d-flex flex-column fill-height border"
                            style="max-width: 1000px; min-height: 450px; border: 1px solid #64B5F6;">

                            <!-- Title -->
                            <v-card-title class="d-flex justify-space-between align-center">
                                <span class="text-h6 font-weight-bold">{{ device.device_name }}</span>
                                <v-btn icon @click="removeMonitoredDevice(index)">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>

                            <!-- Card Content -->
                            <v-card-text class="pa-2" style="flex: 1; overflow: auto;">
                                <v-row no-gutters class="fill-height">
                                    <!-- Chart Area -->
                                    <v-col cols="10" class="pa-1 border" style="border: 5px solid #90CAF9;">
                                        <div :id="`chartContainer-${device.device_id}`"
                                            style="width: 100%; height: 95%;">

                                        </div>

                                    </v-col>

                                    <!-- Sensor Values -->
                                    <v-col cols="2" class="pa-1 border" style="border: 1px solid #90CAF9;">
                                        <v-row dense>
                                            <v-col v-for="item in [
                                                { label: 'Energy (kWh)', value: device.sensorData.energy },
                                                { label: 'Voltage (V)', value: device.sensorData.voltage },
                                                { label: 'Current (A)', value: device.sensorData.current },
                                                { label: 'Frequency (Hz)', value: device.sensorData.frequency },
                                                { label: 'Power Factor', value: device.sensorData.power_factor }
                                            ]" :key="item.label" cols="12" class="mb-1 text-center">
                                                <v-sheet
                                                    class="border border-primary font-weight-bold d-flex align-center justify-center mx-auto"
                                                    style="width: 5vw; height: 3vw;" rounded>
                                                    {{ formatValue(item.value) }}
                                                </v-sheet>
                                                <div class="text-caption mt-1">{{ item.label }}</div>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>

                    </div>
                    
                </v-row>

            </v-container>



            <v-row class="d-flex align-center justify-center py-5">

                <v-btn v-if="globalWs" color="primary" @click="handleShowDeviceList">
                    <v-icon start>mdi-plus</v-icon>
                    Tambah Perangkat
                </v-btn>

            </v-row>
        </v-row>


        <v-col v-else class="d-flex align-center justify-center">

            <v-card class="text-center pa-4 rounded-lg elevation-2" color="base" style="width: auto; ">

                <div v-if="monitored_devices.length === 0">
                    <v-icon size="64" color="grey">mdi-monitor-off</v-icon>
                    <p class="text-h6 mt-4 mb-6">Tidak ada perangkat yang dipilih</p>
                </div>

                <div v-else>
                    <p class="text-h6 mt-4 mb-6">Jumlah Perangkat di Monitor: {{ monitored_devices.length }}</p>
                </div>

                <v-btn v-if="globalWs" color="primary" @click="handleShowDeviceList">
                    <v-icon start>mdi-plus</v-icon>
                    Tambah Perangkat
                </v-btn>
            </v-card>

        </v-col>






    </v-container>

    <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
        :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode" :visible="popUpInfoVisible"
        @close="closePopup" />
</template>


<script setup>
import DeviceListInfiniteScroll from '@/components/parts/DeviceListInfiniteScroll.vue';
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Process } from "@/utils/requestHelper";
import { BASE_API_URL, WS_API_URL } from "@/configs/config";
import { CreateSocketConnection } from "@/utils/wsHelper"
import PopUpInfoBox from "@/components/parts/PopUpInfoBox.vue";
import CanvasJS from "@canvasjs/charts";

// State management
const popUpInfoVisible = ref(false);

const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);




watch(isLoading, (newValue) => {
    console.log("isLoading changed to:", newValue);
});





const is_view_mode_compact = ref(false);

const changeViewMode = async () => {
    await nextTick();
    is_view_mode_compact.value = !is_view_mode_compact.value;
    console.log("Change view mode to compact:", is_view_mode_compact.value);
};






const isShowDeviceList = ref(false)
const active_devices = ref([])




// Handle showing device list modal
const handleShowDeviceList = () => {
    if (monitored_devices.value.length >= 255) {
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Maximum 255 active_devices can be monitored simultaneously",
            errorCode: 0,
        };
        return
    }

    searchActiveDevice();

    isShowDeviceList.value = true
}


//////////////////// REALTIME MONITORING //////////////////////////
const globalWs = ref(null);
const monitored_devices = ref([]);
const maxDataLength = ref(50);



// Filter device yang belum dimonitor
const available_devices_to_monitor = computed(() => {
    const monitoredIds = new Set(monitored_devices.value.map(d => d.device_id));
    return active_devices.value.filter(d => !monitoredIds.has(d.device_id));
});


watch(available_devices_to_monitor, (newVal) => {
    console.log("Available devices updated:", newVal);
});





const userTimeZone = ref("")

// Helper functions
const formatValue = (newValue) => {
    return newValue === undefined || newValue === null ? "-" : newValue.toFixed(2);
};


function getUserTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
}
const getLocalTimezoneOffset = () => {
    const now = new Date();
    return now.getTimezoneOffset() * 60 * 1000; // Convert minutes to milliseconds
};

function convertTimestampToLocal(timestamp) {
    if (!timestamp) return "-";

    // Format for parsing by Date (add 'T' and 'Z')
    const formattedTimestamp = timestamp.replace(" ", "T") + "Z"; // ex: "2025-04-26T11:32:45Z"
    const utcDate = new Date(formattedTimestamp);

    if (isNaN(utcDate.getTime())) {
        console.warn("❌ Invalid timestamp:", timestamp);
        return "-";
    }

    // Get local offset (negative for time ahead of UTC, positive for behind UTC)
    const localOffset = getLocalTimezoneOffset(); // in milliseconds

    // Convert to local time: UTC - (-offset) => UTC + offset
    const localDate = new Date(utcDate.getTime() - localOffset);

    // Format local date
    return localDate.toLocaleString("id-ID", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}


// Update chart with new data for a specific device
const updateChart = (deviceId, message) => {
    const device = monitored_devices.value.find(d => d.device_id === deviceId);
    if (!device) return;

    if (!device.chart) {
        initChart(deviceId);
        return;
    }

    try {
        // Parse timestamp
        let timestamp = message.timestamp;
        if (!timestamp) {
            console.warn("❌ Missing timestamp in message:", message);
            return;
        }

        // Format timestamp for Date object
        const formattedTimestamp = timestamp.replace(" ", "T") + "Z";
        const messageTime = new Date(formattedTimestamp);

        if (isNaN(messageTime.getTime())) {
            console.warn("❌ Invalid timestamp:", timestamp);
            return;
        }

        // Add new data point
        device.dataPoints.push({
            x: messageTime,
            y: parseFloat(message.power) || 0,
        });

        // Limit data points to maxDataLength
        if (device.dataPoints.length > maxDataLength.value) {
            device.dataPoints.shift();
        }

        // Update chart
        device.chart.options.data[0].dataPoints = device.dataPoints;
        device.chart.render();
    } catch (error) {
        console.error("❌ Error updating chart:", error);
    }
};

// Initialize chart for a specific device
const initChart = (deviceId) => {

    console.log("---initChart---")
    const device = monitored_devices.value.find(d => d.device_id === deviceId);
    if (!device) {
        console.warn(`⚠️ Device with ID ${deviceId} not found!`);
        return;
    }

    console.log(`Initializing chart for device ${deviceId}`, device.dataPoints);

    const containerId = `chartContainer-${deviceId}`;
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`⚠️ Chart container ${containerId} not found!`);
        return;
    }

    // Clear previous chart element (if any)
    container.innerHTML = "";

    device.chart = new CanvasJS.Chart(container, {
        theme: "light2",
        title: {
            text: `Grafik Daya Perangkat - ${device.device_name}`,
            fontSize: 15,
            fontColor: "#346285",
        },
        animationEnabled: true,
        axisX: {
            title: "Waktu (jam:mnt:dtk)",
            valueFormatString: "HH:mm:ss",
            labelFormatter: function (e) {
                return e.value.toISOString().slice(11, 19);
            },
        },
        axisY: {
            title: "power (W)",
        },
        data: [
            {
                type: "line",
                markerSize: 8,
                markerColor: "#346285",
                lineColor: "#badefa",
                dataPoints: device.dataPoints.length
                    ? device.dataPoints
                    : [{ x: new Date(), y: 0 }],
            },
        ],
    });

    device.chart.render();
};



const initGlobalWebSocket = async () => {
    console.log("-----initGlobalWebSocket----");

    if (globalWs.value && globalWs.value.readyState === WebSocket.OPEN) {
        console.log("✅ WebSocket already connected.");
        return;
    }

    console.log("🌐 Membuka koneksi WebSocket baru...");
    const operation = "user-connect";
    const baseUrl = WS_API_URL;
    const params = {};

    const result = await CreateSocketConnection(baseUrl, operation, params);

    if (!result) {
        console.error("⚠️ WebSocket gagal terhubung:", result?.error);
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Gagal terhubung ke Server",
            errorCode: "",
        };
        popUpInfoVisible.value = true;
        return;
    }

    const socket = result;

    socket.onopen = () => {
        console.log("🌐 Global WebSocket connected:", socket.url);
    };

    socket.onerror = (err) => {
        console.error("❌ WebSocket error:", err);
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Gagal terhubung ke server",
            errorCode: "",
        };
        popUpInfoVisible.value = true;
    };

    socket.onclose = () => {
        console.warn("⚠️ Global WebSocket closed.");
        globalWs.value = null;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Koneksi dengan server terputus",
            errorCode: "",
        };
        popUpInfoVisible.value = true;
    };

    socket.onmessage = (event) => {
        try {
            const raw = JSON.parse(event.data);

            // Jika 'message' adalah string dan kelihatan seperti JSON, parse lagi
            let message;
            if (typeof raw.message === "string" && raw.message.trim().startsWith("{")) {
                message = JSON.parse(raw.message);
            } else {
                message = raw;
            }
            console.log("📨 Message from server:", message);
            console.log("Raw Message : ", raw)
            console.log("Type:", message?.type, "| Full message:", message);

            switch (message?.type) {

                case "unsubscribe":
                    if (message?.actor === "server" && message?.device_id) {
                        const index = monitored_devices.value.findIndex(
                            (d) => d.device_id === message.device_id
                        );
                        if (index !== -1) {
                            console.log("🔄 Unsubscribe dari server, hapus device:", message.device_id);
                            removeMonitoredDevice(index, true);

                        }
                    } else {
                        console.warn("⚠️ initGlobalWebSocket - Unsubscribe message tidak valid:", message);
                    }
                    break;

                case "sensor_data":
                    if (message?.unit_id) {
                        const device = monitored_devices.value.find(d => d.device_id === message.unit_id);
                        if (!device) return;

                        device.sensorData = message;
                        updateChart(message.unit_id, message);
                    } else {
                        console.warn("⚠️ initGlobalWebSocket -  Sensor data tidak valid:", message);
                    }
                    break;
                case "subscribe_response":
                // do nothing, handle by selectDevice
                case "unsubscribe_response":
                // do nothing, handle by removeMonitoredDevice
                default:
                    console.log("⚠️ initGlobalWebSocket -  Pesan tidak dikenali:", message);
            }
        } catch (err) {
            console.error("❌ Error parsing WebSocket message:", err);
        }
    };

    globalWs.value = socket;
};




const selectDevice = async (deviceFromEmit) => {
    console.log(`---selectDevice---`);

    console.log(`selectDevice - deviceFromEmit: `, deviceFromEmit);
    const deviceId = deviceFromEmit.id;
    const deviceName = deviceFromEmit.name;


    isLoading.value = true;
    isShowDeviceList.value = false;

    if (monitored_devices.value.some(device => device.device_id === deviceId)) {
        console.log(`Device: ${deviceId} is already being monitored`);
        isShowDeviceList.value = false;
        return;
    }

    await initGlobalWebSocket(); // Tunggu WebSocket siap

    if (globalWs.value?.readyState !== WebSocket.OPEN) {
        console.warn("❌ WebSocket belum terbuka");
        return;
    }

    const subscribeMessage = {
        type: "subscribe",
        device_id: deviceId,
    };

    // Buat Promise untuk tunggu respons sukses/error dari server
    const waitForSubscribeResponse = new Promise((resolve, reject) => {
        const handler = (event) => {
            try {
                const message = JSON.parse(event.data);

                console.log("message: ", message)

                if (message?.type === "subscribe_response" && message?.device_id === deviceId) {
                    globalWs.value.removeEventListener("message", handler); // cleanup

                    if (message.status === "success") {
                        resolve(); // sukses
                    } else if (message.status === "error") {

                        reject(new Error("Gagal subscribe ke perangkat"));
                    }
                    else {
                        reject(new Error("Status pesan tidak dikenali"));
                    }
                }
            } catch (err) {
                console.error("❌ Gagal parse message WebSocket:", err);
            }
        };

        globalWs.value.addEventListener("message", handler);
        globalWs.value.send(JSON.stringify(subscribeMessage));
        console.log("📩 Sent subscribe message:", subscribeMessage);

        // Timeout jaga-jaga
        setTimeout(() => {
            globalWs.value.removeEventListener("message", handler);
            reject(new Error("⏳ Timeout menunggu respons subscribe"));
        }, 5000);
    });

    try {
        await waitForSubscribeResponse;

        // Baru tambahkan jika sukses
        const tempDevice = {
            device_id: deviceId,
            device_name: deviceName,
            chart: null,
            dataPoints: [],
            sensorData: {},
            subscribed: true,
        };

        monitored_devices.value = [...monitored_devices.value, tempDevice];
        await nextTick(); // ⬅️ Ini penting

        nextTick(() => initChart(deviceId));
    } catch (error) {
        console.warn("❌ Gagal tambah perangkat:", error.message);
        popUpInfoProps.value = {
            status: "error",
            errorMessage: `Gagal menyambungkan ke perangkat`,
            errorCode: "",
        };
        popUpInfoVisible.value = true;
    }


    isLoading.value = false;
};



const removeMonitoredDevice = (index, isServerAction) => {
    console.log("---removeMonitoredDevice---");
    const device = monitored_devices.value[index];
    console.log("removeMonitoredDevice - device:", device);
    if (!device) return;

    if (!isServerAction) {

        // Kirim pesan unsubscribe ke server
        if (globalWs.value?.readyState === WebSocket.OPEN) {
            const unsubscribeMessage = {
                type: "unsubscribe",
                device_id: device.device_id,
            };
            globalWs.value.send(JSON.stringify(unsubscribeMessage));
            console.log("📩 removeMonitoredDevice - Sent unsubscribe message:", unsubscribeMessage);
        }
    } else {

        popUpInfoProps.value = {
            status: "warning",
            errorMessage: `Koneksi perangkat ${device.device_name} diuputus oleh server`,
            errorCode: "",
        };
        popUpInfoVisible.value = true;


        console.log("removeMonitoredDevice - serverAction ")
    }


    // Destroy chart
    if (device.chart) {
        device.chart.destroy();
        device.chart = null;
    }

    const containerId = `chartContainer-${device.device_id}`;
    const container = document.getElementById(containerId);
    if (container) container.innerHTML = "";

    monitored_devices.value.splice(index, 1);




};


//////////////////////// ACTIVE DEVICES /////////////////////////
const isFetchingActiveDevices = ref(false); // mencegah race condition

// Filter and sort options
const selectedOrderByActiveDeviceList = ref('last_tstamp')
const selectedSortTypeActiveDeviceList = ref('DESC')
const filterActiveDeviceList = ref('')


const toogleSortType = () => {
    selectedSortTypeActiveDeviceList.value = selectedSortTypeActiveDeviceList.value === "ASC" ? "DESC" : "ASC";
}







const totalActiveDevices = ref(0)
const lastFetchedActiveDevicesPage = ref(0);
const totalActiveDevicesPage = ref(0)
const page_size = ref(10)
const scrollKeyActiveDevices = ref(0);


// Search for active_devices
const searchActiveDevice = () => {
    totalActiveDevices.value = 0;
    lastFetchedActiveDevicesPage.value = 0;
    active_devices.value = [];
    scrollKeyActiveDevices.value += 1; // trigger reset v-infinite-scroll
    getActiveDeviceList(1);
}

// Append new active_devices without duplicates
function appendActiveDevices(active_devices, additionalDevices) {
    const activeDeviceMap = new Map();
    active_devices.forEach((device) => activeDeviceMap.set(device.device_id, device));

    additionalDevices.forEach((newActiveDevice) => {
        if (!activeDeviceMap.has(newActiveDevice.device_id)) {
            active_devices.push(newActiveDevice);
            activeDeviceMap.set(newActiveDevice.device_id, newActiveDevice);
        }
    });

    return active_devices;
}

function loadActiveDevices({ done }) {
    console.group("--- loadActiveDevices() ---")
    if (totalActiveDevicesPage.value === 0) {
        done("empty");
        return;
    }
    const fetchedPageNumber = lastFetchedActiveDevicesPage.value + 1;
    console.log("last page:", lastFetchedActiveDevicesPage.value);
    console.log("Fetched page number:", fetchedPageNumber);

    setTimeout(async () => {
        await getActiveDeviceList(fetchedPageNumber);

        if (fetchedPageNumber < totalActiveDevicesPage.value) {
            done("done");
        } else {
            done("empty");
        }
    }, 1000);
    console.groupEnd();
}







// Fetch active device list
async function getActiveDeviceList(pageNumberParam) {
    console.log("---- getActiveDeviceList ----");

    if (isFetchingActiveDevices.value) {
        console.log("Fetching active_devices already in progress...");
        return;
    }

    isFetchingActiveDevices.value = true;

    try {
        // Simulated API call
        const operation = "get_device_list";
        const baseUrl = BASE_API_URL;
        const params = {
            filter: filterActiveDeviceList.value,
            order_by: selectedOrderByActiveDeviceList.value,
            sort_type: selectedSortTypeActiveDeviceList.value,
            page_number: pageNumberParam,
            page_size: page_size.value,
            st: 1, // 1 = active, 0 = inactive
        };


        console.log("getActiveDeviceList params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("getActiveDeviceList FAILED!!:", response_be.error_message);
            let popUpMessage = "Gagal Mendapatkan Data Perangkat Aktif";


            popUpInfoProps.value = {
                status: "error",
                errorMessage: popUpMessage,
                errorCode: response_be.error_code,
            };
            popUpInfoVisible.value = true;
            return;
        }


        const responseBE = response_be.payload;
        if (!responseBE.devices) {
            console.log("Device list is empty");
            return;
        }


        console.log("getActiveDeviceList SUCCESS!!");

        active_devices.value = appendActiveDevices(active_devices.value, responseBE.devices);
        totalActiveDevices.value = responseBE.total_data;
        totalActiveDevicesPage.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        console.log("Total active devices:", totalActiveDevices.value);
        console.log("Total active devices page:", totalActiveDevicesPage.value);
        lastFetchedActiveDevicesPage.value = pageNumberParam;
        console.log("Last fetched active devices page:", lastFetchedActiveDevicesPage.value);

    } catch (err) {
        console.error("ERROR WHILE GETTING ACTIVE DEVICES:", err);
    } finally {
        isFetchingActiveDevices.value = false;
    }
}




// Initialize component
onMounted(() => {
    initGlobalWebSocket();
    userTimeZone.value = getUserTimezone();

})

// Watch for filter/sort changes
watch([selectedSortTypeActiveDeviceList, selectedOrderByActiveDeviceList], () => {
    searchActiveDevice(1)
})

</script>

<style scoped>
.disable-interactions {
    pointer-events: none;
    user-select: none;
    opacity: 0.6;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.6);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>