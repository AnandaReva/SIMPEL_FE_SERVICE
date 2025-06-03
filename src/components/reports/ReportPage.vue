<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay Loading -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
        <!-- Laporan Bulanan -->
        <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">
            <!-- Header & Kembali -->
            <v-container height="100%">

                <v-dialog v-model="isShowDeviceList" max-width="500">
                    <template #default>
                        <v-card color="base">
                            <v-card-title class="d-flex justify-space-between align-center">
                                <span class="text-h6">Pilih Perangkat</span>
                                <v-btn icon @click="isShowDeviceList = false">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text>
                                <!-- Konten daftar perangkat -->
                                <div class="d-flex flex-wrap mb-0 ">
                                    <v-col v-if="user_role == 'system master' || user_role == 'system admin'" cols="12"
                                        class="d-flex justify-end align-center px-0">
                                        <span class="mr-3 text-subtitle-1 font-weight-medium" style="color: #555;">
                                            Tambah Perangkat
                                        </span>

                                        <v-btn @click="toAddPage()" color="primary" icon rounded="circle" elevation="2"
                                            class="ma-0" style="width: 48px; height: 48px;">
                                            <v-icon size="24">mdi-plus</v-icon>
                                        </v-btn>
                                    </v-col>

                                    <v-select v-model="selectedOrderByDeviceList" :items="[
                                        { title: 'Waktu terakhir', value: 'last_tstamp' },
                                        { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                                        { title: 'Nama perangkat', value: 'name' }
                                    ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />

                                    <v-select v-model="selectedStatusDeviceList" :items="[
                                        { title: 'Semua', value: null },
                                        { title: 'Aktif', value: 1 },
                                        { title: 'Tidak Aktif', value: 0 }
                                    ]" density="compact" label="Status" variant="outlined" style="height: 50px;" />

                                    <v-btn @click="toogleSortType" icon>
                                        <v-icon>
                                            {{ selectedSortTypeDeviceList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down'
                                            }}
                                        </v-icon>
                                    </v-btn>
                                </div>

                                <div class="d-flex align-center mb-4">
                                    <v-text-field v-model="filterDeviceList" label="Search"
                                        placeholder="Masukkan Nama device" variant="solo" clearable class="px-1"
                                        style="max-height: 50px;" maxlength="50"
                                        :rules="[v => !v || v.length <= 30 || 'Maksimal 30 karakter']"
                                        @input="filterDeviceList = filterDeviceList.slice(0, 30)" />
                                    <v-btn icon color="primary" class="ml-2" @click="searchDevices">
                                        <v-icon>mdi-magnify</v-icon>
                                    </v-btn>
                                </div>

                                <div>
                                    <v-infinite-scroll :key="scrollKeyDevices" id="DeviceListBox" ref="DeviceListBox"
                                        height="550" side="end" @load="loadDevices" class="overflow-auto">
                                        <DeviceListInfiniteScroll :devices="devices" :total_devices="total_devices"
                                            :curr_device="curr_device" @select-device="selectDevice" />
                                    </v-infinite-scroll>
                                </div>
                            </v-card-text>
                        </v-card>
                    </template>
                </v-dialog>


                <!-- Dialog: Pilih Tahun -->
                <v-dialog v-model="isShowYearSelector" max-width="500">
                    <template #default>
                        <v-card color="base">
                            <v-card-title class="d-flex justify-space-between align-center">
                                <span class="text-h6">Pilih Tahun</span>
                                <v-btn icon @click="isShowYearSelector = false">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-card-title>
                            <v-card-text>
                                <ReportAvailableYearTable :curr_device="curr_device" @select-year="handleSelectYear" />
                            </v-card-text>
                        </v-card>
                    </template>
                </v-dialog>


                <v-row justify="center" class="pa-4">
                    <!-- Pilih / Ganti Perangkat -->
                    <v-col cols="3">
                        <v-btn block color="primary" @click="handleShowDeviceList">
                            {{ curr_device?.id ? 'Ganti Perangkat' : 'Pilih Perangkat' }}
                        </v-btn>
                    </v-col>

                    <!-- Pilih / Ganti Tahun -->
                    <v-col cols="3">
                        <v-btn block :disabled="!curr_device?.id" color="primary" @click="handleShowYearSelector">
                            {{ year_selected ? 'Ganti Tahun' : 'Pilih Tahun' }}
                        </v-btn>
                    </v-col>

                    <!-- Pilih / Ganti Bulan -->
                    <v-col cols="3">
                        <v-btn block :disabled="!curr_device?.id || !year_selected" color="primary"
                            @click="handleShowMonthSelector">
                            {{ month_selected ? 'Ganti Bulan' : 'Pilih Bulan' }}
                        </v-btn>
                    </v-col>
                </v-row>



                <v-row v-if="curr_device && curr_device.id" align="center" justify="center">

                    <v-card-title class="text-h5 font-weight-medium text-black">
                        Perangkat: {{ curr_device.name }}
                    </v-card-title>

                </v-row>




                <v-row class="fill-height" align="center" justify="center">
                    <v-col cols="12" sm="8" md="6">
                        <div v-if="curr_device && curr_device.id">
                            <div style="overflow-x: auto; width: 100%;">
                                <v-card elevation="2" class="mb-6 mx-auto" style="min-width: 500px; width: 100%;">
                                    <v-col class="d-flex align-center justify-center">
                                        <ReportYearlyChart :curr_device="curr_device" />
                                    </v-col>
                                </v-card>
                            </div>
                        </div>


                        <div v-else>
                            <v-card elevation="2" class="mb-6 mx-auto" max-width="400">
                                <v-col class="d-flex align-center justify-center">
                                    <v-icon size="64" color="grey">mdi-monitor-off</v-icon>
                                </v-col>
                                <v-col class="d-flex align-center justify-center">
                                    <p class="text-h6 mt-4 mb-6">Tidak ada perangkat yang dipilih</p>
                                </v-col>
                            </v-card>
                        </div>
                    </v-col>
                </v-row>





            </v-container>



        </v-card>

        <!-- Pop-up Error -->
        <PopUpInfoBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
            :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />
    </v-container>
</template>


<script setup>
import ReportAvailableYearTable from './year/ReportAvailableYearTable.vue'
import ReportYearlyChart from './year/ReportYearlyChart.vue'

import { onMounted, ref, watch, nextTick } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import { } from '@/utils/utils'
import { useRoute, useRouter } from 'vue-router'


const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const popUpProps = ref({ status: '', errorMessage: '', errorCode: '' })
const popupVisible = ref(false)
const closePopup = () => (popupVisible.value = false)

//////
const isShowDeviceList = ref(false)





// Handle showing device list modal
const handleShowDeviceList = () => {


    searchDevices();

    isShowDeviceList.value = true
}
const curr_device = ref({ id: null, name: null })

const selectDevice = async (deviceFromEmit) => {
    console.log(`---selectDevice---`);
    isLoading.value = true;

    console.log(`selectDevice - deviceFromEmit: `, deviceFromEmit);
    const deviceId = deviceFromEmit.id;
    const deviceName = deviceFromEmit.name;


    if (!deviceId || !deviceName) {
        console.error("Invalid device data received from DeviceListInfiniteScroll");
        isLoading.value = false;
        return;
    }

    // ✅ Ganti seluruh objek agar reaktif
    curr_device.value = {
        id: deviceId,
        name: deviceName,
    }
    console.log(`selectDevice - deviceId: ${curr_device.value.id}, deviceName: ${curr_device.value.name}`);

    isLoading.value = false;
    isShowDeviceList.value = false;
}


watch(curr_device, (newVal) => {
    console.log('curr_device changed:', newVal);
})


//////////////// DEVICES //////////////////////


const isFetchingDevices = ref(false)


const selectedOrderByDeviceList = ref("last_tstamp"); // Default: Waktu terakhir
const selectedStatusDeviceList = ref(null); // Default: Semua perangkat aktif
const selectedSortTypeDeviceList = ref("desc") // Default: ASC
const filterDeviceList = ref('');



const devices = ref([]);
const page_size = ref(10);
const total_pages_device_list = ref(0);

const total_devices = ref();





const toogleSortType = () => {
    selectedSortTypeDeviceList.value = selectedSortTypeDeviceList.value === "asc" ? "desc" : "asc";
}


watch(
    [() => selectedSortTypeDeviceList.value, () => selectedOrderByDeviceList.value, () => selectedStatusDeviceList.value],
    ([newSortType, newOrderBy, newStatus]) => {
        /*  console.log(`Changes detected:
       Sort Type: ${newSortType}
       Order By: ${newOrderBy}
       Status: ${newStatus}`); */
        searchDevices();
    }, { deep: true }
);


const lastFetchedPageDevices = ref(0);
const scrollKeyDevices = ref(0);

function resetScrollDevices() {
    scrollKeyDevices.value += 1;
}

///////// INFINITE SCROLL DEVICES //////////
async function loadDevices({ done }) {
    console.group("--- loadDevices() ---")
    if (total_pages_device_list.value === 0) {
        done("empty");
        return;
    }

    const fetchedPageNumber = lastFetchedPageDevices.value + 1;
    console.log("last page:", lastFetchedPageDevices.value);
    console.log("Fetched page number:", fetchedPageNumber);

    setTimeout(async () => {
        const success = await getDeviceList(fetchedPageNumber);

        if (!success || fetchedPageNumber >= total_pages_device_list.value) {
            done("empty");
        } else {
            done("done");
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
    total_devices.value = 0;
    resetScrollDevices();
    lastFetchedPageDevices.value = 0;
    devices.value = []; // Reset daftar perangkat sebelum pencarian baru
    getDeviceList(1); // Fetch data dengan parameter baru
}


async function getDeviceList(pageNumberParam) {
    console.log("----getDeviceList----")
    if (isFetchingDevices.value == true) {
        console.log("Fetching devices already in progress...");
        return false;
    }

    isFetchingDevices.value = true;

    try {
        const operation = "get_device_list";
        const baseUrl = BASE_API_URL;

        const params = {
            filter: filterDeviceList.value,
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
            popUpInfoProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Perangkat Aktif",
                errorCode: response_be.error_code,
            };
            popUpInfoVisible.value = true;
            return false;
        }

        const responseBE = response_be.payload;
        if (!responseBE.devices || responseBE.devices.length === 0) {
            console.log("Device list is empty");
            return false;
        }

        console.log("getDeviceList SUCCESS!!");
        devices.value = appendDevices(devices.value, responseBE.devices);
        total_devices.value = responseBE.total_data;
        total_pages_device_list.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        lastFetchedPageDevices.value = pageNumberParam;

        console.log("total_pages_device_list: ", total_pages_device_list.value);
        console.log("total_devices: ", total_devices.value);
        return true;
    } catch (err) {
        console.error("ERROR WHILE GETTING DEVICES:", err);
        return false;
    } finally {
        isFetchingDevices.value = false;
    }
}




///////////// YEAR ///////////

// Dialog control
const isShowYearSelector = ref(false)

// Function untuk membuka dialog
const handleShowYearSelector = () => {
    isShowYearSelector.value = true
}

// Ketika tahun dipilih
const year_selected = ref(null)

const handleSelectYear = (year) => {
    year_selected.value = year
    isShowYearSelector.value = false
}








//////////// MONTH ///////////
const month_selected = ref(null);
const handleShowMonthSelector = () => {

}






/////////////////////////////

const user_role = ref('user_guest')

onMounted(() => {
    // get user role

    const user_data = JSON.parse(localStorage.getItem('user_data'));
    user_role.value = user_data?.role;
    //console.log('user_role', user_role.value);
});




</script>
