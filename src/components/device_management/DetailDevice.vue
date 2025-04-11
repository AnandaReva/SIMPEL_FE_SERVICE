<template>
    <v-col class="fill-height px-0">
        <v-col cols="auto" class="d-flex align-center">
            <v-btn @click="backToDeviceList" color="primary" class="d-flex justify-center align-center"
                style="max-height: 50px">
                <v-icon>mdi-arrow-left-bold</v-icon> <span>Kembali</span>
            </v-btn>
        </v-col>

        <v-row class="fill-height">
            <v-col class="mx-auto px-0">
                <p class="text-h6 font-weight-medium ma-0 text-center">
                    Detail Perangkat
                </p>

                <br>

                <v-container class="pa-4 flex-grow-1 overflow-y-auto px-0" style="max-height: 624px;">
                    <v-col class="d-flex flex-column">
                        <!-- Nama Perangkat -->


                        <v-col class="mb-4">
                            <p class="text-subtitle-1 font-weight-medium mb-1">Nama Perangkat</p>
                            <v-card outlined class="pa-3">
                                {{ currDeviceData.device_name }}
                            </v-card>
                        </v-col>

                        <!-- Password -->
                        <v-col class="mb-4">
                            <p class="text-subtitle-1 font-weight-medium mb-1">Password</p>
                            <v-card outlined class="pa-3">
                                {{ currDeviceDataLocal.device_password }}
                            </v-card>
                        </v-col>

                        <!-- Interval Pembacaan -->
                        <v-col class="mb-4">
                            <p class="text-subtitle-1 font-weight-medium mb-1">Interval Pembacaan Data Sensor (Detik)
                            </p>
                            <v-card outlined class="pa-3">
                                {{ currDeviceDataLocal.device_read_interval }}
                            </v-card>
                        </v-col>


                        <!-- Gambar Perangkat -->
                        <v-col class="mb-4">

                            <p class="text-subtitle-1 font-weight-medium mb-1">Gambar
                            </p>
                            <v-row class="d-flex justify-center mt-1 mb-3" v-if="existingImageSrc">
                                <v-img :src="existingImageSrc" class="mt-4 mb-5" max-height="200" contain />
                            </v-row>

                        </v-col>

                        <!-- Data Perangkat -->
                        <v-row class="pa-4">
                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat</p>
                        </v-row>

                        <div class="scrollable-container px-0 border mb-4 mx-0">
                            <v-container v-for="(currData, index) in currDeviceDetailsData" :key="'existing-' + index">
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-card outlined class="pa-2">

                                            {{ currData.title }}
                                        </v-card>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-card outlined class="pa-2">

                                            {{ currData.data }}
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-container>

                            <v-container>



                            </v-container>
                        </div>
                        <v-col class="mb-4 mx-0 px-0">


                            <v-col>


                                <v-col>
                                    <!-- filterDeviceList -->
                                    <v-row class="px-0" style="max-height: 70px;">
                                        <v-col cols="6" class="px-1">
                                            <v-select v-model="selectedFilter" :items="[
                                                { title: 'Semua', value: '' },
                                                { title: 'Update', value: 'update' },
                                                { title: 'Connect', value: 'connect' },
                                                { title: 'Disconnect', value: 'disconnect' },
                                                { title: 'Lainnya', value: 'other' },
                                            ]" density="compact" label="Filter" variant="outlined"></v-select>
                                        </v-col>

                                        <v-col cols="5" class="px-1">
                                            <v-btn type="button" @click="toggleSortType" color="blue-lighten-4"
                                                variant="flat" style="border: 1px solid ; height: 40px; width: 100%;">
                                                <template v-if="selectedSortType === 'ASC'">
                                                    <v-icon>mdi-arrow-up</v-icon>
                                                </template>
                                                <template v-else>
                                                    <v-icon>mdi-arrow-down</v-icon>
                                                </template>
                                            </v-btn>
                                        </v-col>

                                        <v-col cols="1" class="px-1">
                                            <v-btn color="primary" @click="searchDeviceActivities"
                                                class="search-button rounded-circle d-flex justify-center align-center"
                                                style="height: 40px; width: 40px; min-width: 40px;">
                                                <v-icon>mdi-magnify</v-icon>
                                            </v-btn>
                                        </v-col>
                                    </v-row>



                                </v-col>



                                <!-- Device activities -->





                                <v-col class="px-0">
                                    <p>
                                        Dilihat : {{ device_activities.length }} / {{ totalDeviceActivities }}
                                    </p>

                                    <v-infinite-scroll v-if="currDeviceDataLocal.device_id" height="550"
                                        @load="loadDeviceActivities" :key="scrollKeyDeviceActivities"
                                        class="overflow-auto px-0">
                                        <DevicesActivityList :device-activities="device_activities" />
                                    </v-infinite-scroll>

                                </v-col>


                            </v-col>


                        </v-col>
                    </v-col>


                    <!-- Tombol Ke Edit Page -->
                    <v-col v-if="user_role == 'system master' || user_role == 'system admin'" cols="auto"
                        class="d-flex justify-end">
                        <v-btn @click="toEditPage(currDeviceDataLocal.device_id)" color="primary"
                            class="d-flex justify-center align-center" style="max-height: 50px">
                            <span class="pr-1">Ubah data </span>
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </v-col>

                </v-container>

            </v-col>


        </v-row>
    </v-col>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import DevicesActivityList from "./DevicesActivityList.vue";
import { ExtractImage } from "@/utils/utils"
import { Process } from "@/utils/requestHelper";
import { BASE_API_URL } from "@/configs/config";

const emit = defineEmits(["toogle-detail-device-state", "handle-edit-device"]);
const props = defineProps(["currDeviceData"]);

// Device data
const user_role = ref("");
const currDeviceDataLocal = ref({
    device_id: null,
    device_name: "",
    device_password: "",
    device_read_interval: 0,
    device_data: {},
    device_image: {}
});
const currDeviceDetailsData = ref([]);
const existingImageSrc = ref("");

// Device activities state
const device_activities = ref([]);
const totalDeviceActivities = ref(0);
const totalPagesDeviceActivities = ref(0);
const isFetchingDeviceActivities = ref(false);
const lastFetchedPageDeviceActivities = ref(0);
const scrollKeyDeviceActivities = ref(0);

// Filter and sorting
const selectedFilter = ref("");
const selectedSortType = ref("DESC");
const page_size = ref(10); // Adjust as needed


// Methods
const toggleSortType = () => {
    selectedSortType.value = selectedSortType.value === "ASC" ? "DESC" : "ASC";
};

const resetScrollDeviceActivities = () => {
    scrollKeyDeviceActivities.value += 1;
};




const loadDeviceActivities = async ({ done }) => {
    if (totalPagesDeviceActivities.value === 0) {
        done("empty");
        return;
    }

    console.log("---loadDeviceActivities---")
    const fetchedPageNumber = lastFetchedPageDeviceActivities.value + 1;
    console.log("loadDeviceActivities - ast page:", lastFetchedPageDeviceActivities.value);
    console.log("loadDeviceActivities - Fetched page number:", fetchedPageNumber);


    setTimeout(async () => {
        await getDeviceActivitiesList(fetchedPageNumber);

        if (fetchedPageNumber < totalPagesDeviceActivities.value) {
            done("done");
        } else {
            done("empty");
        }
    }, 1000);
    console.groupEnd();
};


const appendDeviceActivities = (device_activities, additionalDevices) => {
    console.log("---appendDeviceActivities----")
    console.log("appendDeviceActivities - curr devices: ", device_activities)
    console.log("appendDeviceActivities - additionalDevices: ", additionalDevices)

    const deviceActivityMap = new Map();
    device_activities.forEach((activity) => {
        deviceActivityMap.set(activity.activity_id, activity);
    });

    additionalDevices.forEach((newActivity) => {
        if (!deviceActivityMap.has(newActivity.device_id)) {
            device_activities.push(newActivity);
            deviceActivityMap.set(newActivity.activity_id, newActivity);
        }
    });

    return device_activities;
};


// function appendDevices(devices, additionalDevices) {
//     const deviceMap = new Map();
//     devices.forEach((device) => {
//         deviceMap.set(device.device_id, device);
//     });

//     additionalDevices.forEach((newDevice) => {
//         if (!deviceMap.has(newDevice.device_id)) {
//             devices.push(newDevice);
//             deviceMap.set(newDevice.device_id, newDevice);
//         }
//     });

//     return devices;
// }



const searchDeviceActivities = () => {
    resetScrollDeviceActivities();
    lastFetchedPageDeviceActivities.value = 0;
    device_activities.value = [];
    getDeviceActivitiesList(1);
};

async function getDeviceActivitiesList(pageNumberParam) {

    console.log("---getDeviceActivitiesList---")

    if (isFetchingDeviceActivities.value) return;

    isFetchingDeviceActivities.value = true;

    try {
        const operation = "get_device_activity_list";
        const baseUrl = BASE_API_URL;
        const params = {
            device_id: currDeviceDataLocal.value.device_id,
            filter: selectedFilter.value,
            sort_type: selectedSortType.value,
            page_number: pageNumberParam,
            page_size: page_size.value,
        };

        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("Failed to get device activities:", response_be.error_message);
            return;
        }

        const responseBE = response_be.payload;

        //console.log("getDeviceActivitiesList - responseBE: ", responseBE.device_activities)
        if (!responseBE.device_activities) {
            console.log("getDeviceActivitiesList - device_activities")
            return;
        }

        console.log("getDeviceActivitiesList - device_activities: ", device_activities.value)

        device_activities.value = appendDeviceActivities(device_activities.value, responseBE.device_activities);
        totalDeviceActivities.value = responseBE.total_data;
        totalPagesDeviceActivities.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        lastFetchedPageDeviceActivities.value = pageNumberParam;
    } catch (err) {
        console.error("Error while getting device activities:", err);
    } finally {
        isFetchingDeviceActivities.value = false;
    }
}

// Watchers
watch([selectedSortType, selectedFilter], () => {
    searchDeviceActivities();
});

// Lifecycle hooks
onMounted(async () => {
    const user_data = JSON.parse(localStorage.getItem('user_data'));
    user_role.value = user_data?.role;

    if (props.currDeviceData) {
        const newVal = props.currDeviceData;
        currDeviceDataLocal.value = {
            device_id: newVal.device_id || null,
            device_name: newVal.device_name || "",
            device_password: newVal.device_password || "",
            device_read_interval: newVal.device_read_interval || 1,
            device_image: newVal.device_image || {},
        };

        if (newVal.device_data) {
            currDeviceDetailsData.value = Object.entries(newVal.device_data)
                .map(([key, value]) => ({
                    title: key,
                    data: value
                }));
        }

        if (newVal.device_image?.file_data) {
            existingImageSrc.value = await ExtractImage(newVal.device_image.file_data);
        }
        await nextTick();
        resetScrollDeviceActivities();
        searchDeviceActivities(1);
    }
});



const backToDeviceList = () => {
    emit("toogle-detail-device-state");
};

const toEditPage = (deviceId) => {
    emit("handle-edit-device", deviceId);
};
</script>

<style scoped>
.scrollable-container {
    max-height: 300px;
    overflow-y: auto;
}

.border {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}
</style>