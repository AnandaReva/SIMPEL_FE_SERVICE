<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Drawer untuk tampilan mobile -->
        <v-navigation-drawer v-model="drawer" temporary location="left" width="400" class="elevation-2">
            <v-card color="base" elevation="0" style="height: 100%;">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span class="text-h6">Daftar Perangkat</span>
                    <v-btn icon @click.stop="drawer = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <!-- Konten daftar perangkat -->
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
                    <v-card-title class="d-flex justify-space-between align-center">
                        <span class="text-h6">Daftar Perangkat</span>
                        <v-btn icon @click.stop="drawer = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-card-title>

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

            <!-- Konten utama -->
            <v-col cols="12" md="8" lg="9">
                <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">
                    <!-- Tombol toggle drawer untuk mobile -->
                    <v-btn icon @click.stop="drawer = !drawer" class="d-md-none">
                        <v-icon>mdi-menu</v-icon>
                    </v-btn>

                    <!-- Konten utama Anda di sini -->
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, watch } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

const popupVisible = ref(false);
const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);
const drawer = ref(false);

//////////////////// DEVICES ////////////////////
const selectedOrderByDeviceList = ref("last_tstamp");
const selectedStatusDeviceList = ref(1);
const selectedSortTypeDeviceList = ref("DESC");
const filterDeviceList = ref('');
const devices = ref([]);
const total_devices = ref(0);
const scrollKeyDevices = ref(0);

//////////////////// USERS ////////////////////
const selectedOrderByUserList = ref("last_tstamp");
const selectedStatusUserList = ref(1);
const selectedSortTypeUserList = ref("DESC");
const filterUserList = ref('');
const users = ref([]);
const page_size = ref(10);
const totalPagesUsers = ref(0);
const totalUsers = ref(0);
const currUserData = ref({});
const lastFetchedPageUsers = ref(0);
const isFetchingUsers = ref(false);
const isFetchingUserData = ref(false);

// Watch untuk responsive drawer
watch(() => drawer.value, (newVal) => {
    if (window.innerWidth >= 1080 && newVal) {
        drawer.value = false;
    }
});

// Device functions
const toogleSortType = () => {
    selectedSortTypeDeviceList.value = selectedSortTypeDeviceList.value === "ASC" ? "DESC" : "ASC";
};

const searchDevices = () => {
    // Implementasi pencarian perangkat
    console.log("Searching devices...");
};

const loadDevices = ({ done }) => {
    // Implementasi infinite scroll perangkat
    console.log("Loading devices...");
    done("empty");
};

const selectDevice = (device) => {
    // Implementasi pemilihan perangkat
    console.log("Selected device:", device);
};



// User functions
const searchUsers = () => {
    totalUsers.value = 0;
    lastFetchedPageUsers.value = 0;
    users.value = [];
    getUserList(1);
};

const loadUsers = ({ done }) => {
    if (totalPagesUsers.value === 0) {
        done("empty");
        return;
    }

    const fetchedPageNumber = lastFetchedPageUsers.value + 1;

    setTimeout(async () => {
        await getUserList(fetchedPageNumber);
        done(fetchedPageNumber < totalPagesUsers.value ? "done" : "empty");
    }, 1000);
};

const appendUsers = (users, additionalUsers) => {
    const userMap = new Map();
    users.forEach((user) => userMap.set(user.user_id, user));
    additionalUsers.forEach((newUser) => {
        if (!userMap.has(newUser.user_id)) {
            users.push(newUser);
            userMap.set(newUser.user_id, newUser);
        }
    });
    return users;
};

async function getUserList(pageNumberParam) {
    if (isFetchingUsers.value) return;

    isFetchingUsers.value = true;

    try {
        const operation = "get_user_list";
        const params = {
            filter: filterUserList.value,
            order_by: selectedOrderByUserList.value,
            sort_type: selectedSortTypeUserList.value,
            page_number: pageNumberParam,
            page_size: page_size.value,
            st: selectedStatusUserList.value,
        };

        const response_be = await Process(BASE_API_URL, operation, params);

        if (response_be.status !== "success") {
            popUpProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Pengguna Aktif",
                errorCode: response_be.error_code,
            };
            popupVisible.value = true;
            return;
        }

        const responseBE = response_be.payload;
        if (responseBE.users) {
            users.value = appendUsers(users.value, responseBE.users);
            totalUsers.value = responseBE.total_data;
            totalPagesUsers.value = Math.ceil(responseBE.total_data / page_size.value);
            lastFetchedPageUsers.value = pageNumberParam;
        }
    } catch (err) {
        console.error("ERROR WHILE GETTING USERS:", err);
    } finally {
        isFetchingUsers.value = false;
    }
}

async function getUserData(userIdParam) {
    if (isFetchingUserData.value) return false;

    isFetchingUserData.value = true;

    try {
        const operation = "get_user_data";
        const params = { user_id: userIdParam };
        const response_be = await Process(BASE_API_URL, operation, params);

        if (response_be.status !== "success") {
            popUpProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Pengguna",
                errorCode: response_be.error_code,
            };
            popupVisible.value = true;
            return false;
        }

        const responseBE = response_be.payload;
        if (responseBE.user_data) {
            currUserData.value = responseBE.user_data;
            return true;
        }
        return false;
    } catch (err) {
        console.error("getUserData FAILED!!:", err);
        return false;
    } finally {
        isFetchingUserData.value = false;
    }
}

function handleUserSelection(userId, userName) {
    console.log("Selected User:", userId, userName);
}

async function handleEditUser(userIdParam) {
    const isSuccess = await getUserData(userIdParam);
    if (!isSuccess) {
        console.error("Failed to get user data");
        return;
    }
    console.log("getUserData SUCCESS!!");
}

function handleDetailUser(userIdParam) {
    console.log("handleDetailUser - user id:", userIdParam);
}
</script>