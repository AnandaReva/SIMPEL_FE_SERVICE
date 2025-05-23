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





                <v-card class="mb-6" elevation="2">
                    <v-card-title color="primary" class="text-h6 font-weight-bold">Detail</v-card-title>
                    <div class="table-container">


                        Total Tahun = {{ year_list_totalData }}

                        <v-data-table-server :items="year_list" :items-length="year_list_totalData"
                            :items-per-page="year_list_pageSize" :items-per-page-options="[
                                { value: 5, title: '5' },
                                { value: 10, title: '10' },
                                { value: 20, title: '20' },
                                { value: 50, title: '50' }
                            ]" @update:items-per-page="(newSize) => year_list_pageSize = newSize"
                            class="elevation-1 text-body-2" dense no-data-text="Tidak ada data tahun yang tersedia.">
                            <!-- Custom header with sub-headers -->
                            <template #headers>
                                <tr>
                                    <th rowspan="2">No</th>
                                    <!-- Tahun -->
                                    <th rowspan="2" class="text-center">
                                        <div class="d-flex align-center justify-center" @click="toggleSortYear('year')">
                                            Tahun
                                            <v-icon size="x-small" class="ms-1">
                                                {{
                                                    year_orderBy === 'year'
                                                        ? (year_sortType === 'desc' ? 'mdi-chevron-down' : 'mdi-chevron-up')
                                                        : 'mdi-swap-vertical'
                                                }}
                                            </v-icon>
                                        </div>
                                    </th>

                                    <th rowspan="2">Waktu Pertama</th>
                                    <th rowspan="2">Waktu Terakhir</th>

                                    <!-- Total Energi -->
                                    <th rowspan="2" class="text-center">
                                        <div class="d-flex align-center justify-center"
                                            @click="toggleSortYear('energy_consumed_count')">
                                            Total Energi (kWh)
                                            <v-icon size="x-small" class="ms-1">
                                                {{
                                                    year_orderBy === 'energy_consumed_count'
                                                        ? (year_sortType === 'desc' ? 'mdi-chevron-down' : 'mdi-chevron-up')
                                                        : 'mdi-swap-vertical'
                                                }}
                                            </v-icon>
                                        </div>
                                    </th>

                                    <!-- Jumlah Data -->
                                    <th rowspan="2" class="text-center">
                                        <div class="d-flex align-center justify-center"
                                            @click="toggleSortYear('total_data')">
                                            Jumlah Data
                                            <v-icon size="x-small" class="ms-1">
                                                {{
                                                    year_orderBy === 'total_data'
                                                        ? (year_sortType === 'desc' ? 'mdi-chevron-down' : 'mdi-chevron-up')
                                                        : 'mdi-swap-vertical'
                                                }}
                                            </v-icon>
                                        </div>
                                    </th>

                                    <th rowspan="2">Interval (s)</th>
                                    <th rowspan="2">Ukuran</th>
                                    <th colspan="3" class="text-center">Tegangan (Volt)</th>
                                    <th colspan="3" class="text-center">Arus (Ampere)</th>
                                    <th colspan="3" class="text-center">Daya (W)</th>
                                    <th colspan="3" class="text-center">Frekuensi (Hz)</th>
                                    <th colspan="3" class="text-center">PF</th>
                                    <th colspan="3" class="text-center">Aksi</th>
                                </tr>
                                <tr>
                                    <th class="text-center">Maks</th>
                                    <th class="text-center">Min</th>
                                    <th class="text-center">Rata-rata</th>
                                    <th class="text-center">Maks</th>
                                    <th class="text-center">Min</th>
                                    <th class="text-center">Rata-rata</th>
                                    <th class="text-center">Maks</th>
                                    <th class="text-center">Min</th>
                                    <th class="text-center">Rata-rata</th>
                                    <th class="text-center">Maks</th>
                                    <th class="text-center">Min</th>
                                    <th class="text-center">Rata-rata</th>
                                    <th class="text-center">Maks</th>
                                    <th class="text-center">Min</th>
                                    <th class="text-center">Rata-rata</th>
                                    <th class="text-center">Lihat</th>
                                    <th class="text-center">CSV</th>
                                    <th class="text-center">Excel</th>
                                </tr>
                            </template>

                            <!-- Data rows -->
                            <template #item="{ item, index }">
                                <tr>
                                    <td class="text-center">{{ index + 1 }}</td>
                                    <td class="text-center">{{ item.year }}</td>
                                    <td class="text-center">{{ FormatToLocal(item.first_record_timestamp) }}</td>
                                    <td class="text-center">{{ FormatToLocal(item.last_record_timestamp) }}</td>
                                    <td class="text-center">{{ item.energy_consumed_count.toFixed(2) }} kWh</td>
                                    <td class="text-center">{{ item.total_data }}</td>
                                    <td class="text-center">{{ item.data_interval.toFixed(2) }} s</td>
                                    <td class="text-center">{{ FormatSize(item.total_size_bytes) }}</td>

                                    <!-- Voltage -->
                                    <td class="text-center">{{ item.voltage.max.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.voltage.min.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.voltage.avg.toFixed(2) }}</td>

                                    <!-- Current -->
                                    <td class="text-center">{{ item.current.max.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.current.min.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.current.avg.toFixed(2) }}</td>

                                    <!-- Power -->
                                    <td class="text-center">{{ item.power.max.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.power.min.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.power.avg.toFixed(2) }}</td>

                                    <!-- Frequency -->
                                    <td class="text-center">{{ item.frequency.max.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.frequency.min.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.frequency.avg.toFixed(2) }}</td>

                                    <!-- Power Factor -->
                                    <td class="text-center">{{ item.power_factor.max.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.power_factor.min.toFixed(2) }}</td>
                                    <td class="text-center">{{ item.power_factor.avg.toFixed(2) }}</td>

                                    <!-- Action -->
                                    <td class="text-center">
                                        <v-btn size="x-small" variant="text" color="primary"
                                            @click="selectYear(item.year)">
                                            <v-icon start small>mdi-eye</v-icon> Detail
                                        </v-btn>
                                    </td>
                                    <td class="text-center">
                                        <v-btn size="x-small" color="success" variant="text" class="me-2"
                                            @click.stop="downloadData('csv', item.year)">
                                            <v-icon start>mdi-file-delimited</v-icon> CSV
                                        </v-btn>
                                    </td>
                                    <td class="text-center">
                                        <v-btn size="small" color="success" variant="text"
                                            @click.stop="downloadData('excel', item.year)">
                                            <v-icon start>mdi-file-excel</v-icon> Excel
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

                        <div class="d-flex justify-space-between mt-4">
                            <v-btn @click="prevPage" :disabled="isDisablePrevButton()" prepend-icon="mdi-chevron-left">
                                Sebelumnya
                            </v-btn>
                            <v-btn @click="nextPage" :disabled="isDisableNextButton()" append-icon="mdi-chevron-right">
                                Berikutnya
                            </v-btn>
                        </div>




                    </div>



                </v-card>


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




            <div id="chartContainer" style="height: 370px; width: 100%;"></div>
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

import { useRouter } from 'vue-router';



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
const start_year = ref(null) // Cursor pagination, null = dari tahun terbaru
const next_start_year = ref(null)
const prev_start_year = ref(null)
const year_list = ref([])
const year_list_totalData = ref(0)
const year_list_pageSize = ref(10)
const paginationDirection = ref("next") // 'next' or 'prev'


const max_year = ref(null)
const min_year = ref(null)

// Sorting
const year_orderBy = ref("year")
const year_sortType = ref("desc") // default sort descending



watch(year_list_pageSize, async (newSize) => {
    console.log("year_list_pageSize - year_list_pageSize: ", year_list_pageSize)
    if (!curr_device.value?.id) return
    start_year.value = null
    paginationDirection.value = "next"
    await getReportYearList()
})


// Calculate next/prev years based on current data and sort type
const calculatePaginationYears = () => {
    if (year_list.value.length === 0) {
        next_start_year.value = null
        prev_start_year.value = null
        return
    }

    const firstYear = year_list.value[0].year
    const lastYear = year_list.value[year_list.value.length - 1].year

    if (year_sortType.value === 'desc') {
        // Descending order (newest first)
        next_start_year.value = lastYear - 1
        prev_start_year.value = firstYear + 1
    } else {
        // Ascending order (oldest first)
        next_start_year.value = lastYear + 1
        prev_start_year.value = firstYear - 1
    }
}

// Pagination functions
const nextPage = async () => {
    paginationDirection.value = "next"
    start_year.value = next_start_year.value
    await getReportYearList()
}

const prevPage = async () => {
    paginationDirection.value = "prev"
    start_year.value = prev_start_year.value
    await getReportYearList()
}

const isDisableNextButton = () => {
    if (!year_list.value.length) return true
    if (year_sortType.value === 'desc') {
        return year_list.value[year_list.value.length - 1].year <= min_year.value
    } else {
        return year_list.value[year_list.value.length - 1].year >= max_year.value
    }
}

const isDisablePrevButton = () => {
    if (!year_list.value.length) return true
    if (year_sortType.value === 'desc') {
        return year_list.value[0].year >= max_year.value
    } else {
        return year_list.value[0].year <= min_year.value
    }
}


const toggleSortYear = (column) => {
    // Jika mengklik kolom yang sama, toggle sort type
    if (year_orderBy.value === column) {
        year_sortType.value = year_sortType.value === 'asc' ? 'desc' : 'asc'
    }
    // Jika mengklik kolom berbeda, set ke default sort desc
    else {
        year_orderBy.value = column
        year_sortType.value = 'desc'
    }

    // Reset pagination when changing sort order
    start_year.value = null
    paginationDirection.value = "next"
    getReportYearList()
}
// Main data fetching function
const getReportYearList = async () => {
    if (isFetchingYears.value) return

    isFetchingYears.value = true
    isLoading.value = true

    let params = {
        device_id: curr_device.value.id,
        page_size: year_list_pageSize.value,
        sort_type: year_sortType.value,
        order_by: year_orderBy.value
    }

    if (start_year.value !== null) {
        params.start_year = start_year.value
        params.direction = paginationDirection.value
    }

    try {
        const operation = "get_report_year_list"
        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.error_code !== "000000") {
            console.error("getReportYearList FAILED:", response_be.error_message)
            return
        }

        const responseBE = response_be.payload

        // Replace data instead of appending
        year_list.value = responseBE.year_list || []
        year_list_totalData.value = responseBE.total_year || 0

        max_year.value = responseBE.max_year
        min_year.value = responseBE.min_year


        // Calculate next/prev years on client side
        calculatePaginationYears()

    } catch (error) {
        console.error("Error fetching years:", error)
    } finally {
        isFetchingYears.value = false
        isLoading.value = false
    }
}

// Watch for device changes
watch(() => curr_device.value.id, async (newId) => {
    if (newId) {
        // Reset pagination and data when device changes
        start_year.value = null
        next_start_year.value = null
        prev_start_year.value = null
        year_list.value = []
        year_list_totalData.value = 0
        paginationDirection.value = "next"

        await getReportYearList()
    }
})

//////////////////// CHART ///////////////////////
// Watch year dan render chart saat datanya ada
watch(year_list, (val) => {
    if (val.length > 0) renderCanvasChart()
})

function renderCanvasChart() {
    if (typeof CanvasJS === 'undefined') {
        console.error('CanvasJS belum dimuat.');
        return;
    }

    const dataPoints = year_list.value.map((yearData) => ({
        y: yearData.energy_consumed_count,
        label: String(yearData.year), // pastikan label tahun
        indexLabel: `${yearData.energy_consumed_count} kWh`,
        indexLabelFontColor: "#444",
        indexLabelPlacement: "outside"
    }));

    const chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: `Penggunaan Listrik per Tahun`
        },
        axisY: {
            title: "Energi (kWh)",
            includeZero: true
        },
        data: [{
            type: "column",
            color: "#346285", // satu warna
            dataPoints: dataPoints
        }]
    });

    chart.render();
}















/////////////////////


const selectDevice = async (deviceFromEmit) => {
    isShowDeviceList.value = false;

    curr_device.value.id = deviceFromEmit.id;
    curr_device.value.name = deviceFromEmit.name;

    // Simpan ke sessionStorage dalam format yang diinginkan
    const deviceData = {
        device_id: deviceFromEmit.id,
        device_name: deviceFromEmit.name
    };

    sessionStorage.setItem('report_device', JSON.stringify({ device: deviceData }));

    console.log('Device selected:', deviceFromEmit);
};

onMounted(() => {
    console.groupCollapsed("---onMounted---");

    // Cek apakah ada data device yang tersimpan di sessionStorage
    const savedDevice = sessionStorage.getItem('report_device');
    let deviceIdFromsessionStorage = null;
    let deviceNameFromsessionStorage = null;

    if (savedDevice) {
        const parsedDevice = JSON.parse(savedDevice);
        if (parsedDevice && parsedDevice.device) {
            deviceIdFromsessionStorage = parsedDevice.device.device_id;
            deviceNameFromsessionStorage = parsedDevice.device.device_name;
        }
    }

    console.log('Device ID from sessionStorage:', deviceIdFromsessionStorage);
    console.log('Device Name from sessionStorage:', deviceNameFromsessionStorage);

    console.groupEnd();

    // Jika ID dan Name sudah ada di sessionStorage, jalankan selectDevice
    if (deviceIdFromsessionStorage && deviceNameFromsessionStorage) {
        const deviceFromStorage = {
            id: deviceIdFromsessionStorage,
            name: deviceNameFromsessionStorage,
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




function selectYear(yearSelected) {
    console.groupCollapsed('-- selectYear ---:', yearSelected)

    console.log("---Day---")
    console.log("selectyear - yearSelected: ", yearSelected);

    router.push({
        name: 'report-month',
        params: { year: Number(yearSelected) }
    });

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

th {
    vertical-align: middle;
    text-align: center;
}
</style>