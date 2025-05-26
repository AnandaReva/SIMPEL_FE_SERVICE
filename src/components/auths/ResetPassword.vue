<template>
    <v-container fluid class="pa-2 fill-height" :class="{ 'disable-interactions': isLoading }">
        <v-row class="fill-height" align="center" justify="center">
            <v-col cols="12" md="6">
                <v-card color="base" class="pa-6" elevation="2">
                    <!-- Form Reset Password -->
                    <template v-if="!isEmailResetPasswordSend">
                        <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                            Reset Password
                        </v-card-title>
                        <v-card-subtitle class="text-center text-body-1 mb-6">
                            Masukkan Email Akun Anda
                        </v-card-subtitle>

                        <v-form ref="loginForm" @submit.prevent="submitResetPassword">
                            <v-text-field v-model="email" label="Email" outlined dense prepend-inner-icon="mdi-email"
                                class="mb-4" :rules="emailRules" required />
                            <v-row justify="center">
                                <v-btn type="submit" color="primary" class="mt-2" size="large" elevation="0"
                                    :disabled="isDisableConfirm" style="min-width: 150px; max-width: 200px;">
                                    Konfirmasi
                                </v-btn>
                            </v-row>
                        </v-form>
                    </template>

                    <!-- Konfirmasi Email -->
                    <template v-else>
                        <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                            Email Reset Password Telah Dikirim ke
                        </v-card-title>
                        <v-card-subtitle class="text-center text-body-1 mb-4">
                            {{ email }}
                        </v-card-subtitle>
                        <v-card-text class="text-center text-body-2">
                            Periksa kotak masuk atau folder spam Anda.
                        </v-card-text>
                    </template>
                </v-card>
            </v-col>
        </v-row>

        <!-- PopUp Info -->
        <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
            :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
            :visible="popUpInfoVisible" @close="closePopUpInfo" />
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>
    </v-container>
</template>


<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { Auth_Process } from "@/utils/requestHelper";
import { BASE_AUTH_URL } from "@/configs/config";

const isEmailResetPasswordSend = ref(false);

const isLoading = ref(false);
watch(isLoading, (newValue) => {
    console.log("isLoading changed to:", newValue);
});


const email = ref('');
const emailRegrex = ref(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i);

const emailRules = [
    (v) => !!v || "Email harus diisi",
    (v) => emailRegrex.value.test(v) || "Format email tidak valid",
];

const isDisableConfirm = computed(() => {
    ;

    return (
        !email.value ||
        !emailRegrex.value.test(email.value)
    );
});


const popUpInfoVisible = ref(false);

const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
};
const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});


const submitResetPassword = async () => {
    console.log("🔹 Reset password with:", email.value);
    isLoading.value = true;
    try {
        const success = await ResetPasswordRequest(email.value);
        if (success) {
            isEmailResetPasswordSend.value = true;
        }
    } catch (error) {
        console.error("Error on submitResetPassword:", error);
    } finally {
        isLoading.value = false;
    }
};

async function ResetPasswordRequest(emailParam) {
    const baseUrl = BASE_AUTH_URL;
    const operation = "reset-password";
    const params = { email: emailParam };

    try {
        const response_be = await Auth_Process(baseUrl, operation, params);

        console.log("🔄 Response from backend:", response_be);

        if (response_be.status !== "success") {
            let popUpMessage = "";
            if (response_be.error_code === "429") {
                const remainingTime = response_be.payload.remaining_time;
                popUpMessage = `Terlalu banyak percobaan, coba lagi dalam ${remainingTime} detik`;
            } else if (response_be.error_code === "401") {
                popUpMessage = "Email tidak terdaftar";
            } else if (response_be.error_code === "500") {
                popUpMessage = "Terjadi kesalahan pada server";
            } else {
                popUpMessage = response_be.error_message || "Permintaan reset password gagal";
            }

            popUpInfoProps.value = {
                status: response_be.status,
                errorMessage: popUpMessage || response_be.error_message,
                errorCode: response_be.error_code,
            };
            popUpInfoVisible.value = true;
            return false;
        }

        console.log("RESET PASSWORD REQUEST SUCCESS!!");
        return true;
    } catch (err) {
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Terjadi kesalahan saat menghubungi server.",
            errorCode: "500",
        };
        popUpInfoVisible.value = true;
        return false;
    }
}


onMounted(() => {
    if (sessionStorage.length === 0) {
        console.log('Session storage is clear');
    } else {
        console.log('Session storage is not clear');
    }
});

</script>



<style scoped></style>
