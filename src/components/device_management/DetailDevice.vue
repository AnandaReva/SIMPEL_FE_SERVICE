<template>
    <v-row class="fill-height ma-0">

        <!-- {{ curr_device }} -->
        <v-col cols="12" class="d-flex align-center">
            <v-tooltip text="Edit perangkat" location="top">
                <template #activator="{ props }">
                    <v-btn v-bind="props" @click="toEditPage(curr_device)" color="info" icon rounded="circle"
                        elevation="2" class="mr-2" style="width: 48px; height: 48px;">
                        <v-icon size="24">mdi-pencil</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>

            <v-tooltip text="Hapus perangkat" location="top">
                <template #activator="{ props }">
                    <v-btn v-bind="props" @click="handleDeleteDevice(curr_device.id)" color="error" icon
                        rounded="circle" elevation="2" style="width: 48px; height: 48px;">
                        <v-icon size="24">mdi-trash-can</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
        </v-col>


        <v-col cols="12" class="pa-0">
            <!-- Header Detail Perangkat -->
            <v-card flat class="px-4 py-2 mb-4">
                <p class="text-h6 font-weight-medium text-center mb-0">DETAIL DATA PERANGKAT</p>
            </v-card>





            <!-- Konten Scrollable -->
            <div class="scrollable-content">
                <!-- Informasi Dasar Perangkat -->
                <v-card outlined class="mb-4">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Nama Perangkat</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-access-point-network</v-icon>
                                    <span>{{ curr_device?.name || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-lock</v-icon>
                                    <span>{{ curr_device?.password || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Interval Pembacaan (Detik)</p>
                                <v-card flat class="pa-3">
                                    {{ curr_device?.read_interval || '-' }}
                                </v-card>
                            </v-col>


                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Ditambahkan</p>
                                <v-card flat class="pa-3">
                                    {{ FormatTimestamp(curr_device?.create_timestamp) || '-' }}
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Terakhir</p>
                                <v-card flat class="pa-3">
                                    {{ FormatTimestamp(curr_device?.last_timestamp) || '-' }}
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                <v-card flat class="pa-3">



                                    <span v-if="curr_device?.status === 1"> Aktif</span>
                                    <span v-else>Tidak Aktif</span>


                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>



                <!-- Gambar Perangkat -->
                <v-card outlined class="mb-4">
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-image</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Gambar Perangkat</span>
                    </v-card-title>
                    <v-card-text class="text-center">
                        <v-img v-if="curr_device?.image?.file_data" :src="device_image_src" max-height="200" contain
                            class="mx-auto" />
                        <p v-else class="text-caption text-grey">Tidak ada gambar</p>
                    </v-card-text>
                </v-card>


                <!-- {{ curr_device?.data }} -->

                <!-- Data Perangkat -->
                        <v-card outlined class="mb-4">
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Data Perangkat</span>
                    </v-card-title>

                    <v-card-text v-if="curr_device?.data && Object.keys(curr_device.data).length > 0">

                        <!-- Judul -->


                        <v-row class="mb-2">


                            <v-col cols="5" class="pa-0 pr-2">
                                <v-container outlined class="pa-2 text-truncate font-weight-bold">
                                    Judul
                                </v-container>
                            </v-col>
                            <v-col cols="7" class="pa-0">
                                <v-container outlined class="pa-2 text-truncate font-weight-bold">
                                    Isi
                                </v-container>
                            </v-col>
                        </v-row>

                        <!-- Data lainnya -->

                        <v-row v-for="(value, key, index) in curr_device?.data" :key="'data-entry-' + index"
                            class="mb-2">
                            <v-col cols="5" class="pa-0 pr-2" color="base">
                                <v-card outlined class="pa-2 text-truncate">
                                    {{ key }}
                                </v-card>
                            </v-col>
                            <v-col cols="7" class="pa-0">
                                <v-card outlined class="pa-2 text-truncate">
                                    {{ value || '-' }}
                                </v-card>
                            </v-col>
                        </v-row>


                    </v-card-text>


                    <v-card-text v-else class="text-center">

                        <p class="text-caption text-grey">Tidak ada data</p>

                    </v-card-text>
                </v-card>


                <v-card>
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Aktivitas Perangkat</span>
                    </v-card-title>

                    <v-card-text v-if="Array.isArray(device_activities) && device_activities.length > 0">

                        <div class="d-flex flex-wrap mb-0">
                            <v-select v-model="selectedOrderByDeviceActivityList" :items="[
                                { title: 'Waktu terakhir', value: 'timestamp' },
                            ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />

                            <v-select v-model="selectedFilterDeviceActivityList" :items="[
                                { title: 'Semua', value: '' },
                                { title: 'Update', value: 'update' },
                                { title: 'Connect', value: 'connect' },
                                { title: 'Disconnect', value: 'disconnect' },
                                { title: 'Lainnya', value: 'other' },
                            ]" density="compact" label="Jenis Aktivitas" variant="outlined" style="height: 50px;" />

                            <v-btn @click="toogleSortType" icon>
                                <v-icon>
                                    {{ selectedSortTypeDeviceActivityList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down'
                                    }}
                                </v-icon>
                            </v-btn>
                        </div>


                        <div>

                            <v-infinite-scroll :key="scrollKeyDeviceActivities" height="550" side="end"
                                @load="loadDeviceActivities" class="overflow-auto">
                                <DevicesActivityListInfiniteScroll :device_activities="device_activities"
                                    :total_device_activities="total_device_activities" />
                            </v-infinite-scroll>
                        </div>




                    </v-card-text>

                    <v-else v-card-text v-else class="text-center">

                        <p class="text-caption text-grey">Tidak ada aktivitas</p>

                    </v-else>


                </v-card>

            </div>
        </v-col>
    </v-row>

</template>



<script setup>

import DevicesActivityListInfiniteScroll from '../parts/DevicesActivityListInfiniteScroll.vue';

import { watch, onMounted, computed, ref } from 'vue';
import { FormatTimestamp } from '@/utils/utils';
import { useRouter } from 'vue-router';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';



const router = useRouter();
const props = defineProps(["curr_device"]);
const emit = defineEmits(['delete-device', 'write-popUp-info-box']);


const device_image_src = computed(() => {
    const base64Image = props.curr_device?.image?.file_data;
    if (!base64Image) return null;

    let mime = '';
    if (base64Image.startsWith('/9j/')) {
        mime = 'image/jpeg';
    } else if (base64Image.startsWith('iVBORw0KGgo')) {
        mime = 'image/png';
    } else if (base64Image.startsWith('R0lGODdh') || base64Image.startsWith('R0lGODlh')) {
        mime = 'image/gif';
    } else if (base64Image.startsWith('UklGR')) {
        mime = 'image/webp';
    } else {
        // fallback if unknown
        mime = 'application/octet-stream';
    }

    return `data:${mime};base64,${base64Image}`;
});


////////////////////////////////////



function handleDeleteDevice(deviceId) {
    console.log("Emitting delete-device with ID:", deviceId);
    emit("delete-device", deviceId);
}










/////////////////// ACTIVITIES /////////////////

const isFetchingDeviceActivities = ref(false)


const selectedOrderByDeviceActivityList = ref("timestamp"); // Default: Waktu terakhir
const selectedFilterDeviceActivityList = ref(null); // Default: Semua perangkat aktif
const selectedSortTypeDeviceActivityList = ref("desc") // Default: ASC


const device_activities = ref([]);
const page_size = ref(10);
const total_pages_device_activity_list = ref(0);

const total_device_activities = ref();





const toogleSortType = () => {
    selectedSortTypeDeviceActivityList.value = selectedSortTypeDeviceActivityList.value === "asc" ? "desc" : "asc";
}


watch(
    [() => selectedSortTypeDeviceActivityList.value, () => selectedOrderByDeviceActivityList.value, () => selectedFilterDeviceActivityList.value],
    ([newSortType, newOrderBy, newStatus]) => {
        /*  console.log(`Changes detected:
       Sort Type: ${newSortType}
       Order By: ${newOrderBy}
       Status: ${newStatus}`); */
        searchDeviceActivities();
    }, { deep: true }
);


const lastFetchedPageDeviceActivities = ref(0);
const scrollKeyDeviceActivities = ref(0);

function resetScrollDeviceActivities() {
    scrollKeyDeviceActivities.value += 1;
}

///////// INFINITE SCROLL DEVICES //////////
async function loadDeviceActivities({ done }) {
    console.group("--- loadDeviceActivities() ---")
    if (total_pages_device_activity_list.value === 0) {
        done("empty");
        return;
    }

    const fetchedPageNumber = lastFetchedPageDeviceActivities.value + 1;
    console.log("last page:", lastFetchedPageDeviceActivities.value);
    console.log("Fetched page number:", fetchedPageNumber);

    setTimeout(async () => {
        const success = await getDeviceActivityList(fetchedPageNumber);

        if (!success || fetchedPageNumber >= total_pages_device_activity_list.value) {
            done("empty");
        } else {
            done("done");
        }
    }, 1000);
    console.groupEnd();
}


function appendDeviceActivities(device_activities, additionalDeviceActivities) {
    const deviceActivityMap = new Map();
    device_activities.forEach((activity) => {
        deviceActivityMap.set(activity.activity_id, activity);
    });

    additionalDeviceActivities.forEach((newDeviceActivity) => {
        if (!deviceActivityMap.has(newDeviceActivity.activity_id)) {
            device_activities.push(newDeviceActivity);
            deviceActivityMap.set(newDeviceActivity.activity_id, newDeviceActivity);
        }
    });

    return device_activities;
}


function searchDeviceActivities() {
    total_device_activities.value = 0;
    resetScrollDeviceActivities();
    lastFetchedPageDeviceActivities.value = 0;
    device_activities.value = []; // Reset daftar perangkat sebelum pencarian baru
    getDeviceActivityList(1); // Fetch data dengan parameter baru
}


async function getDeviceActivityList(pageNumberParam) {
    console.log("----getDeviceActivityList----");

    if (isFetchingDeviceActivities.value === true) {
        console.log("Fetching device activities already in progress...");
        return false;
    }

    isFetchingDeviceActivities.value = true;

    try {
        const operation = "get_device_activity_list";
        const baseUrl = BASE_API_URL;

        const params = {
            device_id: props.curr_device.id,
            filter: selectedFilterDeviceActivityList.value,
            order_by: selectedOrderByDeviceActivityList.value,
            sort_type: selectedSortTypeDeviceActivityList.value,
            page_number: pageNumberParam,
            page_size: page_size.value,
            st: selectedFilterDeviceActivityList.value,
        };

        console.log("getDeviceActivityList params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            // Lempar error agar catch bisa menangani
            throw new Error(response_be.error_message || "Unknown error from backend");
        }

        const responseBE = response_be.payload;
        if (!responseBE.device_activities || responseBE.device_activities.length === 0) {
            console.log("Device list is empty");
            return false;
        }

        console.log("getDeviceActivityList SUCCESS!!");
        device_activities.value = appendDeviceActivities(device_activities.value, responseBE.device_activities);
        total_device_activities.value = responseBE.total_data;
        total_pages_device_activity_list.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        lastFetchedPageDeviceActivities.value = pageNumberParam;

        console.log("total_pages_device_activity_list: ", total_pages_device_activity_list.value);
        console.log("total_device_activities: ", total_device_activities.value);
        return true;
    } catch (err) {
        console.error("ERROR WHILE GETTING DEVICES:", err);

        /* parent func :
        function writePopUpInfoBox(statusParam, errorCodeParam, errorMessageParam) {
    popUpInfoProps.value = {
        status: statusParam,
        errorMessage: errorMessageParam,
        errorCode: errorCodeParam,
    };
    popUpInfoVisible.value = true;
}

 */

        emit("write-popUp-info-box", "error", "Gagal Mendapatkan Data Aktivitas Perangkat", err.code || "UNKNOWN");




        return false;
    } finally {
        isFetchingDeviceActivities.value = false;
    }
}







//////////////////////////////////////


watch(
    () => props.curr_device,
    (newVal, oldVal) => {
        console.log('Data perangkat diperbarui di Detaildevice', newVal);

        // fecth device activity 
        searchDeviceActivities();

    },
    { deep: true, immediate: true }
);


function toEditPage(currDeviceDetailDataParam) {
    console.log("---toEditPage---")
    console.log("toEditPage - currDeviceDetailDataParam: ", currDeviceDetailDataParam)

    if (!currDeviceDetailDataParam.id || currDeviceDetailDataParam.id <= 0) {
        console.log("toEditPage - currDeviceDetailDataParam.id not valid: ", currDeviceDetailDataParam.id)
        return;
    }

    //  sessionStorage.setItem("device_management", JSON.stringify(currDeviceDetailDataParam))


    router.push({
        name: "device-edit",
        params: {
            device_name: currDeviceDetailDataParam.name,
        }
    })
}

onMounted(() => {

    console.log("detail perangkat - curr_device", props.curr_device);
    if (props.curr_device?.id) {
        searchDeviceActivities();
        console.log("detail perangkat - curr_device.id", props.curr_device.id);
    } else {
        console.log("detail perangkat - curr_device.id not valid");
    }



}

);

</script>