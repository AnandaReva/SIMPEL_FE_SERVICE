<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Drawer untuk tampilan mobile -->
        <v-navigation-drawer v-model="drawer" temporary location="left" width="400" class="elevation-0"
            :style="drawerStyle">
            <v-card color="base" elevation="2" class="ma-4" style="width: 380px; height: fi">
                <v-card-title class="d-flex justify-space-between align-center">
                    <span class="text-h6">Daftar Pengguna</span>
                    <v-btn icon @click.stop="drawer = false" color="info">
                        <v-icon>mdi-arrow-collapse-left</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text>
                    <!-- Konten daftar Pengguna -->
                    <div class="d-flex flex-wrap mb-0 ">
                        <v-select v-model="selectedOrderByUserList" :items="[
                            { title: 'Waktu terakhir', value: 'last_tstamp' },
                            { title: 'Waktu Pengguna didaftarkan', value: 'create_tstamp' },
                            { title: 'Nama Pengguna', value: 'name' }
                        ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />

                        <v-select v-model="selectedStatusUserList" :items="[
                            { title: 'Semua', value: null },
                            { title: 'Aktif', value: 1 },
                            { title: 'Tidak Aktif', value: 0 }
                        ]" density="compact" label="Status" variant="outlined" style="height: 50px;" />

                        <v-btn @click="toogleSortType" icon>
                            <v-icon>
                                {{ selectedSortTypeUserList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                            </v-icon>
                        </v-btn>
                    </div>

                    <div class="d-flex align-center mb-4">
                        <v-text-field v-model="filterUserList" label="Search" placeholder="Masukkan Nama Pengguna"
                            variant="solo" clearable class="px-1" style="max-height: 50px;" maxlength="50"
                            :rules="[v => !v || v.length <= 30 || 'Maksimal 255 karakter']"
                            @input="filterUserList = filterUserList.slice(0, 255)" />
                        <v-btn icon color="primary" class="ml-2" @click="searchUsers">
                            <v-icon>mdi-magnify</v-icon>
                        </v-btn>
                    </div>


                    {{ curr_user }}

                    <div>
                        <v-infinite-scroll :key="scrollKeyUsers" id="UserLostBox" ref="UserLostBox" height="550"
                            side="end" @load="loadUsers" class="overflow-auto">
                            <UserListInfiniteScroll :users="users" :total_users="total_users" :curr_user="curr_user"
                                @select-user="selectUser" />
                        </v-infinite-scroll>
                    </div>
                </v-card-text>
            </v-card>
        </v-navigation-drawer>

        <v-row>
            <!-- Daftar Pengguna - Tampilan desktop -->
            <v-col cols="12" md="4" lg="3" class="d-none d-md-flex">
                <v-card color="base" elevation="0" style="height: 100%; width: 100%;">

                    <v-card-text>
                        <!-- Konten yang sama seperti di drawer -->
                        <div class="d-flex flex-wrap mb-0">
                            <v-select v-model="selectedOrderByUserList" :items="[
                                { title: 'Waktu terakhir', value: 'last_tstamp' },
                                { title: 'Waktu Pengguna didaftarkan', value: 'create_tstamp' },
                                { title: 'Nama Pengguna', value: 'name' }
                            ]" density="compact" label="Pengurutan" variant="outlined" style="height: 50px;" />

                            <v-select v-model="selectedStatusUserList" :items="[
                                { title: 'Semua', value: null },
                                { title: 'Aktif', value: 1 },
                                { title: 'Tidak Aktif', value: 0 }
                            ]" density="compact" label="Status" variant="outlined" style="height: 50px;" />

                            <v-btn @click="toogleSortType" icon>
                                <v-icon>
                                    {{ selectedSortTypeUserList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                                </v-icon>
                            </v-btn>
                        </div>

                        <div class="d-flex align-center mb-4">
                            <v-text-field v-model="filterUserList" label="Search" placeholder="Masukkan Nama Pengguna"
                                variant="solo" clearable class="px-1" style="max-height: 50px;" maxlength="50"
                                :rules="[v => !v || v.length <= 255 || 'Maksimal 255 karakter']"
                                @input="filterUserList = filterUserList.slice(0, 255)" />
                            <v-btn icon color="primary" class="ml-2" @click="searchUsers">
                                <v-icon>mdi-magnify</v-icon>
                            </v-btn>
                        </div>

                        <div>
                            <v-infinite-scroll :key="scrollKeyUsers" id="UserListBox" ref="UserListBox" height="550"
                                side="end" @load="loadUsers" class="overflow-auto">
                                <UserListInfiniteScroll :users="users" :total_users="total_users"  :curr_user="curr_user"
                                    @select-user="selectUser" />
                            </v-infinite-scroll>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>


            <div style="position: fixed; top: 50px; left: 10px; z-index: 100;">

                <v-btn icon @click.stop="drawer = !drawer" class="d-md-none" color="info">
                    <v-icon>mdi-arrow-right</v-icon>
                </v-btn>

            </div>



            <v-col cols="12" md="8" lg="9">
                <v-card color="base" elevation="2" rounded="xl" class="pa-4 d-flex flex-column"
                    style="min-height: calc(100vh - 32px); height: 100%;">

                    <!-- Konten utama -->
                    <v-container v-if="curr_user?.id" class="flex-grow-1">
                        <div>
                            <DetailUser :curr_user="curr_user" @select-user="selectUser" @delete-user="deleteUser"
                                @write-popUp-info-box="writePopUpInfoBox" />
                        </div>
                    </v-container>
                    <v-container v-else class="d-flex align-center justify-center flex-grow-1">
                        <v-col class="text-center" cols="auto">
                            <v-icon size="64" color="grey">mdi-account-plus</v-icon>
                            <p class="text-h6 mt-4 mb-6">Tidak ada pengguna yang dipilih</p>
                            Silahkan pilih pengguna terlebih dahulu pada panel Daftar Pengguna
                        </v-col>
                    </v-container>

                </v-card>
            </v-col>
        </v-row>


        <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
            :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
            :visible="popUpInfoVisible" @close="closePopUpInfo" />

        <PopUpConfirmationBox v-if="popUpConfirmVisible" class="popup-container" :title="popUpConfirmProps.title"
            :message="popUpConfirmProps.message" :status="popUpConfirmProps.status" :visible="popUpConfirmVisible"
            @confirm="handleConfirm" @cancel="handleConfirmCancel" />


    </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';
import Detailuser from './DetailUser.vue';

import { useRouter } from 'vue-router';
import DetailUser from './DetailUser.vue';
import UserListInfiniteScroll from '../parts/UserListInfiniteScroll.vue';

const router = useRouter();


/////// STATE MANAGEEMNT /////////

const popUpConfirmVisible = ref(false);

const popUpConfirmProps = ref({
    title: "",
    message: "",
    status: "",
});

/////

const popUpInfoVisible = ref(false);

const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
};
const popUpInfoProps = ref({
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

const curr_user = ref();



watch(
    curr_user,
    (newVal, oldVal) => {
        console.log('curr_user changed:', { oldVal, newVal })
    },
    { deep: true }
)


const user_role = ref('user_guest')


//////////////////// USERS ////////////////////


const isFetchingUserDetail = ref(false)
const isFetchingUserList = ref(false)


const selectedOrderByUserList = ref("last_tstamp"); // Default: Waktu terakhir
const selectedStatusUserList = ref(null); // Default: Semua pengguna aktif
const selectedSortTypeUserList = ref("desc") // Default: ASC
const filterUserList = ref('');


const users = ref([]);
const page_size = ref(10);
const total_pages_user_list = ref(0);

const total_users = ref();





const toogleSortType = () => {
    selectedSortTypeUserList.value = selectedSortTypeUserList.value === "asc" ? "desc" : "asc";
}


watch(
    [() => selectedSortTypeUserList.value, () => selectedOrderByUserList.value, () => selectedStatusUserList.value],
    ([newSortType, newOrderBy, newStatus]) => {
        /*  console.log(`Changes detected:
       Sort Type: ${newSortType}
       Order By: ${newOrderBy}
       Status: ${newStatus}`); */
        searchUsers();
    }, { deep: true }
);


const lastFetchedPageUsers = ref(0);
const scrollKeyUsers = ref(0);

function resetScrollUsers() {
    scrollKeyUsers.value += 1;
}

///////// INFINITE SCROLL USERS //////////
async function loadUsers({ done }) {
    console.group("--- loadUsers() ---")

    const fetchedPageNumber = lastFetchedPageUsers.value + 1;

    console.log("last page:", lastFetchedPageUsers.value);
    console.log("Fetched page number:", fetchedPageNumber);
    console.log("Total available pages:", total_pages_user_list.value);

    if (fetchedPageNumber > total_pages_user_list.value) {
        console.log("No more pages to fetch.");
        done("empty");
        return;
    }

    setTimeout(async () => {
        const success = await getUserList(fetchedPageNumber);

        if (!success || fetchedPageNumber >= total_pages_user_list.value) {
            done("empty");
        } else {
            done("done");
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
    total_users.value = 0;
    resetScrollUsers();
    lastFetchedPageUsers.value = 0;
    users.value = []; // Reset daftar pengguna sebelum pencarian baru
    getUserList(1); // Fetch data dengan parameter baru
}


async function getUserList(pageNumberParam) {
    console.log("----getUserList----")
    if (isFetchingUserList.value == true) {
        console.log("Fetching users already in progress...");
        return false;
    }

    isFetchingUserList.value = true;

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
            throw new Error("Gagal Mendapatkan Data Pengguna Aktif: " + response_be.error_message);
        }

        const responseBE = response_be.payload;
        if (!responseBE.users || responseBE.users.length === 0) {
            console.log("User list is empty");
            return false;
        }

        console.log("getUserList SUCCESS!!");
        users.value = appendUsers(users.value, responseBE.users);
        total_users.value = responseBE.total_data;
        total_pages_user_list.value = Math.ceil(responseBE.total_data / Number(page_size.value));
        lastFetchedPageUsers.value = pageNumberParam;

        console.log("total_pages_user_list: ", total_pages_user_list.value);
        console.log("total_users: ", total_users.value);
        return true;
    } catch (err) {
        console.error("ERROR WHILE GETTING USERS:", err);
        return false;
    } finally {
        isFetchingUserList.value = false;
    }
}

///
function selectUser(userSelected) {
    console.log("---selectUser---")

    isLoading.value = true;

    console.log("selectUser - userSelected: ", userSelected.id)

    getUserDetail(userSelected.id);

    drawer.value = false;
    isLoading.value = false;
}


////////// USER DETAIL ////////////
async function getUserDetail(userIdParam) {
    console.log("----getUserDetail----")
    if (isFetchingUserDetail.value == true) {
        console.log("Fetching user detail already in progress...");
        return false;
    }

    isFetchingUserDetail.value = true;

    try {
        const operation = "get_user_detail";
        const baseUrl = BASE_API_URL;

        const params = {
            user_id: userIdParam
        };

        console.log("getUserDetail params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("getUserDetail FAILED!!:", response_be.error_message);
            throw new Error("Gagal mendapatkan detail perangkat: " + response_be.error_message);
        }

        const responseBE = response_be.payload;

        console.log("getUserDetail SUCCESS!!");



        if (!curr_user.value || typeof curr_user.value !== 'object') {
            curr_user.value = {};
        }


        Object.assign(curr_user.value, {
            id: responseBE.user_id,
            full_name: responseBE.user_full_name,
            username: responseBE.username,
            email: responseBE.user_email,
            status: responseBE.user_status,
            role: responseBE.user_role,
            create_timestamp: responseBE.user_create_timestamp,
            last_timestamp: responseBE.user_last_timestamp,
            data: responseBE.user_data ?? {},
        });


        // Optional: log jika user_data kosong
        if (!responseBE.user_data) {
            console.log("user_data is empty (null or undefined).");
        }

        return true;

    } catch (err) {
        console.error("ERROR WHILE GETTING USER DETAIL DATA:", err);
        return false;
    } finally {
        isFetchingUserDetail.value = false;
    }
}





////////// DELETE USER ////////////
const curr_user_delete = ref(null);

function deleteUser(userIdParam) {
    if (!userIdParam) {
        console.log("deleteUser - userIdParam not Valid :", userIdParam)
        return;
    }

    curr_user_delete.value = userIdParam;

    // Set fungsi confirm dinamis
    confirmAction.value = async () => {
        const isSuccess = await deleteUserData(userIdParam);

        if (isSuccess) {
            popUpInfoProps.value = {
                status: "success",
                errorMessage: "Sukses Menghapus Pengguna",
                errorCode: "",
            };
            curr_user_delete.value = null;
            curr_user.value = { id: null, name: null };
        }
    };

    popUpConfirmProps.value = {
        title: "Konfirmasi Hapus Pengguna",
        message: "Apakah Anda yakin ingin menghapus pengguna ini?",
        status: "info",
    };

    popUpConfirmVisible.value = true;
}




const isDeletingUser = ref(false)
async function deleteUserData(userIdParam) {
    console.log("----deleteUser----")
    if (isDeletingUser.value == true) {
        console.log("delete user already in progress...");
        return false;
    }

    isDeletingUser.value = true;

    try {
        const operation = "delete_user_data";
        const baseUrl = BASE_API_URL;

        const params = {
            user_id: userIdParam
        };

        console.log("deleteUser params:", params);
        const response_be = await Process(baseUrl, operation, params);

        if (response_be.status !== "success") {
            console.error("deleteUser FAILED!!:", response_be.error_message);
            popUpInfoProps.value = {
                status: "error",
                errorMessage: "Gagal Menghapus Pengguna",
                errorCode: response_be.error_code,
            };
            popUpInfoVisible.value = true;
            return false;
        }

        console.log("deleteUser SUCCESS!!");


        return true;

    } catch (err) {
        console.error("ERROR WHILE DELETING USER DATA:", err);
        return false;
    } finally {
        isDeletingUser.value = false;
    }
}

///////////////////////////////////

function writePopUpInfoBox(statusParam, errorCodeParam, errorMessageParam) {
    popUpInfoProps.value = {
        status: statusParam,
        errorMessage: errorMessageParam,
        errorCode: errorCodeParam,
    };
    popUpInfoVisible.value = true;
}





//////////////////////////////////






const confirmAction = ref(null);


const handleConfirm = async () => {
    popUpConfirmVisible.value = false;
    isLoading.value = true;

    try {
        if (confirmAction.value) {
            await confirmAction.value();
        }
    } catch (error) {
        console.error("Error during confirm action:", error);
        popUpInfoProps.value = {
            status: "error",
            errorMessage: error.message || "Terjadi kesalahan",
            errorCode: error.code || "UNKNOWN_ERROR",
        };
    } finally {
        popUpInfoVisible.value = true;
        isLoading.value = false;
    }
};

const handleConfirmCancel = () => {
    curr_user_delete.value = null;
    confirmAction.value = null;
    popUpConfirmVisible.value = false;
};

onMounted(() => {
    // get user role
    const user_data = JSON.parse(localStorage.getItem('user_data'));
    user_role.value = user_data?.role;
    //console.log('user_role', user_role.value);

    searchUsers();
    const rawCurrUserData = sessionStorage.getItem("curr_user_selected")

    try {
        curr_user.value = JSON.parse(rawCurrUserData)
        console.groupCollapsed("---onMounted---")
        console.log("onMounted - curr_user.value: ", curr_user.value)

        //sessionStorage.removeItem("curr_user_selected")


        console.groupEnd()
    } catch (error) {
        console.error("Failed to parse curr_user_selected:", error)
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