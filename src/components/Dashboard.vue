<template>
    <v-card class="pa-4 elevation-2 fill-height">
        <v-row>
            <!-- Sidebar Active Devices -->
            <v-col cols="3">
                <p class="text-subtitle-5 font-weight-bold mb-3">Daftar Perangkat Aktif</p>
                <v-card class="pa-3" color="blue-lighten-4" elevation="1">
                    <v-infinite-scroll :key="scrollKeyActiveDevices" id="activeDevicesBox" ref="activeDevicesBox"
                        height="400" side="end" @load="loadDevices" class="overflow-auto">
                        <!-- Active Device Panel -->
                        <ActiveDevicesList :activeDevices="activeDevices" :currActiveDeviceId="currActiveDeviceId"
                            @select-device="handleDeviceSelection" />


                    </v-infinite-scroll>
                </v-card>
            </v-col>

            <!-- Live Monitoring -->
            <v-col cols="9">
                <h2 class="text-h5 font-weight-bold mb-3">Live Monitoring</h2>
                <v-card class="pa-4" color="blue-lighten-4" elevation="1">
                    <div class="mb-2">Perangkat saat ini: <strong>{{ currActiveDeviceId ||
                        ''
                            }}</strong></div>
                    <div id="chartContainer" class="chart-container"></div>
                </v-card>
            </v-col>
        </v-row>
    </v-card>
</template>

<style scoped>
/* Memastikan list device scrollable */
.overflow-auto {
    overflow-y: auto;
}

/* Ukuran chart */
.chart-container {
    height: 400px;
    width: 100%;
}
</style>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Process, getApiUrl } from '@/utils/requestHelper';
import { connectWebSocket } from '@/utils/websocket';
import CanvasJS from "@canvasjs/charts";

import ActiveDevicesList from './parts/ActiveDevicesList.vue'

//////////////////// ACTIVE DEVICES////////////////////

const ActiveDevices = ref([]);

const currActiveDeviceId = ref(0);
const activeDevices = ref([]);
const page_size = ref(10)
const totalActiveDevices = ref(0);

const lastFetchedPageActiveDevices = ref(0)
//const newActiveDevice = ref()

const scrollKeyActiveDevices = ref(0)

function resetScrollActiveDevices() {
    scrollKeyActiveDevices.value += 1
}

const isFetchingActiveDevices = ref(false)// mencegah race condition


/* function loadDevices({ done }) {
    const fetchedPageNumber = Number(lastFetchedPageActiveDevices.value) + 1;
    setTimeout(async () => {
        await getActiveDevices(fetchedPageNumber.toString());
        if (fetchedPageNumber < totalActiveDevices.value) {
            done('done');
        } else {
            done('empty');
        }
    }, 1000);
} */

function handleDeviceSelection(deviceId) {
    if (deviceId == currActiveDeviceId.value) {
        console.log(`Device id:    ${deviceId} already selected`)
        return
    }


    console.log("Selected Device ID:", deviceId);
    currActiveDeviceId.value = deviceId; // Set device yang aktif
    startWebSocket(); // Mulai koneksi WebSocket
}


async function loadDevices({ done }) {
    if (isFetchingActiveDevices.value) {
        return;
    }

    isFetchingActiveDevices.value = true;
    const fetchedPageNumber = lastFetchedPageActiveDevices.value + 1;

    await getActiveDevices(fetchedPageNumber, page_size.value);

    lastFetchedPageActiveDevices.value = fetchedPageNumber;

    if (fetchedPageNumber * page_size.value >= totalActiveDevices.value) {
        done('empty');
    } else {
        done('done');
    }

    isFetchingActiveDevices.value = false;
}



function appendActiveDevices(activeDevices, additionalDevices) {
    const deviceMap = new Map();
    activeDevices.forEach(device => {
        deviceMap.set(device.device_id, device);
    });

    additionalDevices.forEach(newActiveDevice => {
        if (!deviceMap.has(newActiveDevice.device_id)) {
            activeDevices.push(newActiveDevice);
            deviceMap.set(newActiveDevice.device_id, newActiveDevice);
        }
    });

    return activeDevices;
}




// data akan di fecth dengan triger gulir
async function getActiveDevices(pageNumber) {

    if (isFetchingActiveDevices == true) {
        console.log("Fething active devices already in progress...")
        await new Promise(resolve => setTimeout(resolve, 200)) // delay
    }

    try {
        const operation = "get_active_devices";
        const baseUrl = getApiUrl();
        const params = {
            page_number: pageNumber,
            page_size: page_size.value
        };


        console.log("getActiveDevices params:", params);
        const response_be = await Process(baseUrl, operation, params);

        //  console.log("login response_be:", response_be);


        if (response_be.status != "success") {
            console.error("getActiveDevices FAILED!!:", response_be.error_message);
            /*  popUpProps.value = {
                 status: response_be.status,
                 errorMessage: response_be.error_message,
                 errorCode: response_be.error_code,
             }; */
            return;
        }


        if (response_be.status === "success") {
            let responseBE = response_be.payload;

            if (responseBE.devices) {
                console.log("getActiveDevices SUCCESS!!:");


                activeDevices.value = appendActiveDevices(activeDevices.value, responseBE.devices);
                totalActiveDevices.value = Math.ceil(responseBE.total_data / Number(page_size.value));
                lastFetchedPageActiveDevices.value = pageNumber;
            } else {
                console.log('Active device list is empty');
            }
        } else {
            console.error("get_active_devices FAILED!!:", response_be.error_message);
        }

    } catch (err) {
        console.log("ERROR WHILE GETTING ACTIVE DEVICES: " + err)
    }
}





//////////////////// REALTIME CHART ////////////////////
const dataPoints = ref([]);
let chart = null;
const maxDataLength = ref(50);


// **Fungsi untuk mengupdate chart**
const updateChart = (newData) => {
    // Tambahkan data baru
    dataPoints.value.push({
        x: new Date(newData.Tstamp * 1000),
        y: newData.Power
    });

    // Hapus data lama jika lebih dari 20
    if (dataPoints.value.length > maxDataLength.value) {
        dataPoints.value.shift();
    }

    // Render ulang chart
    if (chart) {
        chart.render();
    }
};

// **Fungsi untuk inisialisasi chart**
const initChart = () => {
    chart = new CanvasJS.Chart("chartContainer", {
        title: { text: "" },
        axisX: { valueFormatString: "HH:mm:ss" },
        axisY: { title: "Power (W)" },
        data: [{
            type: "line",
            dataPoints: dataPoints.value
        }]
    });

    chart.render();
};

// **Fungsi untuk menangani WebSocket**

let socket = null;

const startWebSocket = () => {

    if (currActiveDeviceId.value != 0 || currActiveDeviceId.value != null) {

        socket = connectWebSocket(currActiveDeviceId.value);

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("📡 Data received:", message);
                updateChart(message);
            } catch (error) {
                console.error("❌ Error parsing WebSocket message:", error);
            }
        };

    }

};




onMounted(() => {

    initChart();
    startWebSocket();

});

onUnmounted(() => {
    if (socket) {
        socket.disconnect();
    }
});
</script>

<style scoped>
.v-card {
    border-radius: 12px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
