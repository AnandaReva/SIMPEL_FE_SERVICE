<template>
    <v-container fluid class="pa-4 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">


        <v-card color="base" elevation="0" style="height: 100%; width: 100%;" class="pa-2">


            <v-col cols="12">

                <v-btn @click="backToUserManagementPage()" color="primary" elevation="2" class="ma-0">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>

                <v-card flat class="px-4 py-2 my-4">

                    <p class="text-h6 font-weight-medium text-center mb-0">TAMBAH PENGGUNA</p>
                </v-card>
            </v-col>

            <v-col cols="12" class="pa-0">

                <!-- Konten Scrollable -->
                <div>
                    <!-- Informasi Dasar Pengguna -->
                    <v-card outlined class=" px-4 py-2 my-4">
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Nama Lengkap</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-file-account</v-icon>
                                        <v-text-field maxlength="255" v-model="full_name" label="Nama Lengkap" outlined
                                            dense :rules="full_name_rules" required></v-text-field>
                                    </v-card>
                                </v-col>


                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Username</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-account</v-icon>
                                        <v-text-field maxlength="255" v-model="username" label="Nama Pengguna" outlined
                                            dense :rules="username_rules" required></v-text-field>
                                    </v-card>
                                </v-col>


                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Email</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-email</v-icon>
                                        <v-text-field maxlength="255" v-model="email" label="Email Pengguna" outlined
                                            dense :rules="emailRules" required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-lock</v-icon>
                                        <v-text-field v-model="password" label="Password" outlined dense
                                            :type="showPassword ? 'text' : 'password'"
                                            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                            @click:append="showPassword = !showPassword" :rules="password_rules"
                                            required></v-text-field>
                                    </v-card>
                                </v-col>


                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Peran</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-shield-account</v-icon>
                                        <v-select v-model="role" :items="availableRoles" label="Peran Pengguna" outlined
                                            dense :rules="role_rules" required></v-select>
                                    </v-card>
                                </v-col>






                            </v-row>
                        </v-card-text>
                    </v-card>

                    <!-- Data Pengguna -->
                    <v-card outlined class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                            <span class="text-subtitle-1 font-weight-medium">Data Pengguna</span>
                        </v-card-title>

                        <v-card-text style="max-height: 300px; overflow-y: auto;">
                            <div class="scrollable-container pa-0 border ma-0"
                                style="max-height: 300px; overflow-y: auto;">
                                <!-- Data Fields -->
                                <v-container v-for="(container, index) in dataContainers" :key="index">
                                    <v-row>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="container.title" outlined
                                                label="Judul (Lokasi, Alamat IP, Spesifikasi dll)"
                                                :error-messages="validateContainer(container, index).title"
                                                @blur="validateContainer(container, index)"></v-text-field>
                                        </v-col>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="container.data" outlined label="Isi data"
                                                :error-messages="validateContainer(container, index).data"
                                                @blur="validateContainer(container, index)"></v-text-field>
                                        </v-col>
                                        <v-col cols="1" class="d-flex align-center px-0">
                                            <v-btn @click="removeContainer(index)" color="error"
                                                style="max-height: 30px; width: 30px; min-width: 30px" size="small">
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </div>

                        </v-card-text>
                        <!-- Add New Data Button -->
                        <v-col cols="auto" class="d-flex align-center">
                            <v-btn @click="addDataContainer" color="primary"
                                class="rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px"
                                :disabled="isDisableAddContainer">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                    </v-card>
                </div>
            </v-col>


            <v-col>
                <div class="d-flex justify-center" style="max-width: 300px; width: 100%; margin: 0 auto;">
                    <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                        :disabled="isDisableSubmitBtn" @click="submitRegisterUser">
                        Daftarkan Pengguna
                    </v-btn>
                </div>
            </v-col>




        </v-card>


        <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
            :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
            :visible="popUpInfoVisible" @close="closePopUpInfo" />

        <PopUpConfirmationBox v-if="popUpConfirmVisible" class="popup-container" :title="popUpConfirmProps.title"
            :message="popUpConfirmProps.message" :status="popUpConfirmProps.status" :visible="popUpConfirmVisible"
            @confirm="handleConfirm" @cancel="handleCancel" />



    </v-container>


</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

import PopUpInfoBox from '../parts/PopUpInfoBox.vue';
import PopUpConfirmationBox from '../parts/PopUpConfirmationBox.vue';



const router = useRouter();



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



const editor_user_role = ref("");
const availableRoles = ref([]);

const roleHierarchy = {
    "system master": ["system admin", "system user"],
    "system admin": ["system user"],
    "system user": []
};

function updateAvailableRoles() {
    const role = editor_user_role.value.trim();
    availableRoles.value = roleHierarchy[role] || [];
}

// Form data
const username = ref("");
const password = ref("");
const full_name = ref("");
const email = ref("");
const role = ref("")

const showPassword = ref(false);

// Data containers
const dataContainers = ref([{ title: "", data: "" }]);

// Validation rules
const emailRegrex = ref(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i);
const usernameRegrex = ref(/^[A-Za-z0-9~!@#$%^&*()_+<>?/':=.,-]+$/);

// Rules
const username_rules = [
    (v) => !!v || "Username harus diisi",
    (v) => v.length >= 2 || "Username minimal 2 karakter",
    (v) => v.length <= 255 || "Username maksimal 255 karakter",
    (v) => usernameRegrex.value.test(v) || "Username hanya boleh mengandung huruf, angka, dan simbol '~!@#$%^&*()_+<>?/':=.,-'"

];

const password_rules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 30 || "Password maksimal 30 karakter",
];

const emailRules = [
    (v) => !!v || "Email harus diisi",
    (v) => emailRegrex.value.test(v) || "Format email tidak valid",
];
// Add more comprehensive validation for full_name
const full_name_rules = [
    (v) => !!v || "Nama lengkap harus diisi",
    (v) => v.length >= 3 || "Nama minimal 3 karakter",
    (v) => v.length <= 255 || "Nama maksimal 255 karakter"
];

// Add role validation
const role_rules = [
    (v) => !!v || "Peran harus dipilih",
    (v) => availableRoles.value.includes(v) || "Peran tidak valid"
];


/////////// USER DATA //////////

// Data container functions
const addDataContainer = () => {
    console.log("---addDataContainer---")
    dataContainers.value.push({ title: "", data: "" });
};

// Validation rules
const validateContainer = (container, index) => {
    const errors = {
        title: [],
        data: []
    };

    // Check for empty title
    if (!container.title?.trim()) {
        errors.title.push("Judul tidak boleh kosong");
    }

    // Check for empty data
    if (!container.data?.trim()) {
        errors.data.push("Data tidak boleh kosong");
    }

    // Check for duplicate titles
    if (container.title?.trim()) {
        const isDuplicate = dataContainers.value.some(
            (other, otherIndex) =>
                otherIndex !== index &&
                other.title?.trim() === container.title?.trim()
        );
        if (isDuplicate) {
            errors.title.push("Judul sudah ada");
        }
    }

    return errors;
};

// Computed property to disable add button
const isDisableAddContainer = computed(() => {
    return dataContainers.value.some((container, index) => {
        const errors = validateContainer(container, index);
        return errors.title.length > 0 || errors.data.length > 0;
    });
});

const removeContainer = (index) => {
    dataContainers.value.splice(index, 1);
};


/////////// SUBMIT ///////////

const isDisableSubmitBtn = computed(() => {
    const isUsernameValid =
        !!username.value &&
        usernameRegrex.value.test(username.value) &&
        username.value.length >= 2 &&
        username.value.length <= 255;

    const isPasswordValid =
        !!password.value &&
        password.value.length >= 8 &&
        password.value.length <= 30;

    const isFullNameValid =
        !!full_name.value &&
        full_name.value.length >= 3 &&
        full_name.value.length <= 255;

    const isEmailValid =
        !!email.value && emailRegrex.value.test(email.value);

    const isRoleValid =
        !!role.value && availableRoles.value.includes(role.value);

    const isDeviceDataValid = dataContainers.value.every(container => {
        return container.data.trim() && container.title.trim();
    });

    // Jika semua valid maka tombol bisa diaktifkan (return false untuk isDisable)
    return !(
        isUsernameValid &&
        isPasswordValid &&
        isFullNameValid &&
        isEmailValid &&
        isRoleValid &&
        isDeviceDataValid
    );
});


// Format data containers to object
const formatDataContainers = (containers) => {
    let formattedData = {};
    containers.forEach(container => {
        if (container.title && container.data) {
            formattedData[container.title] = container.data;
        }
    });
    return formattedData;
};



const pending_submit_data = ref({});



// Submit function - trigger confirmation popup
const submitRegisterUser = async () => {
    if (isDisableSubmitBtn.value) {
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Harap lengkapi semua field dengan benar",
            errorCode: "VALIDATION_ERROR"
        };
        popUpInfoVisible.value = true;
        return;
    }

    const formattedData = formatDataContainers(dataContainers.value);

    pending_submit_data.value = {
        username: username.value,
        full_name: full_name.value,
        email: email.value,
        password: password.value,
        role: role.value,
        data: formattedData
    };

    popUpConfirmProps.value = {
        title: "Konfirmasi Tambah Pengguna",
        message: "Apakah Anda yakin ingin menambahkan pengguna ini?",
        status: "info"
    };
    popUpConfirmVisible.value = true;
};

// Confirmed by user
const handleConfirm = async () => {
    popUpConfirmVisible.value = false;

    if (!pending_submit_data.value) return;

    const { username, password, full_name, email, role, data } = pending_submit_data.value;




    isLoading.value = true;

    const newUserId = await addNewUser(username, password, full_name, email, role, data);

    if (newUserId) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Sukses Mendaftarkan Pengguna Baru",
            errorCode: "",
        };

        clearForm();

    }

    pending_submit_data.value = null;
};

const handleCancel = () => {
    popUpConfirmVisible.value = false;
    pending_submit_data.value = null;
};




const addNewUser = async (
    usernameParam,
    passwordParam,
    fullNameParam,
    emailParam,
    roleParam,
    userDataParam,
) => {
    console.group("---addUser---");
    isLoading.value = true;

    const baseUrl = BASE_API_URL;
    const operation = "add_user_data";

    const params = {
        username: usernameParam,
        full_name: fullNameParam,
        email: emailParam,
        role: roleParam,
        password: passwordParam,
    };

    if (userDataParam && Object.keys(userDataParam).length > 0) {
        params.data = userDataParam;
    }

    console.log("Final params to send:", params);

    try {
        const response_be = await Process(baseUrl, operation, params);

        if (!response_be || response_be.status !== "success") {
            const errMessage = response_be?.error_message || "Gagal mendaftarkan pengguna";
            const errCode = response_be?.error_code || "UNKNOWN_ERROR";

            throw { message: errMessage, code: errCode, payload: response_be?.payload };
        }

        const newUserId = response_be.payload?.new_user_id;

        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Pengguna berhasil ditambahkan",
            errorCode: "NEW USER ADDED",
        };

        return newUserId;

    } catch (error) {
        console.error("Error registering user:", error);

        let errorMessage = error.message || "Terjadi kesalahan saat registrasi pengguna";
        let errorCode = error.code || "REGISTER_USER_ERROR";

        if (errorCode === "409001" || errorCode === 409) {
            const field = error.payload?.field;
            if (field === "username") {
                errorMessage = "Username sudah digunakan. Silakan gunakan yang lain.";
            } else if (field === "email") {
                errorMessage = "Email sudah terdaftar. Silakan gunakan email lain.";
            } else {
                errorMessage = "Data pengguna sudah terdaftar.";
            }
            errorCode = "409";
        }

        popUpInfoProps.value = {
            status: "error",
            errorMessage,
            errorCode,
        };

        return null;

    } finally {
        popUpInfoVisible.value = true;
        isLoading.value = false;
        console.groupEnd();
    }
};



///////////////////////////

const clearForm = () => {
    username.value = "";
    password.value = "";
    full_name.value = "";
    email.value = "";

    dataContainers.value = [{ title: "", data: "" }];
};



onMounted(() => {
    const curr_user_data = JSON.parse(localStorage.getItem('user_data'));
    console.log("onMounted - user_data: ", curr_user_data);

    editor_user_role.value = curr_user_data?.role?.trim();
    console.log("onMounted - editor_user_role: ", editor_user_role.value);

    if (editor_user_role.value !== "system master" && editor_user_role.value !== "system admin") {
        router.push({ name: "user-management" });
    }

    updateAvailableRoles();
});




// Navigation
const backToUserManagementPage = () => {
    router.push({ name: "user-management" });
};
</script>