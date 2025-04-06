<!-- DONT REMOVE COMENTS -->


<template>
  <v-card class="pa-4 elevation-2 fill-height" style="min-height: 100px;"
    :class="{ 'disable-interactions': isLoading }">

    <v-progress-circular v-if="isLoading" color="primary" indeterminate class="loading-spinner"></v-progress-circular>

    <v-row>


      <!-- LEFT:  Devices -->
      <v-col cols="12" md="4">
        <p class="text-subtitle-5 font-weight-bold mb-3">
          Daftar Perangkat
        </p>
        <v-card class="pa-3" color="blue-lighten-4" elevation="1">
          <!-- hanya system master atau admin -->

          <!-- DONT REMOVE COMENTS -->
          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 0">
            <!-- Konten untuk state 0 (device list) -->
            <v-row v-if="(user_role === 'system admin' || user_role === 'system master')"
              class=" d-flex justify-end align-center pa-0" style="max-height: 70px;">
              <v-col cols="auto" class="d-flex align-center ">
                <v-container class="pr-3">
                  <span>Tambah Perangkat</span>
                </v-container>
                <v-btn @click="toogleAddDeviceState" color="primary"
                  class="search-button rounded-circle d-flex justify-center align-center"
                  style="max-height: 50px; width: 50px; min-width: 50px;">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
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
                <!-- <v-select v-model="selectedStatus" :items="[
                  { title: 'Semua', value: '' },
                  { title: 'Aktif', value: 1 },
                  { title: 'Tidak Aktif', value: 0 }
                ]" density="compact" label="Status" variant="outlined"
                  @update:modelValue="(val) => console.log('Selected Status:', val)"></v-select> -->

              </v-col>

              <!-- Pilihan Pengurutan -->
              <v-col cols="6" class="pr-2">
                <v-select v-model="selectedSort" :items="[
                  { title: 'Waktu terakhir', value: 'last_tstamp' },
                  { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                  { title: 'Nama perangkat', value: 'name' }
                ]" density="compact" label="Pengurutan" variant="outlined"></v-select>
                <!-- <v-select v-model="selectedSort" :items="[
                  { title: 'Waktu terakhir', value: 'last_tstamp' },
                  { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                  { title: 'Nama perangkat', value: 'name' }
                ]" density="compact" label="Pengurutan" variant="outlined"
                  @update:modelValue="(val) => console.log('Selected Sort:', val)"></v-select> -->
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

            <v-col class="px-0">
              <!-- Manajemen Perangkat -->
              <!-- Device List Panel -->
              <v-infinite-scroll :key="scrollKeyDevices" id="DevicesBox" ref="DevicesBox" height="550" side="end"
                @load="loadDevices" class="overflow-auto">
                <DeviceList :devices="devices" :currDeviceId="currDeviceId" :currDeviceName="currDeviceName"
                  :totalDevices="totalDevices" @select-device="handleDeviceSelection"
                  @view-device-detail="handleDetailDevice" />
              </v-infinite-scroll>
            </v-col>
          </v-container>

          <!-- DONT REMOVE COMENTS -->
          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 2">
            <!-- Konten untuk state 2 (register device) -->
            <RegisterDevice @toogle-add-device-state="toogleAddDeviceState" @register-device="registerDevice" />
          </v-container>

          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 1">
            <!-- Konten untuk state 1 (detail device) -->
            <DetailDevice @toogle-detail-device-state="toogleDetailDeviceState" @handle-edit-device="handleEditDevice" 
              :curr-device-data="currDeviceData" />
          </v-container>

          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 3">
            <!-- Konten untuk state 2 (detail device) -->
            <EditDevice @toogle-edit-device-state="toogleEditDeviceState" @update-device="updateDevice"
              :curr-device-data="currDeviceData" />
          </v-container>



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
          <div ref="chartContainer" id="chartContainer" style="height: 300px; width: 100%;"></div>

        </v-card>

        <!-- Qunatity value -->


        <br>
        <v-card class="pa-4" color="blue-lighten-4" elevation="1">
          <v-row justify="space-around" class="mt-4">
            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #2196F3; height: 70px; width: 70px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.Energy) }}
                  </p>
                </div>
                <div class="text-caption mt-2">Energy (kWh)</div>
              </div>
            </v-col>

            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #2196F3; height: 70px; width: 70px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.voltage) }}
                  </p>
                </div>
                <div class="text-caption mt-2">voltage (V)</div>
              </div>
            </v-col>

            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #2196F3; height: 70px; width: 70px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.current) }}
                  </p>
                </div>
                <div class="text-caption mt-2">current (A)</div>
              </div>
            </v-col>

            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #2196F3; height: 70px; width: 70px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.Frequency) }}
                  </p>
                </div>
                <div class="text-caption mt-2">Frequency (Hz)</div>
              </div>
            </v-col>

            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #2196F3; height: 70px; width: 70px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.power_factor) }}
                  </p>
                </div>
                <div class="text-caption mt-2">power Factor</div>
              </div>
            </v-col>
          </v-row>


          <div>
            <v-row class="pa-2" justify="end" align="center">
              <span class="mr-4 text-subtitle-1 font-weight-medium">
                Detail Laporan Penggunaan
              </span>

              <v-btn @click="toReportPage" color="primary" class="rounded-circle d-flex justify-center align-center"
                style="max-height: 50px; width: 50px; min-width: 50px;">
                <v-icon>mdi-arrow-right</v-icon>
              </v-btn>
            </v-row>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-card>


  <PopUpInfoBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
    :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
    @close="closePopup" />
</template>

<style scoped>
/* Memastikan list device scrollable */
.overflow-auto {
  overflow-y: auto;
}
</style>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Process } from "@/utils/requestHelper";
import { BASE_API_URL, WS_API_URL } from "@/configs/config";

import { createSocketConnection } from "@/utils/wsHelper";

import CanvasJS from "@canvasjs/charts";
//import CanvasJS, { addTheme } from "@canvasjs/charts";

import DeviceList from "@/components/monitoring/DeviceList.vue";
import RegisterDevice from "@/components/device_management/RegisterDevice.vue";
import DetailDevice from "./device_management/DetailDevice.vue";
import EditDevice from "@/components/device_management/EditDevice.vue";
import PopUpInfoBox from "@/components/parts/PopUpInfoBox.vue";

const popUpProps = ref({
  status: "",
  errorMessage: "",
  errorCode: "",
});

const popupVisible = ref(false);
const closePopup = () => {
  popupVisible.value = false;
};

const isLoading = ref(false);

watch(isLoading, (newValue) => {
  console.log("isLoading changed to:", newValue);
});


//////////////////  //////////////////

const user_role = ref("");

const curr_devicePage_state = ref(0);  // 0 = device_list (default), 1 = detail device, 2 = add device,


function toogleEditDeviceState() {
  console.log("toogleEditDeviceState");
  if (curr_devicePage_state.value === 3) {
    curr_devicePage_state.value = curr_devicePage_state.value = 0;

  } else {
    curr_devicePage_state.value = curr_devicePage_state.value = 3;
  }
}

function toogleDetailDeviceState() {
  console.log("toogleDetail");
  if (curr_devicePage_state.value === 1) {
    curr_devicePage_state.value = curr_devicePage_state.value = 0;

  } else {
    curr_devicePage_state.value = curr_devicePage_state.value = 1;
  }
}


function toogleAddDeviceState() {
  console.log("toogleAddDeviceState curr_devicePage_state:", curr_devicePage_state.value);
  if (curr_devicePage_state.value === 2) {
    curr_devicePage_state.value = curr_devicePage_state.value = 0;

  } else {
    curr_devicePage_state.value = curr_devicePage_state.value = 2;
  }
}























//////////////////  MONITORING VUE COMPONENT //////////////////

// ** Deklarasi Variabel Reaktif **
const currDeviceId = ref(null);
const currDeviceSensorData = ref({});

const dataPoints = ref([]);
const maxDataLength = ref(50);
let chart = null;
let socket = null;



const formatValue = (value) =>
  value === undefined || value === null ? "-" : value.toFixed(2);

const getLocalTimezoneOffset = () => {
  const now = new Date();
  return now.getTimezoneOffset() * 60 * 1000; // Konversi menit ke milidetik
};

function convertTstampToLocal(tstamp) {
  if (!tstamp) return "-";

  // Format ulang agar bisa diparsing oleh Date (tambahkan 'T' di tengah)
  const formattedTstamp = tstamp.replace(" ", "T"); // "2025-03-08 15:51:45" -> "2025-03-08T15:51:45"

  // Konversi ke objek Date (anggap sebagai UTC)
  const utcDate = new Date(formattedTstamp + "Z"); // Tambahkan 'Z' agar dianggap UTC

  // Pastikan timestamp valid
  if (isNaN(utcDate.getTime())) {
    console.warn("❌ Invalid timestamp:", tstamp);
    return "-";
  }

  // Dapatkan offset zona waktu lokal
  const localOffset = getLocalTimezoneOffset();

  // Konversi ke zona waktu lokal
  const localDate = new Date(utcDate.getTime() - localOffset);

  // Format tanggal dan waktu lengkap
  return localDate.toLocaleString("id-ID", {
    hour12: false, // Format 24 jam
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const updateChart = (newData) => {
  console.log("updateChart(), newData:", newData);
  if (!newData.tstamp || newData.power === undefined) {
    console.warn("❌ Data tidak valid untuk chart:", newData);
    return;
  }

  // Konversi tstamp ke waktu lokal
  const localDate = new Date(newData.tstamp.replace(" ", "T") + "Z");
  const localOffset = getLocalTimezoneOffset();
  const localDateWithOffset = new Date(localDate.getTime() - localOffset);

  console.log("Local tstamp:", localDateWithOffset);

  // Buat titik data baru
  const newPoint = { x: localDateWithOffset, y: newData.power };
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
      title: "Waktu (jam:mnt:dtk)",
      valueFormatString: "HH:mm:ss", // Format waktu tanpa milidetik
      labelFormatter: function (e) {
        return e.value.toISOString().slice(11, 19); // Mengambil HH:mm:ss
      },
    },
    axisY: {
      title: "power (W)",
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
      console.warn("❌ WebSocket disconnected.");

      currDeviceId.value = null;
      currDeviceSensorData.value = {}; // Reset data sensor
      dataPoints.value = []; // Kosongkan data chart

      if (chart) {
        console.log("🗑️ Destroying chart...");
        chart.destroy(); // Hapus chart dari DOM
        chart = null;
        document.getElementById("chartContainer").innerHTML = ""; // Bersihkan elemen
      }

      let popUpMessage = "Koneksi dengan perangkat terputus.";
      popUpProps.value = {
        status: "error",
        errorMessage: popUpMessage,
        errorCode: "",
      };
      popupVisible.value = true;

      searchDevices(); // Jalankan ulang pencarian perangkat
    };




    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📡 Data received:", message);
        console.log("📡 Data received current:", message.current);
        console.log("📡 Data received tstamp:", message.tstamp);
        console.log("📡 Data received power:", message.power);

        if (message.device_id === currDeviceId.value) {
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
const currDeviceData = ref({});



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
const isFetchingDeviceData = ref(false);

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


async function handleEditDevice(deviceIdParam) {
  console.log("handleEditDevice - device id: ", deviceIdParam);

  const isSuccess = await getDeviceData(deviceIdParam); // Tunggu hasil sebelum lanjut
  if (!isSuccess) {
    console.error("Failed to get device data");
    return;
  }

  console.log("getDeviceData SUCCESS!!");
  toogleEditDeviceState();
}

async function handleDetailDevice(deviceIdParam) {
  console.log("handleDetailDevice - device id: ", deviceIdParam);

  const isSuccess = await getDeviceData(deviceIdParam); // Tunggu hasil sebelum lanjut
  if (!isSuccess) {
    console.error("Failed to get device data");
    return;
  }

  console.log("getDeviceData SUCCESS!!");
  toogleDetailDeviceState();
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


function searchDevices() {


  resetScrollDevices();
  lastFetchedPageDevices.value = 0;
  devices.value = []; // Reset daftar perangkat sebelum pencarian baru
  getDeviceList(1); // Fetch data dengan parameter baru
}


async function getDeviceList(pageNumber) {
  if (isFetchingDevices.value == true) {
    console.log("Fetching devices already in progress...");
    return;
  }

  isFetchingDevices.value = true;

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
  } finally {

    isFetchingDevices.value = false;
  }
}




async function getDeviceData(deviceIdParam) {

  if (isFetchingDeviceData.value == true) {
    console.log("Fetching device data already in progress...");
    return false;
  }

  console.log("getDeviceData - device id: ", deviceIdParam);

  try {
    const operation = "get_device_data";
    const baseUrl = BASE_API_URL;
    const params = {
      device_id: deviceIdParam,
    };

    console.log("getDeviceData params:", params);
    const response_be = await Process(baseUrl, operation, params);

    if (response_be.status !== "success") {
      console.error("getDeviceData FAILED!!:", response_be.error_message);
      let popUpMessage = "Gagal Mendapatkan Data Perangkat";


      popUpProps.value = {
        status: "error",
        errorMessage: popUpMessage,
        errorCode: response_be.error_code,
      };
      popupVisible.value = true;
      return false;
    }

    const responseBE = response_be.payload;
    if (!responseBE.device_data) {
      console.log("Device data is empty");
      return false;
    }
    console.log("getDeviceData responseBE.device_data: ", responseBE.device_data);

    currDeviceData.value = responseBE.device_data;

    console.log("getDeviceData SUCCESS!!");
    return true;


  } catch (err) {
    console.error("getDeviceData FAILED!!:", response_be.error_message);
    let popUpMessage = "Gagal Mendapatkan Data Perangkat";


    popUpProps.value = {
      status: "error",
      errorMessage: popUpMessage,
      errorCode: response_be.error_code,
    };
    popupVisible.value = true;

  } finally {

    isFetchingDeviceData.value = false;
  }
}


//////

const registerDevice = async (
  deviceNameParam,
  passwordParam,
  deviceImageBase64Param,
  deviceDataParam,
  deviceIntervalReadParam,
) => {
  const baseUrl = BASE_API_URL;
  const operation = "register_device";

  console.log("registerDevice - deviceNameParam:", deviceDataParam);
  console.log("registerDevice - passwordParam:", passwordParam);
  console.log("registerDevice - deviceImageBase64Param:", deviceImageBase64Param);
  console.log("registerDevice - deviceDataParam:", deviceDataParam);
  console.log("registerDevice - deviceIntervalReadParam:", deviceIntervalReadParam);

  isLoading.value = true;

  // Buat parameter request
  const params = {
    name: deviceNameParam,
    password: passwordParam,
    read_interval: deviceIntervalReadParam,
  };

  // Tambahkan attachment jika ada
  if (deviceImageBase64Param) {
    params.attachment = deviceImageBase64Param;
  }

  // Tambahkan data perangkat jika ada
  if (deviceDataParam && Object.keys(deviceDataParam).length > 0) {
    params.data = deviceDataParam;
  }

  console.log("Final params:", params);

  try {
    const response_be = await Process(baseUrl, operation, params);

    if (response_be?.status === "success") {
      popUpProps.value = {
        status: "success",
        errorMessage: "Perangkat berhasil ditambahkan",
        errorCode: "DEVICE_REGISTERED",
      };

      // get new device_id
      const newDeviceId = response_be?.payload?.device_id;
      console.log("New device ID:", newDeviceId);
      // go to detail new device_id

      
      handleEditDevice(newDeviceId);

    } else {
      throw new Error(response_be?.error_message || "Gagal mendaftarkan perangkat");
    }
  } catch (error) {
    console.error("Error registering device:", error);

    // Tampilkan error popup
    popUpProps.value = {
      status: "error",
      errorMessage: error.message || "Terjadi kesalahan saat registrasi perangkat",
      errorCode: error.code || "REGISTER_DEVICE_ERROR",
    };
  } finally {
    popupVisible.value = true; // Popup selalu muncul setelah proses selesai
    isLoading.value = false;
  }

};


const updateDevice = async (
  deviceIdparam,
  deviceChangeFieldsParam,
) => {
  const baseUrl = BASE_API_URL;
  const operation = "update_device_data";
  console.group("-----updateDevice----");

  isLoading.value = true;

  console.log("updatedevice - deviceIdparam:", deviceIdparam);
  console.log("updatedevice - deviceChangeFieldsParam:", deviceChangeFieldsParam);
  // Buat parameter request
  const params = {
    device_id: deviceIdparam,
    change_fields: deviceChangeFieldsParam,
  };
  console.log("Final params:", params);

  try {
    const response_be = await Process(baseUrl, operation, params);

    if (response_be?.status === "success") {
      popUpProps.value = {
        status: "success",
        errorMessage: "Data perangkat berhasil diperbaharui",
        errorCode: "DEVICE UPDATED",
      };

      toogleEditDeviceState();

    } else {
      throw new Error(response_be?.error_message || "Gagal memperbarui data perangkat");
    }
  } catch (error) {
    console.error("Error updating device:", error);

    // Tampilkan error popup
    popUpProps.value = {
      status: "error",
      errorMessage: error.message || "Terjadi kesalahan saat memperbarui data perangkat",
      errorCode: error.code || "UPDATE DEVICE ERROR",
    };
  } finally {
    popupVisible.value = true; // Popup selalu muncul setelah proses selesai
    isLoading.value = false;
  }

  console.groupEnd();

};



/* 

    exp data: {    "device_Id": 1,
    "tstamp": 1739882173782,  // ms
    "voltage": 290.5,
    "current": 2.3,
    "power": 510.15,
    "energy": 1560.75,
    "frequency": 50.1,
    "power_factor": 0.98}



*/


//////////

function toReportPage() {

}


</script>

<style scoped>
/* Styling for the loading spinner */
.loading-spinner {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  /* Pastikan di atas elemen lain */
}


/* Disable interactions when isLoading is true */
.disable-interactions * {
  pointer-events: none;
}


/* Optional: Add an overlay to make it clear that the screen is in loading state */
.disable-interactions {
  position: relative;
}

.disable-interactions::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  /* Semi-transparent overlay */
  z-index: 5;
  /* Ensure it overlays on top of the content */
}
</style>
