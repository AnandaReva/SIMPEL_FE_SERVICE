<template>
    <v-row class="fill-height" :class="{ 'disable-interactions': isLoading }">
        <v-progress-circular v-if="isLoading" color="primary" indeterminate
            class="loading-spinner"></v-progress-circular>


        <v-col class="px-0">
            <v-btn @click="backToContactList" color="secondary" prepend-icon="mdi-arrow-left">
                Kembali
            </v-btn>
        </v-col>

        <v-col cols="12" md="6">

            Tambah Perangkat Baru

            <v-form ref="registerDeviceForm" @submit.prevent="submitRegisterDevice"
                class="d-flex flex-column align-center">
                <v-text-field maxlength="51" v-model="device_name" label="Device Name" outlined dense
                    prepend-inner-icon="mdi-account" class="mb-4" :rules="deviceNameRules" required></v-text-field>

                <v-text-field v-model="password" label="Password" outlined dense prepend-inner-icon="mdi-lock"
                    class="mb-4" :rules="passwordRules" required></v-text-field>

                <v-btn type="submit" color="#F3E5F5" block class="mt-2" size="large" elevation="0"
                    :disabled="isDisableRegisterDevice">
                    Tambah Perangkat
                </v-btn>
            </v-form>
        </v-col>

        <PopUpBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
            :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
            @close="closePopup" />
    </v-row>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { BASE_API_URL } from "@/configs/config";
import { Process } from "@/utils/requestHelper";

// State untuk popup
const popupVisible = ref(false);
const closePopup = () => {
    popupVisible.value = false;
};

const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});

// State form
const isLoading = ref(false);
const device_name = ref("");
const password = ref("");

// Rules validasi
const deviceNameRules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 6 || "Nama perangkat minimal 6 karakter",
    (v) => v.length <= 50 || "Nama perangkat maksimal 50 karakter",
];

const passwordRules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 30 || "Password maksimal 30 karakter",
];

// Validasi tombol submit
const isDisableRegisterDevice = computed(() => {
    return (
        !device_name.value ||
        device_name.value.length < 6 ||
        device_name.value.length > 30 ||
        !password.value ||
        password.value.length < 8 ||
        password.value.length > 30
    );
});

// Fungsi submit
const submitRegisterDevice = async () => {
    console.log(
        "🔹 Registering new Device with device name",
        device_name.value,
        "password",
        password.value
    );

    isLoading.value = true;
    const success = await registerDevice(device_name.value, password.value);
    isLoading.value = false;

    if (success) {
        device_name.value = "";
        password.value = "";
    }
};

// Fungsi register device
const registerDevice = async (deviceNameParam, passwordParam) => {
    const baseUrl = BASE_API_URL;
    const operation = "register_device";
    const params = {
        name: deviceNameParam,
        password: passwordParam,
    };

    console.log("Register device params:", params);
    const response_be = await Process(baseUrl, operation, params);

    if (response_be.status !== "success") {
        console.error("REGISTER DEVICE FAILED!!:", response_be.error_message);
        popUpProps.value = {
            status: "error",
            errorMessage: response_be.error_message,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;
        return false;
    }

    console.log("REGISTER DEVICE SUCCESS!!");
    return true;
};

const emit = defineEmits(["toogle-add-device-state"]);


function backToContactList() {
    console.log("backToContactList");
    resetForm()
    emit("toogle-add-device-state");
}


</script>
