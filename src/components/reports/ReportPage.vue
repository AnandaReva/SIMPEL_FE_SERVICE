<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay loading -->
        <div v-if="isLoading" class="loading-overlay">
            <v-progress-circular color="secondary" indeterminate size="64"></v-progress-circular>
        </div>


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
                                <v-icon>{{ selectedSortTypeDeviceList === 'ASC' ? 'mdi-arrow-up' :
                                    'mdi-arrow-down' }}</v-icon>
                            </v-btn>
                        </div>




                        <!-- Search box -->
                        <div class="d-flex align-center mb-4">
                            <v-text-field v-model="filterDeviceList" label="Search" placeholder="Masukkan Nama device"
                                variant="solo" clearable class="px-1" style="max-height: 50px;" maxlength="50"
                                :rules="[v => !v || v.length <= 30 || 'Maksimal 30 karakter']"
                                @input="filterDeviceList = filterDeviceList.slice(0, 30)">
                            </v-text-field>
                            <v-btn icon color="primary" class="ml-2" @click="searchDevices">
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>
                        </div>


                        <div>

                            <v-infinite-scroll :key="scrollKeyDevices" id="DeviceListBox" ref="DeviceListBox"
                                height="550" side="end" @load="loadDevices" class="overflow-auto">
                                <DeviceListInfiniteScroll :devices="devices" :total_devices="total_devices"
                                    @select-device="selectDevice" />

                            </v-infinite-scroll>


                        </div>


                    </v-card-text>
                </v-card>
            </template>
        </v-dialog>





        <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">

            <v-row align="center" justify="space-between" class="mb-4 mx-0">
                <v-btn @click="handleShowDeviceList" color="primary" class="d-flex align-center"
                    style="max-height: 50px">
                    Ganti Perangkat
                </v-btn>

                <v-card-title class="text-h4 font-weight-bold text-black mb-0 px-0"> {{ curr_device.name
                }}</v-card-title>
                <v-card-title class="text-h5 font-weight-bold text-primary mb-0 px-0">📊 LAPORAN
                    PERANGKAT</v-card-title>
            </v-row>


            <v-col v-if="curr_device.id" class="fill-height d-flex flex-column">



                <!-- Bagian atas: Tabel data -->
                <!--    {{ year_list }} -->

                <!--    {{ year_list }}
                {{ year_list.length }} -->
                <v-container class="flex-grow-1 pa-0" style="overflow-y: auto;">
                    <v-data-table-server v-model:items-per-page="year_list_pageSize" :headers="headers"
                        :items="year_list" :items-length="year_list_totalData" :loading="isLoading" item-value="name"
                        @update:options="loadYearList" class="flex-grow-1" :items-per-page-options="[10, 25, 50]">
                        <template #item="{ item, index }">
                            <tr class="hoverable-row" style="cursor: pointer;">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.year }}</td>
                                <td>{{ FormatToLocal(item.first_record_timestamp) }}</td>
                                <td>{{ FormatToLocal(item.last_record_timestamp) }}</td>
                                <td>{{ item.energy_consumed_count }} kWh</td>
                                <td>{{ item.total_data }}</td>
                                <td>{{ FormatSize(item.total_size_bytes) }}</td>
                                <td>
                                    <v-btn size="small" color="primary" variant="text" class="me-2"
                                        @click.stop="selectYear(item.year)">
                                        <v-icon start>mdi-eye</v-icon>
                                        Detail
                                    </v-btn>


                                </td>
                                <td>
                                    <v-btn size="small" color="success" variant="text" class="me-2"
                                        @click.stop="downloadData('csv', item.year)">
                                        <v-icon start>mdi-file-delimited</v-icon>
                                        CSV
                                    </v-btn>
                                </td>
                                <td>
                                    <v-btn size="small" color="success" variant="text"
                                        @click.stop="downloadData('excel', item.year)">
                                        <v-icon start>mdi-file-excel</v-icon>
                                        Excel
                                    </v-btn>

                                </td>

                            </tr>
                        </template>

                    </v-data-table-server>

                    <v-col v-if="year_list.length <= 0" class="fill-height d-flex align-center justify-center">
                        <div class="text-center">
                            Tidak ada Data
                        </div>
                    </v-col>
                </v-container>



            </v-col>



            <v-col v-else class="fill-height d-flex align-center justify-center">
                <div class="text-center">
                    <v-icon size="64" color="grey">mdi-chart-box-multiple-outline</v-icon>
                    <p class="text-h6 mt-4 mb-6">Pilih Perangkat untuk Melihat Laporan</p>
                    <v-btn color="primary" @click="handleShowDeviceList">
                        Pilih Perangkat
                    </v-btn>
                </div>
            </v-col>
        </v-card>



    </v-container>

    <PopUpInfoBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
        :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
        @close="closePopup" />
</template>``


<script setup>

import DeviceListInfiniteScroll from '@/components/parts/DeviceListInfiniteScroll.vue';
import { ref, watch, onMounted } from 'vue'

import { Process } from "@/utils/requestHelper";
import { BASE_API_URL } from "@/configs/config";
import { FormatToLocal, FormatSize } from '@/utils/utils';

import { useRouter, useRoute } from 'vue-router';



const router = useRouter();



import CanvasJS from "@canvasjs/charts";





// State management
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
const isFetchingYears = ref(false)
const isFetchingDevices = ref(false);


watch(isLoading, (newValue) => {
    console.log("isLoading changed to:", newValue);
});

const isShowDeviceList = ref(false)





// Handle showing device list modal
const handleShowDeviceList = () => {

    isShowDeviceList.value = true

    searchDevices();
}




const curr_device = ref({
    id: null,
    name: null
})




//////////////////// DEVICES ////////////////////


watch(() => curr_device.value.id, (newId) => {
    if (newId) {
        loadYearList({
            page: year_list_pageNumber.value,
            itemsPerPage: year_list_pageSize.value,
            sortBy: [{
                key: year_orderBy.value,
                order: year_sortType.value,
            }]
        });
    }
});


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
            popUpProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Perangkat Aktif",
                errorCode: response_be.error_code,
            };
            popupVisible.value = true;
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
    { title: 'Waktu Data Pertama', key: 'first_record_timestamp', sortable: false },
    { title: 'Waktu Data Terakhir', key: 'last_record_timestamp', sortable: false },
    { title: 'Total Penggunaan Listrik', key: 'energy_consumed_count' },
    { title: 'Jumlah Data', key: 'total_data' },
    { title: 'Besar Data', key: 'total_size_bytes' },
    { title: 'Aksi', key: 'actions', sortable: false },

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

    // Update query parameters for sorting and pagination
    getReportYearList()
}


const getReportYearList = async () => {
    console.log("---getReportYearList---")
    if (isFetchingYears.value) return

    isFetchingYears.value = true
    isLoading.value = true

    try {
        const operation = 'get_report_year_list'
        const params = {
            device_id: curr_device.value.id,
            page_number: year_list_pageNumber.value,
            page_size: year_list_pageSize.value,
            order_by: year_orderBy.value,
            sort_type: year_sortType.value
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



        const responseBE = response_be.payload
        console.log("getReportYearList - responseBE: ", responseBE)

        year_list.value = responseBE.year_list || []
        year_totalPage.value = Math.ceil(responseBE.total_data / year_list_pageSize.value)
        year_list_totalData.value = responseBE.total_data || 0

    } catch (error) {
        console.error('Error fetching years:', error)
    } finally {
        isFetchingYears.value = false
        isLoading.value = false
    }
}



function selectYear(yearSelected) {
    console.log("---selectYear---")
    console.log("selectYear - yearSelected: ", yearSelected);

    // Assuming curr_device is a reactive reference (e.g., Vue ref) or an object containing device details
    console.log("selectYear - device_id: ", curr_device.value.id);  // Access device_id correctly

    // Navigate to the reportYear route with dynamic parameters


    router.push({
        name: 'reportYear',
        params: { year: Number(yearSelected) }
    });


}


const selectDevice = async (deviceFromEmit) => {
    isShowDeviceList.value = false;

    curr_device.value.id = deviceFromEmit.id;
    curr_device.value.name = deviceFromEmit.name;

    // Simpan ke localStorage dalam format yang diinginkan
    const deviceData = {
        device_id: deviceFromEmit.id,
        device_name: deviceFromEmit.name
    };

    localStorage.setItem('report', JSON.stringify({ device: deviceData }));

    console.log('Device selected:', deviceFromEmit);
};

onMounted(() => {
    console.groupCollapsed("---onMounted---");

    // Cek apakah ada data device yang tersimpan di localStorage
    const savedDevice = localStorage.getItem('report');
    let deviceIdFromLocalStorage = null;
    let deviceNameFromLocalStorage = null;

    if (savedDevice) {
        const parsedDevice = JSON.parse(savedDevice);
        if (parsedDevice && parsedDevice.device) {
            deviceIdFromLocalStorage = parsedDevice.device.device_id;
            deviceNameFromLocalStorage = parsedDevice.device.device_name;
        }
    }

    console.log('Device ID from localStorage:', deviceIdFromLocalStorage);
    console.log('Device Name from localStorage:', deviceNameFromLocalStorage);

    console.groupEnd();

    // Jika ID dan Name sudah ada di localStorage, jalankan selectDevice
    if (deviceIdFromLocalStorage && deviceNameFromLocalStorage) {
        const deviceFromStorage = {
            id: deviceIdFromLocalStorage,
            name: deviceNameFromLocalStorage,
        };

        // Trigger kembali selectDevice
        selectDevice(deviceFromStorage);
    }
});


function downloadData(tipe, year) {
    // Contoh pemanggilan API download atau pembuatan file
    console.log(`Downloading ${tipe} for year ${year}`);
    // Lakukan pemanggilan API / logika lainnya sesuai kebutuhan
}




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



.hoverable-row:hover {
    background-color: #f5f5f5;
    /* Ganti sesuai warna hover yang kamu inginkan */
}
</style>