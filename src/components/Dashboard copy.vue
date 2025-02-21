<template>
    <v-card class="pa-4 elevation-2 fill-height">
        <v-row>

            <!-- LEFT: Active Devices -->
            <v-col cols="12" md="4">
                <p class="text-subtitle-5 font-weight-bold mb-3">Daftar Perangkat Aktif</p>
                <v-card class="pa-3" color="blue-lighten-4" elevation="1">
                    <v-infinite-scroll :key="scrollKeyActiveDevices" id="activeDevicesBox" ref="activeDevicesBox"
                        height="400" side="end" @load="loadDevices" class="overflow-auto">
                        <!-- Active Device Panel -->
                        <ActiveDevicesList :activeDevices="activeDevices" :currActiveDeviceId="currActiveDeviceId"
                            :totalActiveDevices="totalActiveDevices" @select-activeDevice="handleDeviceSelection" />
                    </v-infinite-scroll>
                </v-card>
            </v-col>

            <!-- RIGHT SIDE: Live Monitoring -->
            <v-col cols="12" md="8">
                <h2 class="text-h5 font-weight-bold mb-3">Live Monitoring</h2>
                <v-card class="pa-4" color="blue-lighten-4" elevation="1">
                    <div class="mb-2">
                        <div class="d-flex justify-space-between align-center">
                            <div>
                                <strong>
                                    <span v-if="currActiveDeviceId">Perangkat saat ini: {{ currActiveDeviceId }}</span>
                                    <span v-else>Tidak ada perangkat dipilih</span>
                                </strong>
                            </div>
                            <div>
                                <strong>
                                    <span>Zona Waktu: {{ Intl.DateTimeFormat().resolvedOptions().timeZone }}</span>
                                </strong>
                            </div>
                        </div>
                    </div>

                    <div id="chartContainer" class="chart-container"></div>

                </v-card>



                <!-- Qunatity value -->



                <v-row justify="space-around" class="mt-4">
                    <v-col cols="auto">
                        <div class="text-center" align-center>
                            <div class="border-xl" color="blue-lighten-4"
                                style="height: 70px; width: 70px; align-content: center;">
                                <p class="text-caption">{{ formatValue(currDeviceData.Energy) }} </p>
                            </div>
                            <div class="text-caption">Energy (kWh)</div>
                        </div>
                    </v-col>
                    <v-col cols="auto">
                        <div class="text-center" align-center>
                            <div class="border-xl" color="blue-lighten-4"
                                style="height: 70px; width: 70px; align-content: center">
                                <p class="text-caption">{{ formatValue(currDeviceData.Voltage) }}</p>
                            </div>
                            <div class="text-caption">Voltage (V)</div>
                        </div>
                    </v-col>

                    <v-col cols="auto">
                        <div class="text-center">
                            <div class="border-xl" color="blue-lighten-4"
                                style="height: 70px; width: 70px; align-content: center">
                                <p class="text-caption">{{ formatValue(currDeviceData.Current) }}</p>
                            </div>
                            <div class="text-caption">Current (A)</div>
                        </div>
                    </v-col>

                    <v-col cols="auto">
                        <div class="text-center">
                            <div class="border-xl" color="blue-lighten-4"
                                style="height: 70px; width: 70px; align-content: center">
                                <p class="text-caption">{{ formatValue(currDeviceData.Frequency) }}</p>
                            </div>
                            <div class="text-caption">Frequency (Hz)</div>
                        </div>
                    </v-col>

                    <v-col cols="auto">
                        <div class="text-center">
                            <div class="border-xl" color="blue-lighten-4"
                                style="height: 70px; width: 70px; align-content: center">
                                <p class="text-caption">{{ formatValue(currDeviceData.Power_factor) }}</p>
                            </div>
                            <div class="text-caption">Power Factor</div>
                        </div>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        {{ formattedTimestamp }}


        <!--  {{ convertEpochToUserTimezone(currDeviceData.Tstamp)}} -->
    </v-card>
</template>

<style scoped>
/* Memastikan list device scrollable */
.overflow-auto {
    overflow-y: auto;
}

/* Ukuran chart */
.chart-container {
    height: 350px;
    width: 100%;
}
</style>


<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { Process, getApiUrl } from '@/utils/requestHelper';
import { connectWebSocket } from '@/utils/websocket';
import CanvasJS, { addTheme } from "@canvasjs/charts";

import ActiveDevicesList from './parts/ActiveDevicesList.vue'


// ** Deklarasi Variabel Reaktif **
const currActiveDeviceId = ref(null); // ✅ Menambahkan deklarasi yang hilang
const currDeviceData = ref({});
const dataPoints = ref([]);
const maxDataLength = ref(50);
let chart = null;
let socket = null;

const deviceMetrics = {
    Energy: 'Energy (kWh)',
    Voltage: 'Voltage (V)',
    Current: 'Current (A)',
    Frequency: 'Frequency (Hz)',
    Power_factor: 'Power Factor',
};

const epochMs = 1740107571694;
const date = new Date(epochMs);

console.log("UTC Time:", date.toISOString());
console.log("Local Time:", date.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }));



const formatValue = (value) =>
    value === undefined || value === null ? '-' : value.toFixed(2);


import { computed } from 'vue';

const formattedTimestamp = computed(() => {
    return currDeviceData.value.Tstamp ? convertEpochToUserTimezone(currDeviceData.value.Tstamp) : '-';
});


const timeCache = new Map();

const convertEpochToUserTimezone = (epochMs) => {
    if (timeCache.has(epochMs)) {
        return timeCache.get(epochMs);
    }

    console.log('convertEpochToUserTimezone(),  epochMs:', epochMs);
    const date = new Date(epochMs);
    console.log('convertEpochToUserTimezone(),  date:', date);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
        hour12: false
    }).format(epochMs);

    timeCache.set(epochMs, formattedDate);
    return formattedDate;
};


const updateChart = (newData) => {
    console.log('updateChart(), newData:', newData);
    if (!newData.Tstamp || newData.Power === undefined) {
        console.warn("❌ Data tidak valid untuk chart:", newData);
        return;
    }

    const newPoint = { x: new Date(newData.Tstamp), y: newData.Power };
    dataPoints.value.push(newPoint);

    if (dataPoints.value.length > maxDataLength.value) {
        dataPoints.value.shift();
    }

    console.log("🔍 Before push, dataPoints.length:", dataPoints.value.length);


    console.log("updateChart(), After push: ", [...dataPoints.value]);

    if (chart) {
        console.log("🖌️ Rendering chart...");
        chart.render();
    } else {
        console.log("⚠️ Chart belum ada, menunggu data lebih banyak...");
    }

};


const initChart = () => {
    console.log('initChart(), dataPoints.value:  ', dataPoints.value);
    chart = new CanvasJS.Chart("chartContainer", {
        theme: 'dark2',
        animationEnabled: true,
        axisX: {
            title: "Waktu (hh:mm:ss::ms)",
            //  labelFormatter: (e) => convertEpochToUserTimezone(e.value)
            labelFormatter: (e) => Math.floor(e.value.getTime())
        },
        axisY: {
            title: "Power (W)"
        },
        data: [{
            type: "line",
            dataPoints: dataPoints.value.length ? dataPoints.value : [{ x: new Date(), y: 0 }]
        }]
    });

    chart.render();
};


const startWebSocket = () => {
    if (!currActiveDeviceId.value) return;

    // Pastikan WebSocket lama ditutup sebelum membuka yang baru
    if (socket) {
        console.log("🛑 Menutup koneksi WebSocket lama...");
        socket.close();
        socket = null;
    }

    console.log("🌐 Membuka koneksi WebSocket baru...");
    socket = connectWebSocket(currActiveDeviceId.value);

    socket.onopen = () => {
        console.log("✅ WebSocket connected:", socket.url);
        if (!chart) {
            console.log("Reinitializing chart...");
            initChart();
        }
    };


    socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);
    socket.onclose = () => console.warn("❌ WebSocket disconnected.");

    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            console.log("📡 Data received:", message);
            console.log("📡 Data received current:", message.Current);
            console.log("📡 Data received tstamp:", message.Tstamp);
            console.log("📡 Data received Power:", message.Power);

            if (message.Device_Id === currActiveDeviceId.value) {
                currDeviceData.value = message;
                updateChart(message);
            }
        } catch (error) {
            console.error("❌ Error parsing WebSocket message:", error);
        }
    };

};




onMounted(() => {
    // initChart();
    startWebSocket();
});

onUnmounted(() => {
    socket?.close();
});

watchEffect(() => {
    if (dataPoints.value.length > 0 && !chart) {
        console.log("✅ Inisialisasi Chart setelah ada data!");
        initChart();
    }
});



/* watchEffect(() => {
    if (currActiveDeviceId.value) {
        console.log("🔄 Reconnecting WebSocket...");
        startWebSocket();
    }
});
 */






//////////////////// ACTIVE DEVICES////////////////////




const activeDevices = ref([]);
const page_size = ref(10)
const totalPagesActiveDevices = ref(0);
const totalActiveDevices = ref();

const lastFetchedPageActiveDevices = ref(0)
//const newActiveDevice = ref()

const scrollKeyActiveDevices = ref(0)

function resetScrollActiveDevices() {
    scrollKeyActiveDevices.value += 1
}

const isFetchingActiveDevices = ref(false)// mencegah race condition



function handleDeviceSelection(deviceId) {
    if (deviceId == currActiveDeviceId.value) {
        console.log(`Device id: ${deviceId} already selected`);
        return;
    }

    // Resetkan data yang terkait dengan perangkat yang sebelumnya
    currDeviceData.value = {};
    dataPoints.value = [];

    // Reset chart dengan data kosong
    if (chart) {
        chart.options.data[0].dataPoints = []; // Kosongkan data points
        chart?.render();
        console.log("📈 Chart updated:", dataPoints.value.length);
    }

    console.log("Selected Device ID:", deviceId);

    // Set device yang aktif
    currActiveDeviceId.value = deviceId;

    // Mulai koneksi WebSocket dengan device baru
    startWebSocket();
}



function loadDevices({ done }) {
    console.log("--- loadDevices() ---");

    const fetchedPageNumber = lastFetchedPageActiveDevices.value + 1;
    console.log("last page:", lastFetchedPageActiveDevices.value);
    console.log("Fetched page number:", fetchedPageNumber);

    setTimeout(async () => {
        await getActiveDevices(fetchedPageNumber);
        if (fetchedPageNumber < totalPagesActiveDevices.value) {
            done('done');
        } else {
            done('empty');
        }
    }, 1000);

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
        //  const operation = "get_dummy_active_devices";
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
                totalActiveDevices.value = responseBE.total_data;

                totalPagesActiveDevices.value = Math.ceil(responseBE.total_data / Number(page_size.value));

                console.log("totalPagesActiveDevices: ", totalPagesActiveDevices.value);
                console.log("totalActiveDevices: ", totalActiveDevices.value);

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



/* 

    exp data: {    "Device_Id": 1,
    "Tstamp": 1739882173782,  // ms
    "Voltage": 290.5,
    "Current": 2.3,
    "Power": 510.15,
    "Energy": 1560.75,
    "Frequency": 50.1,
    "Power_factor": 0.98}



*/
</script>

<style scoped></style>




<!-- 
/* {

exp data: 
  "Device_Id": 1,
  "Tstamp": 1739877414000,  // ms
  "Voltage": 290.5,
  "Current": 2.3,
  "Power": 510.15,
  "Energy": 1560.75,
  "Frequency": 50.1,
  "Power_factor": 0.98
  
} */


//////////////////// REALTIME CHART ////////////////////
const dataPoints = ref([]);
const currDeviceData = ref({});
let chart = null;
const maxDataLength = ref(50);

// Define the current date
const currentDate = new Date();
const month_name_ind = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']

// Function to format value
const formatValue = (value) => {
    if (value === undefined || value === null) {
        return '-'; // Show '-' if value is missing
    }
    return value.toFixed(2); // Format number to 2 decimal places
};

// **Fungsi untuk mengupdate chart**
const updateChart = (newData) => {
    // Add new data point
    console.log("--- updateChart() ----");
    dataPoints.value.push({
        x: new Date(newData.Tstamp),
        y: newData.Power
    });

    console.log("dataPoints:", dataPoints.value);

    // Remove old data if there are more than maxDataLength
    if (dataPoints.value.length > maxDataLength.value) {
        dataPoints.value.shift(); // Remove the first element
    }

    // Re-render the chart
    if (chart) {
        chart.render();
    }
};

// **Fungsi untuk inisialisasi chart**
const initChart = () => {
    chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: `${currentDate.getDate()} ${month_name_ind[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        },
        axisX: {
            title: "Waktu (j:m:d:ms)",  // Axis X title
            valueFormatString: "H:msH:mm:ss"  // Time format
        },
        axisY: {
            title: "Power (W)"
        },
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
    if (currActiveDeviceId.value !== 0 && currActiveDeviceId.value !== null) {  
        socket = connectWebSocket(currActiveDeviceId.value);

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("📡 Data received:", message);

                updateChart(message);
                currDeviceData.value = message;
                console.log("Device message:", currDeviceData.value);
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
 -->
