<template>
 <v-card class="pa-4 elevation-2 fill-height">
        <v-row>
            <!-- Sidebar Active Devices -->
            <v-col cols="3">
                <v-card class="pa-3" color="blue-lighten-4" elevation="1">
                    <p class="text-subtitle-5 font-weight-bold mb-3">Daftar Perangkat Aktif</p>
                    <v-infinite-scroll :key="scrollKeyActiveDevices" id="activeDevicesBox" ref="activeDevicesBox"
                        height="400" side="end" @load="loadDevices" class="overflow-auto">
                        <!-- Active Device Panel -->
                        <ActiveDevicesList :activeDevices="activeDevices" :current-currActiveDeviceId="currActiveDeviceId"
                            @select-device="(data) => {}" />
                        <template v-slot:empty>
                            <span class="text-caption text-grey">Tidak ada perangkat aktif</span>
                        </template>
                    </v-infinite-scroll>
                </v-card>
            </v-col>

            <!-- Live Monitoring -->
            <v-col cols="9">
                <h2 class="text-h5 font-weight-bold mb-3">Live Monitoring</h2>
                <v-card class="pa-4" color="blue-lighten-4" elevation="1">
                    <div class="mb-2">Perangkat saat ini: <strong>{{ activeDevices[currActiveDeviceId]?.device_name || 'Tidak ada' }}</strong></div>
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


const currActiveDeviceId = ref(0);
const activeDevices = ref([]);
const activeDevices_page_size = ref(10)
const activeDevices_page_number = ref(0)
const availableDevices = ref([]);
const totalActiveDevices = ref(0);
const lastFetchedPageActiveDevices = ref('')
const newActiveDevices = ref("")

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

async function loadDevices({ done }) {
    if (isFetchingActiveDevices.value) {
        return;
    }

    isFetchingActiveDevices.value = true;
    const fetchedPageNumber = lastFetchedPageActiveDevices.value + 1;

    await getActiveDevices(fetchedPageNumber, activeDevices_page_size.value);

    lastFetchedPageActiveDevices.value = fetchedPageNumber;

    if (fetchedPageNumber * activeDevices_page_size.value >= totalActiveDevices.value) {
        done('empty');
    } else {
        done('done');
    }

    isFetchingActiveDevices.value = false;
}



function appendActiveDevices(activeDevices, additionalDevices) {
    const deviceMap = new Map(activeDevices.map(device => [device.device_id, device]));

    additionalDevices.forEach(newDevice => {
        if (!deviceMap.has(newDevice.device_id)) {
            activeDevices.push(newDevice);
            deviceMap.set(newDevice.device_id, newDevice);
        }
    });

    activeDevices.sort((a, b) => a.device_name.localeCompare(b.device_name));
    return activeDevices;
}




// data akan di fecth dengan triger gulir
async function getActiveDevices(page_number, page_size) {

    if (isFetchingActiveDevices == true) {
        console.log("Fething active devices already in progress...")
        await new Promise(resolve => setTimeout(resolve, 200)) // delay
    }

    try {
        const operation = "get_active_devices";
        const baseUrl = getApiUrl();
        const params = {
            page_number: page_number,
            page_size: page_size
        };


        console.log("getActiveDevices params:", params);
        const response_be = await Process(baseUrl, operation, params);

        //  console.log("login response_be:", response_be);


        if (response_be.status != "success") {
            console.error("get_active_devices FAILED!!:", response_be.error_message);
           /*  popUpProps.value = {
                status: response_be.status,
                errorMessage: response_be.error_message,
                errorCode: response_be.error_code,
            }; */
        }


        if (response_be.status === "success") {
            let responseBE = response_be.payload;

            if (responseBE.devices) {
                console.log("get_active_devices SUCCESS!!:");
                activeDevices.value = appendActiveDevices(activeDevices.value, responseBE.devices);
                totalActiveDevices.value = Math.ceil(responseBE.total_data / Number(activeDevices_page_size.value));
                lastFetchedPageActiveDevices.value = page_number;
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
        title: { text: "Live Power Usage" },
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

    if (currActiveDeviceId.value != 0) {

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
