<template>
    <v-row class="fill-height ma-0">


        <v-col cols="12" class="d-flex align-center">
            <v-tooltip text="Edit user" location="top">
                <template #activator="{ props }">
                    <v-btn v-bind="props" @click="toEditPage(curr_user)" color="info" icon rounded="circle"
                        elevation="2" class="mr-2" style="width: 48px; height: 48px;">
                        <v-icon size="24">mdi-pencil</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>

            <v-tooltip text="Hapus user" location="top">
                <template #activator="{ props }">
                    <v-btn v-bind="props" @click="handleDeleteUser(curr_user.id)" color="error" icon rounded="circle"
                        elevation="2" style="width: 48px; height: 48px;">
                        <v-icon size="24">mdi-trash-can</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
        </v-col>





        <v-col cols="12" class="pa-0">
            <!-- Header Detail User -->
            <v-card flat class="px-4 py-2 mb-4">
                <p class="text-h6 font-weight-medium text-center mb-0">
                    DETAIL USER
                </p>
            </v-card>

            <!-- Konten Scrollable -->
            <div class="scrollable-content">
                <!-- Informasi Dasar User -->
                <v-card outlined class="mb-4">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Username</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-account</v-icon>
                                    <span>{{ curr_user?.username || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Email</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-email</v-icon>
                                    <span>{{ curr_user?.email || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Nama Lengkap</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-file-account</v-icon>
                                    <span>{{ curr_user?.full_name || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Role</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-shield-account</v-icon>
                                    <span>{{ curr_user?.role || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Ditambahkan</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-calendar-plus</v-icon>
                                    <span>{{ FormatTimestamp(curr_user?.create_timestamp) || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Terakhir</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-calendar-clock</v-icon>
                                    <span>{{ FormatTimestamp(curr_user?.last_timestamp) || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">
                                        {{ curr_user?.status === 1 ? 'mdi-check-circle' : 'mdi-close-circle' }}
                                    </v-icon>
                                    <span>{{ curr_user?.status === 1 ? 'Aktif' : 'Tidak Aktif' }}</span>
                                </v-card>
                            </v-col>
                        </v-row>

                    </v-card-text>
                </v-card>

                <v-card outlined class="mb-4">
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Data Pengguna</span>
                    </v-card-title>

                    <v-card-text v-if="curr_user?.data && Object.keys(curr_user.data).length > 0">

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

                        <v-row v-for="(value, key, index) in curr_user?.data" :key="'data-entry-' + index" class="mb-2">
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
                        <span class="text-subtitle-1 font-weight-medium">Aktivitas Pengguna</span>
                    </v-card-title>

                    <v-card-text v-if="Array.isArray(user_activities) && user_activities.length > 0">

                        <div class="d-flex flex-wrap mb-0">
                            <v-select v-model="selectedOrderByUserActivityList" :items="[
                                { title: 'Waktu terakhir', value: 'timestamp' },
                            ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />

                            <v-select v-model="selectedFilterUserActivityList" :items="[
                                { title: 'Semua', value: '' },
                                { title: 'Update', value: 'update' },
                                { title: 'Connect', value: 'connect' },
                                { title: 'Disconnect', value: 'disconnect' },
                                { title: 'Lainnya', value: 'other' },
                            ]" density="compact" label="Jenis Aktivitas" variant="outlined" style="height: 50px;" />

                            <v-btn @click="toogleSortType" icon>
                                <v-icon>
                                    {{ selectedSortTypeUserActivityList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down'
                                    }}
                                </v-icon>
                            </v-btn>
                        </div>


                        <div>

                            <v-infinite-scroll :key="scrollKeyUserActivities" height="550" side="end"
                                @load="loadUserActivities" class="overflow-auto">
                                <UserActivityListInfiniteScroll :user_activities="user_activities"
                                    :total_user_activities="total_user_activities" />
                            </v-infinite-scroll>
                        </div>




                    </v-card-text>

                    <v-card-text v-else class="text-center">
                        <p class="text-caption text-grey">Tidak ada aktivitas</p>
                    </v-card-text>


                </v-card>
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
import { watch, onMounted, ref } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';
import { FormatTimestamp } from '@/utils/utils';
import { useRouter } from 'vue-router';

import UserActivityListInfiniteScroll from '../parts/UserActivityListInfiniteScroll.vue';

const router = useRouter();
const props = defineProps(["curr_user"]);
const emit = defineEmits(['delete-user']);

function handleDeleteUser(userId) {
    console.log("Emitting delete-user with ID:", userId);
    emit("delete-user", userId);
}



/////////////////// ACTIVITIES /////////////////

const isFetchingUserActivities = ref(false)


const selectedOrderByUserActivityList = ref("timestamp"); // Default: Waktu terakhir
const selectedFilterUserActivityList = ref(null); // Default: Semua perangkat aktif
const selectedSortTypeUserActivityList = ref("desc") // Default: ASC


const user_activities = ref([]);
const page_size = ref(10);
const total_pages_user_activity_list = ref(0);

const total_user_activities = ref();





const toogleSortType = () => {
    selectedSortTypeUserActivityList.value = selectedSortTypeUserActivityList.value === "asc" ? "desc" : "asc";
}


watch(
    [() => selectedSortTypeUserActivityList.value, () => selectedOrderByUserActivityList.value, () => selectedFilterUserActivityList.value],
    ([newSortType, newOrderBy, newStatus]) => {
        /*  console.log(`Changes detected:
       Sort Type: ${newSortType}
       Order By: ${newOrderBy}
       Status: ${newStatus}`); */
        searchUserActivities();
    }, { deep: true }
);


watch(
    () => props.curr_user,
    (newVal) => {
        console.log('User changed in DetailUser', newVal);
        if (newVal?.id) {
            // Reset semua state terkait activities
            user_activities.value = [];
            lastFetchedPageUserActivities.value = 0;
            total_user_activities.value = 0;
            total_pages_user_activity_list.value = 0;
            
            // Load activities untuk user baru
            searchUserActivities();
        }
    },
    { deep: true }
);

// Hapus pemanggilan searchUserActivities() dari onMounted
onMounted(() => {
    console.log("Detail pengguna - curr_user", props.curr_user);
});


const lastFetchedPageUserActivities = ref(0);
const scrollKeyUserActivities = ref(0);

function resetScrollUserActivities() {
    scrollKeyUserActivities.value += 1;
}

///////// INFINITE SCROLL userS //////////
async function loadUserActivities({ done }) {
    console.group("--- loadUserActivities() ---")
    if (total_pages_user_activity_list.value === 0) {
        done("empty");
        return;
    }

    const fetchedPageNumber = lastFetchedPageUserActivities.value + 1;
    console.log("last page:", lastFetchedPageUserActivities.value);
    console.log("Fetched page number:", fetchedPageNumber);

    setTimeout(async () => {
        const success = await getUserActivityList(fetchedPageNumber);

        if (!success || fetchedPageNumber >= total_pages_user_activity_list.value) {
            done("empty");
        } else {
            done("done");
        }
    }, 1000);
    console.groupEnd();
}


function appendUserActivities(user_activities, additionalUserActivities) {
    const userActivityMap = new Map();
    user_activities.forEach((activity) => {
        userActivityMap.set(activity.activity_id, activity);
    });

    additionalUserActivities.forEach((newUserActivity) => {
        if (!userActivityMap.has(newUserActivity.activity_id)) {
            user_activities.push(newUserActivity);
            userActivityMap.set(newUserActivity.activity_id, newUserActivity);
        }
    });

    return user_activities;
}


function searchUserActivities() {
    total_user_activities.value = 0;
    resetScrollUserActivities();
    lastFetchedPageUserActivities.value = 0;
    user_activities.value = []; // Reset daftar perangkat sebelum pencarian baru
    getUserActivityList(1); // Fetch data dengan parameter baru
}


async function getUserActivityList(pageNumberParam) {
    console.log("----getUserActivityList----");

    if (isFetchingUserActivities.value === true) {
        console.log("Fetching user activities already in progress...");
        return false;
    }

    isFetchingUserActivities.value = true;

    try {
        const operation = "get_user_activity_list";
        const baseUrl = BASE_API_URL;

        const params = {
            user_id: props.curr_user.id,
            filter: selectedFilterUserActivityList.value,
            order_by: selectedOrderByUserActivityList.value,
            sort_type: selectedSortTypeUserActivityList.value,
            page_number: pageNumberParam,
            page_size: page_size.value,
            st: selectedFilterUserActivityList.value,
        };

        console.log("getUserActivityList params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            // Lempar error agar catch bisa menangani
            throw new Error(response_be.error_message || "Unknown error from backend");
        }

        const responseBE = response_be.payload;
        if (!responseBE.user_activities || responseBE.user_activities.length === 0) {
            console.log("User list is empty");
            return false;
        }

        console.log("getUserActivityList SUCCESS!!");
        user_activities.value = appendUserActivities(user_activities.value, responseBE.user_activities);
        total_user_activities.value = responseBE.total_data;
        total_pages_user_activity_list.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        lastFetchedPageUserActivities.value = pageNumberParam;

        console.log("total_pages_user_activity_list: ", total_pages_user_activity_list.value);
        console.log("total_user_activities: ", total_user_activities.value);
        return true;
    } catch (err) {
        console.error("ERROR WHILE GETTING USER ACTIVITY LIST :", err);

        emit("write-popUp-info-box", "error", "Gagal Mendapatkan Data Aktivitas Pengguna", err.code || "UNKNOWN");




        return false;
    } finally {
        isFetchingUserActivities.value = false;
    }
}











///////////////////////////////////////////////

function toEditPage(currUserDetailDataParam) {
    console.log("---toEditPage---")
    console.log("toEditPage - currUserDetailDataParam: ", currUserDetailDataParam)

    if (!currUserDetailDataParam.id || currUserDetailDataParam.id <= 0) {
        console.log("toEditPage - currUserDetailDataParam.user_id not valid: ", currUserDetailDataParam.user_id)
        return;
    }

    sessionStorage.setItem("user_management", JSON.stringify(currUserDetailDataParam))

    router.push({
        name: "user-edit",
        params: {
            username: currUserDetailDataParam.username,
        }
    })
}

onMounted(() => {
    console.log("detail pengguna - curr_user", props.curr_user)

    console.log("pengguna - curr_user", props.curr_user);
    if (props.curr_user?.id) {
        searchUserActivities();
        console.log("pengguna - curr_user.id", props.curr_user.id);
    } else {
        console.log("pengguna - curr_user.id not valid");
    }

});
</script>