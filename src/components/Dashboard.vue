<template>
  <v-card class="pa-4 elevation-2 fill-height">
    <v-row>
      <!-- LEFT:  Devices -->
      <v-col cols="12" md="4">
        <p class="text-subtitle-5 font-weight-bold mb-3">
          Daftar Perangkat
        </p>
        <v-card class="pa-3 fill-height" color="blue-lighten-4" elevation="1">
                     <!-- hanya system master atau admin -->
                     <v-row v-if="user_role === 'system admin' || user_role === 'system master'" class="px-2"
              style="max-height: 70px;">
              <span>Tambah Perangkat</span>
              <v-btn @click="toAddDevice">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-row>




            <!-- filter -->

            <v-row class="px-2" style="max-height: 70px;">
              <!-- Pilihan Pengurutan -->
              <!-- Filter Status -->
              <v-col cols="6">
                <v-select v-model="selectedStatus" :items="[
                  { title: 'Semua', value: '' },
                  { title: 'Aktif', value: 1 },
                  { title: 'Tidak Aktif', value: 0 }
                ]" density="compact" label="Status" variant="outlined"></v-select>
              </v-col>

              <!-- Pilihan Pengurutan -->
              <v-col cols="6" class="pr-2">
                <v-select v-model="selectedSort" :items="[
                  { title: 'Waktu terakhir', value: 'last_tstamp' },
                  { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                  { title: 'Nama perangkat', value: 'name' }
                ]" density="compact" label="Pengurutan" variant="outlined"></v-select>
              </v-col>

            </v-row>

            <!-- Serach Device -->
            <v-col class="d-flex justify-center align-center fill-width pa-0 " style="max-height: 70px;">
              <!-- Field untuk input pencarian -->
              <v-text-field v-model="filter" label="Search" placeholder="Masukkan Nama device" variant="solo" clearable
                class="px-2" style="max-height: 50px;" maxlength="50"
                :rules="[v => v.length <= 30 || 'Maksimal 30 karakter']"
                @input="filter = filter.slice(0, 30)"></v-text-field>


              <!-- Tombol Search -->
              <v-btn color="primary" @click="searchDevices"
                class="search-button rounded-circle d-flex justify-center align-center"
                style="max-height: 50px; width: 50px; min-width: 50px;">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-col>
         
         
         
          <v-infinite-scroll :key="scrollKeyDevices" id="DevicesBox" ref="DevicesBox" height="550" side="end"
            @load="loadDevices" class="overflow-auto">
            <!-- Manajemen Perangkat -->




            <!-- Device List Panel -->
            <DeviceList :devices="devices" :currDeviceId="currDeviceId" :currDeviceName="currDeviceName"
              :totalDevices="totalDevices" @select-Device="handleDeviceSelection" />
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

                <span v-if="currDeviceId">Perangkat saat ini: <strong>{{ currDeviceName }} </strong> </span>
                <span v-else>Tidak ada perangkat dipilih</span>

              </div>
              <div>
                <strong>
                  <span>Zona Waktu:
                    {{ Intl.DateTimeFormat().resolvedOptions().timeZone }}</span>
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
              <div class="border-xl" color="blue-lighten-4" style="height: 70px; width: 70px; align-content: center">
                <p class="text-caption">
                  {{ formatValue(currDeviceSensorData.Energy) }}
                </p>
              </div>
              <div class="text-caption">Energy (kWh)</div>
            </div>
          </v-col>
          <v-col cols="auto">
            <div class="text-center" align-center>
              <div class="border-xl" color="blue-lighten-4" style="height: 70px; width: 70px; align-content: center">
                <p class="text-caption">
                  {{ formatValue(currDeviceSensorData.Voltage) }}
                </p>
              </div>
              <div class="text-caption">Voltage (V)</div>
            </div>
          </v-col>

          <v-col cols="auto">
            <div class="text-center">
              <div class="border-xl" color="blue-lighten-4" style="height: 70px; width: 70px; align-content: center">
                <p class="text-caption">
                  {{ formatValue(currDeviceSensorData.Current) }}
                </p>
              </div>
              <div class="text-caption">Current (A)</div>
            </div>
          </v-col>

          <v-col cols="auto">
            <div class="text-center">
              <div class="border-xl" color="blue-lighten-4" style="height: 70px; width: 70px; align-content: center">
                <p class="text-caption">
                  {{ formatValue(currDeviceSensorData.Frequency) }}
                </p>
              </div>
              <div class="text-caption">Frequency (Hz)</div>
            </div>
          </v-col>

          <v-col cols="auto">
            <div class="text-center">
              <div class="border-xl" color="blue-lighten-4" style="height: 70px; width: 70px; align-content: center">
                <p class="text-caption">
                  {{ formatValue(currDeviceSensorData.Power_factor) }}
                </p>
              </div>
              <div class="text-caption">Power Factor</div>
            </div>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- {{ currDeviceSensorData.value.Tstamp   }} -->

    <!--  {{ convertEpochToUserTimezone(currDeviceSensorData.Tstamp)}} -->
  </v-card>


  <PopUpBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
    :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
    @close="closePopup" />
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
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Process } from "@/utils/requestHelper";
import { BASE_API_URL, WS_API_URL } from "@/configs/config";

import { createSocketConnection } from "@/utils/wsHelper";

import CanvasJS, { addTheme } from "@canvasjs/charts";

import DeviceList from "./monitoring/DeviceList.vue";

const popUpProps = ref({
  status: "",
  errorMessage: "",
  errorCode: "",
});

const popupVisible = ref(false);
const closePopup = () => {
  popupVisible.value = false;
};

//////////////////  //////////////////

const user_role = ref("");
















//////////////////  MONITORING VUE COMPONENT //////////////////

// ** Deklarasi Variabel Reaktif **
const currDeviceId = ref(null);
const currDeviceSensorData = ref({});
const dataPoints = ref([]);
const maxDataLength = ref(50);
let chart = null;
let socket = null;

// const deviceMetrics = {
//   Energy: "Energy (kWh)",
//   Voltage: "Voltage (V)",
//   Current: "Current (A)",
//   Frequency: "Frequency (Hz)",
//   Power_factor: "Power Factor",
// };

const epochMs = 1740107571694;
const date = new Date(epochMs);

console.log("UTC Time:", date.toISOString());
console.log(
  "Local Time:",
  date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
);

const formatValue = (value) =>
  value === undefined || value === null ? "-" : value.toFixed(2);

import { computed } from "vue";

const updateChart = (newData) => {
  console.log("updateChart(), newData:", newData);
  if (!newData.Tstamp || newData.Power === undefined) {
    console.warn("❌ Data tidak valid untuk chart:", newData);
    return;
  }

  // Konversi Tstamp (string) menjadi objek Date
  const parsedDate = new Date(newData.Tstamp);

  const newPoint = { x: parsedDate, y: newData.Power };
  dataPoints.value.push(newPoint);

  if (dataPoints.value.length > maxDataLength.value) {
    dataPoints.value.shift();
  }

  console.log("🔍 Before push, dataPoints.length:", dataPoints.value.length);
  console.log("updateChart(), After push: ", [...dataPoints.value]);

  if (chart) {
    console.log("🖌️ Rendering chart...");
    chart.options.data[0].dataPoints = [...dataPoints.value]; // Pastikan data diupdate
    chart.render();
  } else {
    console.log("⚠️ Chart belum ada, menunggu data lebih banyak...");
  }
};


const initChart = () => {
  console.log("initChart(), dataPoints.value:  ", dataPoints.value);
  chart = new CanvasJS.Chart("chartContainer", {
    theme: "dark2",
    animationEnabled: true,
    axisX: {
      title: "Waktu (jam:mnt:dtk.milidtk)",
      valueFormatString: "HH:mm:ss.SSS", // Format waktu dengan milidetik
      labelFormatter: function (e) {
        return e.value.toISOString().slice(11, 23); // Mengambil HH:mm:ss.SSS dari UTC
      },
    },

    axisY: {
      title: "Power (W)",
    },
    data: [
      {
        type: "line",
        markerSize: 8, // Ukuran titik
        markerColor: "#39FF14", // Neon hijau
        lineColor: "#1F51FF",
        dataPoints: dataPoints.value.length
          ? dataPoints.value
          : [{ x: new Date(), y: 0 }],
      },
    ],
  });

  chart.render();
};


const startWebSocket = async () => {
  if (!currDeviceId.value) return;

  // Pastikan WebSocket lama ditutup sebelum membuka yang baru
  if (socket) {
    console.log("🛑 Menutup koneksi WebSocket lama...");
    socket.close();
    socket = null;
  }

  console.log("🌐 Membuka koneksi WebSocket baru...");

  const operation = "user-connect";
  const baseUrl = WS_API_URL;
  const params = { device_id: currDeviceId.value };

  console.log("createSocketConnection params:", params);

  try {
    const result = await createSocketConnection(baseUrl, operation, params);

    if (result?.error) {
      console.error("⚠️ WebSocket gagal terhubung:", result.error);

      let popUpMessage = "Gagal terhubung ke perangkat ";

      popUpProps.value = {
        status: "error",
        errorMessage: popUpMessage,
        errorCode: "",
      };
      return;
    }

    socket = result; // WebSocket instance

    socket.onopen = () => {
      console.log("✅ WebSocket connected:", socket.url);
      if (!chart) {
        console.log("Reinitializing chart...");
        initChart();
      }
    };

    socket.onerror = (err) => console.error("⚠️ WebSocket error:", err);
    socket.onclose = () => {
      console.warn("❌ WebSocket disconnected.")

      let popUpMessage = "Koneksi dengan perangkat terputus.";

      popUpProps.value = {
        status: "error",
        errorMessage: popUpMessage,
        errorCode: "",
      };


    }

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📡 Data received:", message);
        console.log("📡 Data received current:", message.Current);
        console.log("📡 Data received tstamp:", message.Tstamp);
        console.log("📡 Data received Power:", message.Power);

        if (message.Device_Id === currDeviceId.value) {
          currDeviceSensorData.value = message;
          updateChart(message);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);

      }
    };
  } catch (error) {
    console.error("❌ Gagal membuat koneksi WebSocket:", error);
    let popUpMessage = "Gagal terhubung ke perangkat ";
    popUpProps.value = {
      status: "error",
      errorMessage: popUpMessage,
      errorCode: "",
    };
  }
};

onMounted(() => {


  // get user role
  const user_data = JSON.parse(localStorage.getItem('user_data'));
  //  console.log('user_data', user_data);
  user_role.value = user_data?.role;
  console.log('user_role', user_role.value);



  searchDevices();


  // startWebSocket();
});

onUnmounted(() => {
  socket?.close();
});

watch(currDeviceId, (newDeviceId) => {
  console.log(`🔄 Device berubah: ${newDeviceId}, reinit chart!`);
  dataPoints.value = []; // Reset data saat ganti device
  initChart();
});









//////////////////// DEVICES////////////////////

const selectedSort = ref("last_tstamp"); // Default: Waktu terakhir
const selectedStatus = ref(1); // Default: Semua perangkat aktif


const filter = ref('');
const devices = ref([]);
const page_size = ref(10);
const totalPagesDevices = ref(0);
const totalDevices = ref();
const currDeviceName = ref('')



watch(selectedSort, (newSort) => {
  console.log(`��� Sorting berubah: ${newSort}`);
  searchDevices();
});

watch(selectedStatus, (newStatus) => {
  console.log(`��� Status perangkat berubah: ${newStatus}`);
  searchDevices();
});


const lastFetchedPageDevices = ref(0);
//const newDevice = ref()

const scrollKeyDevices = ref(0);

function resetScrollDevices() {
  scrollKeyDevices.value += 1;
}

const isFetchingDevices = ref(false); // mencegah race condition

function handleDeviceSelection(deviceId, deviceName) {
  if (deviceId == currDeviceId.value) {
    console.log(`Device id: ${deviceId} already selected`);
    return;
  }

  // Resetkan data yang terkait dengan perangkat yang sebelumnya
  currDeviceSensorData.value = {};
  dataPoints.value = [];

  // Reset chart dengan data kosong
  if (chart) {
    chart.options.data[0].dataPoints = []; // Kosongkan data points
    chart?.render();
    console.log("📈 Chart updated:", dataPoints.value.length);
  }

  console.log("Selected Device:", deviceId, deviceName);

  // Set device yang aktif
  currDeviceId.value = deviceId;
  currDeviceName.value = deviceName;

  // Mulai koneksi WebSocket dengan device baru
  startWebSocket();
}

function loadDevices({ done }) {
  console.log("--- loadDevices() ---");

  if (totalPagesDevices.value === 0) {
    done("empty");
    return;
  }


  const fetchedPageNumber = lastFetchedPageDevices.value + 1;
  console.log("last page:", lastFetchedPageDevices.value);
  console.log("Fetched page number:", fetchedPageNumber);

  setTimeout(async () => {
    await getDeviceList(fetchedPageNumber);

    if (fetchedPageNumber < totalPagesDevices.value) {
      done("done");
    } else {
      done("empty");
    }
  }, 1000);
}

function appendDevices(devices, additionalDevices) {
  const deviceMap = new Map();
  devices.forEach((device) => {
    deviceMap.set(device.device_id, device);
  });

  additionalDevices.forEach((newDevice) => {
    if (!deviceMap.has(newDevice.device_id)) {
      devices.push(newDevice);
      deviceMap.set(newDevice.device_id, newDevice);
    }
  });

  return devices;
}
const tempSelectedSort = ref(selectedSort.value);
const tempSelectedStatus = ref(selectedStatus.value);

function searchDevices() {
  // Update nilai utama saat tombol search ditekan
  selectedSort.value = tempSelectedSort.value;
  selectedStatus.value = tempSelectedStatus.value;

  resetScrollDevices();
  lastFetchedPageDevices.value = 0;
  devices.value = []; // Reset daftar perangkat sebelum pencarian baru
  getDeviceList(1); // Fetch data dengan parameter baru
}


async function getDeviceList(pageNumber) {
  if (isFetchingDevices) {
    console.log("Fetching devices already in progress...");
    await new Promise((resolve) => setTimeout(resolve, 200)); // delay
  }

  try {
    const operation = "get_device_list";
    const baseUrl = BASE_API_URL;
    const params = {
      filter: filter.value,
      order_by: selectedSort.value,
      page_number: pageNumber,
      page_size: page_size.value,
      st: selectedStatus.value,
    };

    console.log("getDeviceList params:", params);
    const response_be = await Process(baseUrl, operation, params);

    if (response_be.status !== "success") {
      console.error("getDeviceList FAILED!!:", response_be.error_message);
      let popUpMessage = "Gagal Mendapatkan Data Perangkat Aktif";


      popUpProps.value = {
        status: "error",
        errorMessage: popUpMessage,
        errorCode: response_be.error_code,
      };
      popupVisible.value = true;
      return;
    }

    const responseBE = response_be.payload;
    if (!responseBE.devices) {
      console.log("Device list is empty");
      return;
    }

    console.log("getDeviceList SUCCESS!!");
    devices.value = appendDevices(devices.value, responseBE.devices);
    totalDevices.value = responseBE.total_data;
    totalPagesDevices.value = Math.ceil(responseBE.total_data / Number(page_size.value));
    lastFetchedPageDevices.value = pageNumber;

    console.log("totalPagesDevices: ", totalPagesDevices.value);
    console.log("totalDevices: ", totalDevices.value);
  } catch (err) {
    console.error("ERROR WHILE GETTING DEVICES:", err);
  }
}

// data akan di fecth dengan triger gulir
/* async function getDeviceList(pageNumber) {
  if (isFetchingDevices == true) {
    console.log("Fething devices already in progress...");
    await new Promise((resolve) => setTimeout(resolve, 200)); // delay
  }

  try {
    //rules param fields a to z
    const operation = "get_device_list";
    //  const operation = "get_dummy__devices";
    const baseUrl = BASE_API_URL;
    const params = {
      filter: filter.value,
      order_by: selectedSort.value,
      page_number: pageNumber,
      page_size: page_size.value,
      st: selectedStatus.value
    };

    console.log("getDeviceList params:", params);
    const response_be = await Process(baseUrl, operation, params);

    //  console.log("login response_be:", response_be);

    if (response_be.status != "success") {
      console.error("getDeviceList FAILED!!:", response_be.error_message);

      let popUpMessage = "Gagal Mendapatkan Data Perangkat Aktif";

      popUpProps.value = {
        status: response_be.status,
        errorMessage: popUpMessage,
        errorCode: response_be.error_code,
      };
      popupVisible.value = true;
      return;
    }

    if (response_be.status === "success") {
      let responseBE = response_be.payload;

      if (responseBE.devices) {
        console.log("getDeviceList SUCCESS!!:");

        devices.value = appendDevices(
          devices.value,
          responseBE.devices
        );
        totalDevices.value = responseBE.total_data;

        totalPagesDevices.value = Math.ceil(
          responseBE.total_data / Number(page_size.value)
        );

        console.log("totalPagesDevices: ", totalPagesDevices.value);
        console.log("totalDevices: ", totalDevices.value);

        lastFetchedPageDevices.value = pageNumber;
      } else {
        console.log(" device list is empty");
      }
    } else {
      console.error("get__devices FAILED!!:", response_be.error_message);


      let popUpMessage = "Gagal Mendapatkan Data Perangkat Aktif";
      popUpProps.value = {
        status: response_be.status,
        errorMessage: popUpMessage,
        errorCode: response_be.error_code,
      };
      popupVisible.value = true;




    }
  } catch (err) {
    console.log("ERROR WHILE GETTING  DEVICES: " + err);
  }
}
 */



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
