<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">

        <h2 class="text-h5 font-weight-bold px-2" style="color: var(--v-theme-primary);"> Manajemen Perangkat </h2>

        <v-card color="base" class="pa-4 ma-2 w-100 " style="border-radius: 20px; height: 90%;">

            <!-- FILTER -->
            <v-row class="d-flex align-center justify-space-between mb-4" no-gutters>
                <v-col cols="5">
                    <v-select v-model="selectedStatusUserList" :items="[
                        { title: 'Semua', value: '' },
                        { title: 'Aktif', value: 1 },
                        { title: 'Tidak Aktif', value: 0 }
                    ]" density="compact" label="Status" variant="outlined" hide-details />
                </v-col>

                <v-col cols="5">
                    <v-select v-model="selectedOrderByUserList" :items="[
                        { title: 'Waktu terakhir', value: 'last_tstamp' },
                        { title: 'Waktu pengguna mendaftar', value: 'create_timestamp' },
                        { title: 'Nama pengguna', value: 'full_name' }
                    ]" density="compact" label="Pengurutan" variant="outlined" hide-details />
                </v-col>

                <v-col cols="2" class="d-flex justify-center">
                    <v-btn @click="toogleSortType" variant="outlined" class="rounded"
                        style="width: 50px; height: 50px; min-width: 50px;">
                        <v-icon>{{ selectedStatusUserList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <!-- SEARCH -->
            <v-row class="d-flex align-center mb-4" no-gutters>
                <v-col cols="11">
                    <v-text-field v-model="filterUserList" label="Search" placeholder="Masukkan Nama Pengguna"
                        variant="solo" clearable density="compact" maxlength="30" hide-details
                        @input="filterUserList = filterUserList.slice(0, 30)" />
                </v-col>

                <v-col cols="1" class="d-flex justify-center">
                    <v-btn color="primary" @click="searchUsers" class="rounded-circle"
                        style="width: 50px; height: 50px; min-width: 50px;">
                        <v-icon>mdi-magnify</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <!-- USER LIST -->
            <v-row class="overflow-auto" style="height: calc(100% - 200px);">
                <v-col cols="12" class="px-0">
                    <v-infinite-scroll :key="scrollKeyUsers" id="UserBox" ref="UserBox" side="end" @load="loadUsers"
                        class="overflow-auto">
                        <UserList :users="users" :totalUsers="totalUsers" @select-user="handleUserSelection"
                            @view-user-detail="handleDetailUser" />
                    </v-infinite-scroll>
                </v-col>
            </v-row>

        </v-card>
    </v-container>
</template>


<script setup>
import { ref, watch } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

//import UserList from './UserList.vue';


const popupVisible = ref(false);
const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);




//////////////////// USERS ////////////////////

const selectedOrderByUserList = ref("last_tstamp");
const selectedStatusUserList = ref(1);
const selectedSortTypeUserList = ref("DESC")
const filterUserList = ref('');


const users = ref([]);
const page_size = ref(10);
const totalPagesUsers = ref(0);
const totalUsers = ref();
const currUserData = ref({});


const toogleSortType = () => {
    selectedSortTypeUserList.value = selectedSortTypeUserList.value === "ASC" ? "DESC" : "ASC";
}
watch(selectedSortTypeUserList, (newSortType) => {
    //console.log(`��� Sorting berubah: ${newSortType}`);
    searchUsers();
});


watch(selectedOrderByUserList, (newOrderBy) => {
    // console.log(`��� Order By berubah: ${newOrderBy}`);
    searchUsers();
});

watch(selectedStatusUserList, (newStatus) => {
    //console.log(`��� Status pengguna berubah: ${newStatus}`);
    searchUsers();
});



const lastFetchedPageUsers = ref(0);
const scrollKeyUsers = ref(0);

function resetScrollUsers() {
    scrollKeyUsers.value += 1;
}

const isFetchingUsers = ref(false); // mencegah race condition
const isFetchingUserData = ref(false);

function handleUserSelection(userId, userName) {

    console.log("Selected User:", userId, userName);
}


async function handleEditUser(userIdParam) {
    console.log("handleEditUser - user id: ", userIdParam);

    const isSuccess = await getUserData(userIdParam); // Tunggu hasil sebelum lanjut
    if (!isSuccess) {
        console.error("Failed to get user data");
        return;
    }

    console.log("getUserData SUCCESS!!");

}

async function handleDetailUser(userIdParam) {
    console.group("---handleDetailUser----")
    console.log("handleDetailUser - user id: ", userIdParam);

}


///////// INFINITE SCROLL USERS //////////
function loadUsers({ done }) {
    console.group("--- loadUsers() ---")
    if (totalPagesUsers.value === 0) {
        done("empty");
        return;
    }
    const fetchedPageNumber = lastFetchedPageUsers.value + 1;
    console.log("last page:", lastFetchedPageUsers.value);
    console.log("Fetched page number:", fetchedPageNumber);

    setTimeout(async () => {
        await getUserList(fetchedPageNumber);

        if (fetchedPageNumber < totalPagesUsers.value) {
            done("done");
        } else {
            done("empty");
        }
    }, 1000);
    console.groupEnd();
}

function appendUsers(users, additionalUsers) {
    const userMap = new Map();
    users.forEach((user) => {
        userMap.set(user.user_id, user);
    });

    additionalUsers.forEach((newUser) => {
        if (!userMap.has(newUser.user_id)) {
            users.push(newUser);
            userMap.set(newUser.user_id, newUser);
        }
    });

    return users;
}


function searchUsers() {
    totalUsers.value = 0;
    resetScrollUsers();
    lastFetchedPageUsers.value = 0;
    users.value = []; // Reset daftar pengguna sebelum pencarian baru
    getUserList(1); // Fetch data dengan parameter baru
}


async function getUserList(pageNumberParam) {
    console.log("----getUserList----")
    if (isFetchingUsers.value == true) {
        console.log("Fetching users already in progress...");
        return;
    }

    isFetchingUsers.value = true;

    try {
        const operation = "get_user_list";
        const baseUrl = BASE_API_URL;
        const params = {
            filter: filterUserList.value,
            order_by: selectedOrderByUserList.value,
            sort_type: selectedSortTypeUserList.value,
            page_number: pageNumberParam,
            page_size: page_size.value,
            st: selectedStatusUserList.value,
        };

        console.log("getUserList params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("getUserList FAILED!!:", response_be.error_message);
            let popUpMessage = "Gagal Mendapatkan Data Pengguna Aktif";


            popUpProps.value = {
                status: "error",
                errorMessage: popUpMessage,
                errorCode: response_be.error_code,
            };
            popupVisible.value = true;
            return;
        }

        const responseBE = response_be.payload;
        if (!responseBE.users) {
            console.log("User list is empty");
            return;
        }

        console.log("getUserList SUCCESS!!");
        users.value = appendUsers(users.value, responseBE.users);
        totalUsers.value = responseBE.total_data;
        totalPagesUsers.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        lastFetchedPageUsers.value = pageNumberParam;

        console.log("totalPagesUsers: ", totalPagesUsers.value);
        console.log("totalUsers: ", totalUsers.value);
    } catch (err) {
        console.error("ERROR WHILE GETTING USERS:", err);
    } finally {

        isFetchingUsers.value = false;
    }
}


async function getUserData(userIdParam) {
    console.group("---getUserData----")

    if (isFetchingUserData.value == true) {
        console.log("Fetching user data already in progress...");
        return false;
    }

    console.log("getUserData - user id: ", userIdParam);

    try {
        const operation = "get_user_data";
        const baseUrl = BASE_API_URL;
        const params = {
            user_id: userIdParam,
        };

        console.log("getUserData params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("getUserData FAILED!!:", response_be.error_message);
            let popUpMessage = "Gagal Mendapatkan Data Pengguna";


            popUpProps.value = {
                status: "error",
                errorMessage: popUpMessage,
                errorCode: response_be.error_code,
            };
            popupVisible.value = true;
            return false;
        }

        const responseBE = response_be.payload;
        if (!responseBE.user_data) {
            console.log("User data is empty");
            return false;
        }
        console.log("getUserData responseBE.user_data: ", responseBE.user_data);

        currUserData.value = responseBE.user_data;

        console.log("getUserData SUCCESS!!");
        return true;


    } catch (err) {
        console.error("getUserData FAILED!!:", response_be.error_message);
        let popUpMessage = "Gagal Mendapatkan Data Pengguna";


        popUpProps.value = {
            status: "error",
            errorMessage: popUpMessage,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;

    } finally {

        isFetchingUserData.value = false;
    }

    console.groupEnd();
}
</script>