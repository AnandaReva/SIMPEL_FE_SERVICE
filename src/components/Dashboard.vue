<!-- DONT REMOVE COMENTS -->


<template>
  <v-container fluid class="pa-2 elevation-2 fill-height fill-width" :class="{ 'disable-interactions': isLoading }">




    <v-progress-circular v-if="isLoading" color="secondary" indeterminate class="loading-spinner"></v-progress-circular>

    <v-row>


      <!-- LEFT:  Devices -->
      <v-col cols="12" md="4">
        <h2 class="text-h5 font-weight-bold mb-3" style="color: var(--v-theme-primary);">
          Daftar Perangkat
        </h2>

        <v-card class="pa-3" color="base" elevation="1" height="75vh">
          <!-- hanya system master atau admin -->

          <!-- DONT REMOVE COMMENTS -->
          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 0">
            <!-- Konten untuk state 0 (device list) -->

            <v-row v-if="user_role === 'system admin' || user_role === 'system master'"
              class="d-flex justify-end align-center pa-0" style="max-height: 70px;">
              <v-col cols="auto" class="d-flex align-center">
                <v-container class="pr-3">
                  <span class="text-body-1 font-weight-medium" style="color: var(--v-theme-primary);">
                    Tambah Perangkat
                  </span>
                </v-container>
                <v-btn @click="toogleAddDeviceState" color="primary"
                  class="rounded-circle d-flex justify-center align-center"
                  style="max-height: 50px; width: 50px; min-width: 50px;">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-col>
            </v-row>


            <v-row v-else class="d-flex justify-end align-center pa-0" style="height: 70px; max-height: 70px;">
            </v-row>




            <!-- filterDeviceList -->


            <v-row class="d-flex justify-center align-center fill-width pa-0" style="max-height: 70px;">
              <v-col cols="5" class="pr-0">
                <v-select v-model="selectedStatusDeviceList" :items="[
                  { title: 'Semua', value: '' },
                  { title: 'Aktif', value: 1 },
                  { title: 'Tidak Aktif', value: 0 }
                ]" density="compact" label="Status" variant="outlined" style="height: 50px;" />
              </v-col>

              <v-col cols="5" class="px-0">
                <v-select v-model="selectedOrderByDeviceList" :items="[
                  { title: 'Waktu terakhir', value: 'last_tstamp' },
                  { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                  { title: 'Nama perangkat', value: 'name' }
                ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />
              </v-col>

              <v-col cols="2" class="pa-1">
                <v-btn type="button" @click="toogleSortType" variant="text"
                  style="border: 1px solid black; max-height: 50px; width: 50px; min-width: 50px;">
                  <template v-if="selectedSortTypeDeviceList === 'ASC'">
                    <v-icon>mdi-arrow-up</v-icon>
                  </template>
                  <template v-else>
                    <v-icon>mdi-arrow-down</v-icon>
                  </template>
                </v-btn>
              </v-col>
            </v-row>



            <!-- Search Device -->
            <v-col class="d-flex justify-center align-center fill-width pa-0" style="max-height: 70px;">
              <v-text-field v-model="filterDeviceList" label="Search" placeholder="Masukkan Nama device" variant="solo"
                clearable class="px-1" style="max-height: 50px;" maxlength="50"
                :rules="[v => v.length <= 30 || 'Maksimal 30 karakter']"
                @input="filterDeviceList = filterDeviceList.slice(0, 30)">
              </v-text-field>

              <v-btn color="primary" @click="searchDevices"
                class="search-button rounded-circle d-flex justify-center align-center"
                style="max-height: 50px; width: 50px; min-width: 50px;">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
            </v-col>

            <v-col class="px-0">
              <v-infinite-scroll :key="scrollKeyDevices" id="DevicesBox" ref="DevicesBox" height="550" side="end"
                @load="loadDevices" class="overflow-auto">
                <DeviceList :devices="devices" :currDeviceId="currDeviceId" :currDeviceName="currDeviceName"
                  :totalDevices="totalDevices" @select-device="handleDeviceSelection"
                  @view-device-detail="handleDetailDevice" />
              </v-infinite-scroll>
            </v-col>
          </v-container>

          <!-- DONT REMOVE COMMENTS -->
          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 2">
            <!-- Konten untuk state 2 (register device) -->
            <AddDevice @toogle-add-device-state="toogleAddDeviceState" @register-device="addDevice" />
          </v-container>

          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 1">
            <!-- Konten untuk state 1 (detail device) -->
            <DetailDevice @toogle-detail-device-state="toogleDetailDeviceState" @handle-edit-device="handleEditDevice"
              :curr-device-data="currDeviceData" />
          </v-container>

          <v-container class="pa-0 ma-0" v-if="curr_devicePage_state == 3">
            <!-- Konten untuk state 3 (edit device) -->
            <EditDevice @toogle-detail-device-state="toogleDetailDeviceState" @update-device="updateDevice"
              :curr-device-data="currDeviceData" />
          </v-container>
        </v-card>
      </v-col>


      <!-- RIGHT SIDE: Live Monitoring -->
      <v-col cols="12" md="8" height="75vh">


        <h2 class="text-h5 font-weight-bold mb-3">Live Monitoring</h2>
        <v-card class="pa-3" color="base" elevation="1" height="50vh">



          <v-container class="ma-0 py-0">

            <!-- Baris tombol di paling atas -->
            <v-row class="d-flex justify-end mb-0">
              <v-col cols="auto">
                <v-btn v-if="currDeviceId" type="button" @click="disconnectDevice" color="error"
                  class="rounded-circle d-flex justify-center align-center"
                  style="max-height: 50px; width: 50px; min-width: 50px;">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Baris perangkat dan zona waktu sejajar -->
            <v-row class="d-flex align-center">
              <v-col cols="6">
                <span class="text-body-1 font-weight-medium" style="color: var(--v-theme-primary);" v-if="currDeviceId">
                  Perangkat saat ini: {{ currDeviceName }}
                </span>
                <span v-else class="text-body-1 font-weight-medium" style="color: var(--v-theme-primary);">
                  Tidak ada perangkat yang dipilih
                </span>
              </v-col>

              <v-col cols="6" class="text-right">
                <strong>
                  <span class="text-body-1 font-weight-light" style="color: var(--v-theme-primary);">
                    Zona Waktu: {{ Intl.DateTimeFormat().resolvedOptions().timeZone }}
                  </span>
                </strong>
              </v-col>
            </v-row>

          </v-container>


          <v-container v-if="currDeviceId" style="height: 400px; overflow-y: auto;">

            <div ref="chartContainer" id="chartContainer" style="height: 300px; width: 100%;"></div>
          </v-container>


        </v-card>

        <!-- Quantity value -->


        <v-container class="pa-0 ma-0" height="1vh"> </v-container>

        <v-card class="pa-3 " color="base" elevation="1" height="24vh" style="overflow-y: auto;">
          <v-row justify="space-around" class="mt-4">
            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #346285; height: 6vh; width: 8vh; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.energy) }}
                  </p>
                </div>
                <div class="text-caption mt-2">Energy (kWh)</div>
              </div>
            </v-col>

            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #346285; height: 6vh; width: 8vh; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
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
                  style="border: 2px solid #346285; height: 6vh; width: 8vh; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
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
                  style="border: 2px solid #346285; height: 6vh; width: 8vh; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.frequency) }}
                  </p>
                </div>
                <div class="text-caption mt-2">Frequency (Hz)</div>
              </div>
            </v-col>

            <v-col cols="auto">
              <div class="text-center">
                <div
                  style="border: 2px solid #346285; height: 6vh; width: 8vh; display: flex; align-items: center; justify-content: center; border-radius: 8px; background-color: white;">
                  <p class="text-caption font-weight-bold">
                    {{ formatValue(currDeviceSensorData.power_factor) }}
                  </p>
                </div>
                <div class="text-caption mt-2">power Factor</div>
              </div>
            </v-col>
          </v-row>

        </v-card>


      </v-col>




    </v-row>
  </v-container>


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
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { Process } from "@/utils/requestHelper";
import { BASE_API_URL, WS_API_URL } from "@/configs/config";

import { CreateSocketConnection } from "@/utils/wsHelper";

import CanvasJS from "@canvasjs/charts";
//import CanvasJS, { addTheme } from "@canvasjs/charts";

import DeviceList from "@/components/monitoring/DeviceListInfiniteScroll.vue";
import AddDevice from "@/components/device_management/AddDevice.vue";
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



const formatValue = (newValue) => {
  return newValue === undefined || newValue === null ? "-" : newValue.toFixed(2);
}


const getLocalTimezoneOffset = () => {
  const now = new Date();
  return now.getTimezoneOffset() * 60 * 1000; // Konversi menit ke milidetik
};

function converttimestampToLocal(timestamp) {
  if (!timestamp) return "-";

  // Format agar bisa diparsing oleh Date (tambahkan 'T' dan 'Z')
  const formattedTimestamp = timestamp.replace(" ", "T") + "Z"; // ex: "2025-04-26T11:32:45Z"
  const utcDate = new Date(formattedTimestamp);

  if (isNaN(utcDate.getTime())) {
    console.warn("❌ Invalid timestamp:", timestamp);
    return "-";
  }

  // Dapatkan offset lokal (negatif untuk waktu di depan UTC, positif untuk belakang UTC)
  const localOffset = getLocalTimezoneOffset(); // dalam milidetik

  // Konversi ke waktu lokal: UTC - (-offset) => UTC + offset
  const localDate = new Date(utcDate.getTime() - localOffset);

  // Format tanggal lokal
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


const updateChart = (newData) => {
  console.log("updateChart(), newData:", newData);
  if (!newData.timestamp || newData.power === undefined) {
    console.warn("❌ Data tidak valid untuk chart:", newData);
    return;
  }

  const formattedTimestamp = newData.timestamp.replace(" ", "T") + "Z";
  const utcDate = new Date(formattedTimestamp);

  if (isNaN(utcDate.getTime())) {
    console.warn("❌ Invalid UTC date in updateChart:", newData.timestamp);
    return;
  }

  // Konversi ke lokal
  const localOffset = getLocalTimezoneOffset();
  const localDateWithOffset = new Date(utcDate.getTime() - localOffset);

  console.log("Local timestamp for chart:", localDateWithOffset);

  const newPoint = { x: localDateWithOffset, y: newData.power };
  dataPoints.value.push(newPoint);

  if (dataPoints.value.length > maxDataLength.value) {
    dataPoints.value.shift();
  }

  console.log("🔍 Before push, dataPoints.length:", dataPoints.value.length);
  console.log("updateChart(), After push: ", [...dataPoints.value]);

  if (chart) {
    console.log("🖌️ Rendering chart...");

    // Clear dulu
    chart.options.data[0].dataPoints.length = 0;

    // Baru assign lagi
    dataPoints.value.forEach(dp => chart.options.data[0].dataPoints.push(dp));

    chart.render();
  }
  else {
    console.log("⚠️ Chart belum ada, menunggu data lebih banyak...");
  }
};



watch(currDeviceId, async (newDeviceId) => {
  console.log(`🔄 Device berubah: ${newDeviceId}, reinit chart!`);
  //disconnectDevice(); // Putuskan koneksi WebSocket sebelumnya
  dataPoints.value = []; // Reset data saat ganti device

  await nextTick(); // ⏳ Tunggu sampai DOM update
  initChart();
});


const initChart = () => {
  console.log("initChart(), dataPoints.value:  ", dataPoints.value);

  const container = document.getElementById("chartContainer");
  if (!container) {
    console.warn("⚠️ chartContainer tidak ditemukan!");
    return;
  }

  // Bersihkan elemen chart sebelumnya (jika ada)
  container.innerHTML = "";

  chart = new CanvasJS.Chart(container, {
    theme: "light2",
    title: {
      text: "Grafik Daya Perangkat",
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

  console.log("CreateSocketConnection params:", params);

  try {
    const result = await CreateSocketConnection(baseUrl, operation, params);

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
        chart?.destroy(); // Hapus chart dari DOM
        chart = null;
        document.getElementById("chartContainer").innerHTML = ""; // Bersihkan elemen
      }

      let popUpMessage = "Koneksi dengan perangkat terputus.";
      currDeviceId.value = null;

      popUpProps.value = {
        status: "error",
        errorMessage: popUpMessage,
        errorCode: "",
      };
      popupVisible.value = true;

    //  searchDevices(); // Jalankan ulang pencarian perangkat
    };




    socket.onmessage = (event) => {
      try {
        let message = JSON.parse(event.data);
        console.groupCollapsed("📡 Data received:", message);
        console.log("📡 Data received unit_id:", message.unit_id);
        console.log("📡 Data received current:", message.current);
        console.log("📡 Data received power:", message.power);
        console.log("📡 Data received power:", message.energy);
        console.log("📡 Data received timestamp:", message.timestamp);

        console.groupEnd();


        console.log("currDeviceId.value: ", currDeviceId.value);
        console.log("message.unit_id: ", message.unit_id);


        if (message.unit_id === currDeviceId.value) {
          currDeviceSensorData.value = message;

          console.log("currDeviceSensorData.value: ", currDeviceSensorData.value);
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

const disconnectDevice = () => {
  console.log("🚪 Disconnecting device...");

  if (socket) {
    socket.close(); // Ini akan otomatis trigger `socket.onclose`
    socket = null;
  }

  // Reset semua variabel terkait device
  currDeviceId.value = null;
  currDeviceSensorData.value = {};
  dataPoints.value = [];

  // Hancurkan chart kalau ada
  if (chart) {
    chart.destroy();
    chart = null;
  }

  // Bersihkan container chart
  const container = document.getElementById("chartContainer");
  if (container) {
    container.innerHTML = "";
  }

  // Opsional: munculkan notifikasi popup (kalau kamu mau)
  popUpProps.value = {
    status: "success",
    errorMessage: "Berhasil memutus koneksi perangkat.",
    errorCode: "",
  };
  popupVisible.value = true;

  console.log("✅ Device disconnected successfully.");
};


onMounted(() => {
  // get user role
  const user_data = JSON.parse(localStorage.getItem('user_data'));
  user_role.value = user_data?.role;
  //console.log('user_role', user_role.value);

  searchDevices();
});

onUnmounted(() => {
  socket?.close();
});




//////////////////// DEVICES////////////////////

const selectedOrderByDeviceList = ref("last_tstamp"); // Default: Waktu terakhir
const selectedStatusDeviceList = ref(1); // Default: Semua perangkat aktif
const selectedSortTypeDeviceList = ref("DESC") // Default: ASC
const filterDeviceList = ref('');


const devices = ref([]);
const page_size = ref(10);
const totalPagesDevices = ref(0);
const totalDevices = ref();
const currDeviceName = ref('')
const currDeviceData = ref({});


const toogleSortType = () => {
  selectedSortTypeDeviceList.value = selectedSortTypeDeviceList.value === "ASC" ? "DESC" : "ASC";
}
watch(selectedSortTypeDeviceList, (newSortType) => {
  //console.log(`��� Sorting berubah: ${newSortType}`);
  searchDevices();
});


watch(selectedOrderByDeviceList, (newOrderBy) => {
  // console.log(`��� Order By berubah: ${newOrderBy}`);
  searchDevices();
});

watch(selectedStatusDeviceList, (newStatus) => {
  //console.log(`��� Status perangkat berubah: ${newStatus}`);
  searchDevices();
});



const lastFetchedPageDevices = ref(0);
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
  console.group("---handleDetailDevice----")
  console.log("handleDetailDevice - device id: ", deviceIdParam);
  const isSuccessGetDevice = await getDeviceData(deviceIdParam); // Tunggu hasil sebelum lanjut

  if (!isSuccessGetDevice) {
    console.error("Failed to get device data");
    return;
  }

  console.log("getDeviceData SUCCESS!!");
  toogleDetailDeviceState();
  console.groupEnd();
}


///////// INFINITE SCROLL DEVICES //////////
function loadDevices({ done }) {
  console.group("--- loadDevices() ---")
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
  console.groupEnd();
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
  totalDevices.value = 0;
  resetScrollDevices();
  lastFetchedPageDevices.value = 0;
  devices.value = []; // Reset daftar perangkat sebelum pencarian baru
  getDeviceList(1); // Fetch data dengan parameter baru
}


async function getDeviceList(pageNumberParam) {
  console.log("----getDeviceList----")
  if (isFetchingDevices.value == true) {
    console.log("Fetching devices already in progress...");
    return;
  }

  isFetchingDevices.value = true;

  try {
    const operation = "get_device_list";
    const baseUrl = BASE_API_URL;
    const params = {
      filterDeviceList: filterDeviceList.value,
      order_by: selectedOrderByDeviceList.value,
      sort_type: selectedSortTypeDeviceList.value,
      page_number: pageNumberParam,
      page_size: page_size.value,
      st: selectedStatusDeviceList.value,
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
    lastFetchedPageDevices.value = pageNumberParam;

    console.log("totalPagesDevices: ", totalPagesDevices.value);
    console.log("totalDevices: ", totalDevices.value);
  } catch (err) {
    console.error("ERROR WHILE GETTING DEVICES:", err);
  } finally {

    isFetchingDevices.value = false;
  }
}


async function getDeviceData(deviceIdParam) {
  console.group("---getDeviceData----")

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

  console.groupEnd();
}


////////// ADD DEVICE ////////

const addDevice = async (
  deviceNameParam,
  passwordParam,
  deviceImageBase64Param,
  deviceDataParam,
  deviceIntervalReadParam,
) => {
  const baseUrl = BASE_API_URL;
  const operation = "add_device_data";

  console.group("---addDevice---")

  console.log("addDevice - deviceNameParam:", deviceDataParam);
  console.log("addDevice - passwordParam:", passwordParam);
  console.log("addDevice - deviceImageBase64Param:", deviceImageBase64Param);
  console.log("addDevice - deviceDataParam:", deviceDataParam);
  console.log("addDevice - deviceIntervalReadParam:", deviceIntervalReadParam);

  isLoading.value = true;

  // Buat parameter request
  const params = {
    name: deviceNameParam,
    password: passwordParam,
    read_interval: deviceIntervalReadParam,
  };

  // Tambahkan attachment jika ada
  if (deviceImageBase64Param) {
    params.image = deviceImageBase64Param;
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
        errorCode: "NEW DEVICE ADDED",
      };

      // get new device_id
      const newDeviceId = response_be?.payload?.device_id;
      console.log("New device ID:", newDeviceId);
      // go to detail new device_id


      handleDetailDevice(newDeviceId);

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

  console.groupEnd();

};

//////// UPDATE DEVICE /////////

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

      // get new device_id
      const newDeviceId = response_be?.payload?.device_id;
      console.log("New device ID:", newDeviceId);
      // go to detail new device_id


      handleDetailDevice(deviceIdparam);

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



</script>
