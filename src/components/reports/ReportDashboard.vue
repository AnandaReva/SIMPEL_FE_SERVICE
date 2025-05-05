<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">


        <v-dialog v-model="isShowDeviceList" max-width="500">
            <template #default>
                <v-card color="base">
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span class="text-h6">Select Device</span>
                        <v-btn icon @click="isShowDeviceList = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>

                    <v-card-text>
                        <!-- Filter controls -->
                        <div class="d-flex flex-wrap mb-0 ">

                            <v-select v-model="selectedStatusDeviceList" :items="[
                                { title: 'Semua', value: '' },
                                { title: 'Aktif', value: 1 },
                                { title: 'Tidak Aktif', value: 0 }
                            ]" density="compact" label="Status" variant="outlined" style="height: 50px;" />

                            <v-select v-model="selectedOrderByDeviceList" :items="[
                                { title: 'Waktu terakhir', value: 'last_tstamp' },
                                { title: 'Waktu perangkat didaftarkan', value: 'create_tstamp' },
                                { title: 'Nama perangkat', value: 'name' }
                            ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />
                            <v-btn @click="toogleSortType" icon>
                                <v-icon>{{ selectedSortTypeDeviceList === 'ASC' ? 'mdi-arrow-up' :
                                    'mdi-arrow-down' }}</v-icon>
                            </v-btn>
                        </div>

                        <!-- Search box -->
                        <div class="d-flex align-center mb-4">
                            <v-text-field v-model="filterDeviceList" label="Search" placeholder="Masukkan Nama device"
                                variant="solo" clearable class="px-1" style="max-height: 50px;" maxlength="50"
                                :rules="[v => v.length <= 30 || 'Maksimal 30 karakter']"
                                @input="filterDeviceList = filterDeviceList.slice(0, 30)">
                            </v-text-field>
                            <v-btn icon color="primary" class="ml-2" @click="searchDevices">
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>
                        </div>


                        <div>device_5


                            <v-infinite-scroll :key="scrollKeyDevices" id="DeviceListBox" ref="DeviceListBox"
                                height="550" side="end" @load="loadDevices" class="overflow-auto">
                                <DeviceListReport :devices="devices" :total_devices="totalDevices"
                                    @select-device="handleSelectDevice" />


                                <!-- @select-device-ini="handleSelectDevice" -->

                            </v-infinite-scroll>


                        </div>


                    </v-card-text>
                </v-card>
            </template>
        </v-dialog>




        <v-card v-if="curr_device.id" color="base" class="pa-4 ma-2 w-100" style="border-radius: 20px; height: 90%;">

            <v-data-table-server v-model:items-per-page="year_list_pageSize" :headers="headers" :items="year_list"
                :items-length="year_list_totalData" :loading="isLoading" item-value="name"
                @update:options="loadYearList" />


            <v-card-text>

            </v-card-text>


        </v-card>

        <v-container v-if="!curr_device.id" class="d-flex align-center justify-center">
            <v-card class="text-center pa-6 rounded-xl elevation-3" color="base" style="width: 100%; max-width: 500px;">
                <div>
                    <v-icon size="72" color="grey darken-1" class="mb-4">mdi-chart-box-outline</v-icon>
                    <p class="text-h6 font-weight-medium mb-2">Tidak ada perangkat yang dipilih</p>
                    <p class="text-subtitle-2 text-grey">Pilih perangkat terlebih dahulu untuk melihat laporan
                        penggunaan</p>

                    <v-btn class="mt-6" color="primary" variant="elevated" @click="handleShowDeviceList">
                        <v-icon start>mdi-database-search</v-icon>
                        Pilih Perangkat
                    </v-btn>
                </div>
            </v-card>
        </v-container>











        <!-- Loading Overlay -->
        <v-overlay :model-value="isLoading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <!-- Pop-up for Error Handling -->
        <PopUpInfoBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
            :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
            @close="closePopup" />
    </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'

//import DeviceListReport from './DeviceListReport.vue'

import DeviceListInfiniteScroll from '../monitoring/DeviceListInfiniteScroll.vue'

// State
const popUpProps = ref({ status: "", errorMessage: "", errorCode: "" })
const popupVisible = ref(false)
const closePopup = () => { popupVisible.value = false }

// Loading
const isLoading = ref(false)

const isShowDeviceList = ref(false)


const isFetchingYears = ref(false)




const isFetchingDevices = ref(false);


const handleSelectDevice = async ({ deviceId, deviceName }) => {
    console.log("[PARENT] handleSelectDevice triggered: ", deviceId, deviceName);
}





// Handle showing device list modal
const handleShowDeviceList = () => {

    isShowDeviceList.value = true

    searchDevices();
}


const curr_device = ref({
    id: null,
    name: null
});

// const handleSelectDevice = async ({ deviceId, deviceName }) => {
//     console.log(`---handleSelectDevice DISINI---`);
//     console.log("handleSelectDevice - device id: ", deviceId);

//     isLoading.value = true;
//     isShowDeviceList.value = false;

//     if (deviceId === curr_device.value.dev) {
//         console.log(`Device id: ${deviceId} already selected`);
//         isLoading.value = false;
//         return;
//     }

//     curr_device.value.id = deviceId;
//     curr_device.value.name = deviceName;

//     try {
//         // Add any additional logic here if needed
//         console.log(`Successfully selected device ${deviceId}: ${deviceName}`);
//     } catch (error) {
//         console.error("Error selecting device:", error);
//         popUpProps.value = {
//             status: "error",
//             errorMessage: "Gagal memilih perangkat",
//             errorCode: "DEVICE_SELECT_ERROR",
//         };
//         popupVisible.value = true;
//     } finally {
//         isLoading.value = false;
//     }
// };



//////////////////// DEVICES ////////////////////





const selectedOrderByDeviceList = ref("last_tstamp"); // Default: Waktu terakhir
const selectedStatusDeviceList = ref(); // Default: Semua perangkat aktif
const selectedSortTypeDeviceList = ref("desc") // Default: ASC
const filterDeviceList = ref('');


const devices = ref([]);
const page_size = ref(10);
const totalPagesDevices = ref(0);

const totalDevices = ref();



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









////////////////////// REPORT //////////////////////

const year_list = ref([])
const curr_year = ref(null)

//pagination
const year_list_pageNumber = ref(1)
const year_list_pageSize = ref(10) // default
const year_sortType = ref("desc") // deafult [asc, desc]
const year_orderBy = ref("year") // default  [year , record_count]
const year_totalPage = ref(0)
const year_list_totalData = ref(0)

const headers = [
    { title: 'No', key: 'no' },
    { title: 'Tahun', key: 'year' },
    { title: 'Timestamp Pertama', key: 'first_record_timestamp' },
    { title: 'Timestamp Terakhir', key: 'last_record_timestamp' },
    { title: 'Jumlah Data', key: 'record_count' },
]


const loadYearList = ({ page, itemsPerPage, sortBy }) => {
    // Update pagination values
    year_list_pageNumber.value = page || 1
    year_list_pageSize.value = itemsPerPage || 10

    // Update sorting values
    if (sortBy && sortBy.length > 0) {
        const sort = sortBy[0]
        year_orderBy.value = sort.key
        year_sortType.value = sort.order === 'desc' ? 'desc' : 'asc'
    } else {
        year_orderBy.value = 'year'
        year_sortType.value = 'desc'
    }

    // Load data
    getReportYearList()
}


const getReportYearList = async () => {
    console.log("---getReportYearList---")
    if (isFetchingYears.value) return

    isFetchingYears.value = true
    isLoading.value = true

    try {
        const operation = 'get_year_list'
        const params = {
            device_id: curr_device.value.id,
            page_number: year_list_pageNumber.value,
            page_size: year_list_pageSize.value,
            sort_type: year_sortType.value,
            order_by: year_orderBy.value,
        }

        console.log("getReportYearList - params:", params)

        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.status !== "success") {
            console.error("getReportYearList FAILED!!:", response_be.error_message)

            popUpProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Tahun Tersedia",
                errorCode: response_be.error_code,
            }
            popupVisible.value = true
            return
        }

        const payload = response_be.payload

        year_list.value = payload.year_list || []
        year_totalPage.value = Math.ceil(payload.total_data / year_list_pageSize.value)
        year_list_totalData.value = payload.total_data || 0

    } catch (error) {
        console.error('Error fetching years:', error)
    } finally {
        isFetchingYears.value = false
        isLoading.value = false
    }
}


</script>

<style scoped>
.disable-interactions {
    pointer-events: none;
    opacity: 0.7;
}

.cursor-pointer {
    cursor: pointer;
}

.popup-container {
    z-index: 1000;
}
</style>