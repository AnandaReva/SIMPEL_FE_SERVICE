<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Drawer untuk tampilan mobile -->
        <v-navigation-drawer v-model="drawer" temporary location="left" width="400" class="elevation-0"
            :style="drawerStyle">
            <v-card color="base" elevation="2" class="ma-4" style="width: 380px; height: fi">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span class="text-h6">Daftar Perangkat</span>
                    <v-btn icon @click.stop="drawer = false" color="info">
                        <v-icon>mdi-arrow-collapse-left</v-icon>
                    </v-btn>
                </v-card-title>




                <v-card-text>


                    <!-- Konten daftar perangkat -->
                    <div class="d-flex flex-wrap mb-0">
                        <v-col v-if="user_role == 'system master' || user_role == 'system admin'" cols="12"
                            class="d-flex justify-end align-center px-0">
                            <span class="mr-3 text-subtitle-1 font-weight-medium" style="color: #555;">
                                Tambah Perangkat
                            </span>

                            <v-btn @click="toAddPage()" color="primary" icon rounded="circle" elevation="2" class="ma-0"
                                style="width: 48px; height: 48px;">
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
                                {{ selectedSortTypeDeviceList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                            </v-icon>
                        </v-btn>
                    </div>

                    <div class="d-flex align-center mb-4">
                        <v-text-field v-model="filterDeviceList" label="Search" placeholder="Masukkan Nama device"
                            variant="solo" clearable class="px-1" style="max-height: 50px;" maxlength="50"
                            :rules="[v => !v || v.length <= 30 || 'Maksimal 30 karakter']"
                            @input="filterDeviceList = filterDeviceList.slice(0, 30)" />
                        <v-btn icon color="primary" class="ml-2" @click="searchDevices">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </div>

                    <div>
                        <v-infinite-scroll :key="scrollKeyDevices" id="DeviceListBox" ref="DeviceListBox" height="550"
                            side="end" @load="loadDevices" class="overflow-auto">
                            <DeviceListInfiniteScroll :devices="devices" :total_devices="total_devices"
                                @select-device="selectDevice" />
                        </v-infinite-scroll>
                    </div>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>

        <v-row>
            <!-- Daftar Perangkat - Tampilan desktop -->
            <v-col cols="12" md="4" lg="3" class="d-none d-md-flex">
                <v-card color="base" elevation="0" style="height: 100%; width: 100%;">


                    <v-col v-if="user_role == 'system master' || user_role == 'system admin'" cols="12"
                        class="d-flex justify-end align-center">
                        <span class="mr-3 text-subtitle-1 font-weight-medium" style="color: #555;">
                            Tambah Perangkat
                        </span>

                        <v-btn @click="toEditPage(currDeviceDataLocal.device_id)" color="primary" icon rounded="circle"
                            elevation="2" class="ma-0" style="width: 48px; height: 48px;">
                            <v-icon size="24">mdi-plus</v-icon>
                        </v-btn>
                    </v-col>



                    <v-card-text>
                        <!-- Konten yang sama seperti di drawer -->
                        <div class="d-flex flex-wrap mb-0">
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
                                    {{ selectedSortTypeDeviceList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                                </v-icon>
                            </v-btn>
                        </div>

                        <div class="d-flex align-center mb-4">
                            <v-text-field v-model="filterDeviceList" label="Search" placeholder="Masukkan Nama device"
                                variant="solo" clearable class="px-1" style="max-height: 50px;" maxlength="50"
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
                                    @select-device="selectDevice" />
                            </v-infinite-scroll>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <!-- Tombol sticky di kiri atas, hanya terlihat di layar kecil -->
            <v-btn icon @click.stop="drawer = !drawer" class="d-md-none"
                style="position: sticky; top: 10px; left: 0; z-index: 100;">
                <v-icon>mdi-arrow-expand-right</v-icon>
            </v-btn>


            <v-col cols="12" md="8" lg="9">
                <v-card color="base" elevation="2" rounded="xl" class="pa-4 d-flex flex-column"
                    style="min-height: calc(100vh - 32px); height: 100%;">

                    <!-- Konten utama -->
                    <v-container v-if="curr_device?.id" class="flex-grow-1">
                        <!-- Konten saat perangkat dipilih -->


                        <!-- Parent -->




                        <div>

                            <Detaildevice :curr_device_detail_data="curr_device" @select-device="selectDevice" />
                        </div>



                    </v-container>

                    <v-container v-else class="d-flex align-center justify-center flex-grow-1">
                        <v-col class="text-center" cols="auto">
                            <v-icon size="64" color="grey">mdi-access-point-plus</v-icon>
                            <p class="text-h6 mt-4 mb-6">Tidak ada perangkat yang dipilih</p>
                            Silahkan pilih perangkat terlebih dahulu pada panel Daftar Perangkat
                        </v-col>
                    </v-container>

                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';
import Detaildevice from './DetailDevice.vue';

import { useRouter } from 'vue-router';

const router = useRouter();


const popupVisible = ref(false);
const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);
const drawer = ref(false);


const drawerStyle = computed(() => ({
    backgroundColor: 'transparent',
    boxShadow: 'none',
    border: 'none',
}));

const curr_device = ref();



watch(
    curr_device,
    (newVal, oldVal) => {
        console.log('curr_device changed:', { oldVal, newVal })
        // Tambahkan logika lain di sini, misalnya fetch data detail
    },
    { deep: true }
)


const user_role = ref('user_guest')


//////////////////// DEVICES ////////////////////


const isFetchingDeviceDetail = ref(false)
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

///
function selectDevice(deviceSelected) {
    console.log("---selectDevice---")

    console.log("selectDevice - deviceSelected: ", deviceSelected.id)


    // Object.assign(curr_device.value, {
    //     id: responseBE.device_id,
    //     name: responseBE.device_name,
    // });

    // curr_device.value = deviceSelected.id

    // const id = deviceSelected.id
    // console.log("selectDevice - id: ", id)

    // if (deviceSelected.id === curr_device.value.id) {
    //     console.log("device ", deviceSelected.id, "already selected")
    //     return;
    // }

    // console.log("selectdevice - curr_device.value.id: ", curr_device.value.id)



    getDeviceDetail(deviceSelected.id);

    drawer.value = false



}


////////// DEVICE DETAIL ////////////



async function getDeviceDetail(deviceIdParam) {
    console.log("----getDeviceDetail----")
    if (isFetchingDeviceDetail.value == true) {
        console.log("Fetching device detail already in progress...");
        return false;
    }

    isFetchingDeviceDetail.value = true;

    try {
        const operation = "get_device_detail";
        const baseUrl = BASE_API_URL;

        const params = {
            device_id: deviceIdParam
        };

        console.log("getDeviceDetail params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("getDeviceDetail FAILED!!:", response_be.error_message);
            popUpProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Perangkat Aktif",
                errorCode: response_be.error_code,
            };
            popupVisible.value = true;
            return false;
        }

        const responseBE = response_be.payload;

        console.log("getDeviceDetail SUCCESS!!");



        if (!curr_device.value || typeof curr_device.value !== 'object') {
            curr_device.value = {};
        }


        Object.assign(curr_device.value, {
            id: responseBE.device_id,
            name: responseBE.device_name,
            password: responseBE.device_password,
            create_timestamp: responseBE.device_create_timestamp,
            status: responseBE.device_status,
            last_timestamp: responseBE.device_last_timestamp,
            read_interval: responseBE.device_read_interval,
            data: responseBE.device_data ?? {},
            image: responseBE.device_image,
        });


        // Optional: log jika device_data kosong
        if (!responseBE.device_data) {
            console.log("device_data is empty (null or undefined).");
        }

        return true;

    } catch (err) {
        console.error("ERROR WHILE GETTING DEVICE DETAIL DATA:", err);
        return false;
    } finally {
        isFetchingDeviceDetail.value = false;
    }
}


function toAddPage() {

    router.push({ name: "device-add" })



}





onMounted(() => {
    // get user role
    const user_data = JSON.parse(localStorage.getItem('user_data'));
    user_role.value = user_data?.role;
    //console.log('user_role', user_role.value);

    searchDevices();
    const rawCurrDeviceData = sessionStorage.getItem("curr_device_selected")

    try {
        curr_device.value = JSON.parse(rawCurrDeviceData)
        console.groupCollapsed("---onMounted---")
        console.log("onMounted - curr_device.value: ", curr_device.value)

        //sessionStorage.removeItem("curr_device_selected")


        console.groupEnd()
    } catch (error) {
        console.error("Failed to parse curr_device_selected:", error)
    }

});





</script>


<style scoped>
.transparent-drawer {
    background-color: transparent !important;
    box-shadow: none !important;
}

.transparent-drawer .v-navigation-drawer__content {
    background-color: transparent !important;
    overflow: visible !important;
}
</style>