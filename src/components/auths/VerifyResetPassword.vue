<template>
    <v-container fluid class="pa-2 fill-height d-flex align-center justify-center"
        :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay Loading -->


        <!-- Tombol Panah Kembali di Kiri Atas -->
        <v-btn icon class="position-absolute top-0 left-0 ma-2" @click="backToLogin()">
            <v-icon>mdi-arrow-left</v-icon>
        </v-btn>


        <!-- Form Reset Password -->
        <v-row class="justify-center" style="width: 100%;">
            <v-col cols="12" md="6" lg="4">
                <v-card color="primary" class="pa-6" elevation="2">
                    <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                        Reset Password
                    </v-card-title>
                    <v-card-subtitle class="text-center text-caption mb-4">
                        Sisa waktu {{ formattedRemainingTime }}
                    </v-card-subtitle>

                    <v-card-text>
                        <v-form @submit.prevent="submitResetPassword">
                            <v-text-field v-model="new_password" label="New Password" type="password" outlined dense
                                :error-messages="passwordError" class="mb-4" />

                            <v-text-field v-model="confirm_password" label="Confirm Password" type="password" outlined
                                dense :error-messages="confirmPasswordError" :disabled="isDisableConfirmPassword"
                                class="mb-4" />

                            <v-row justify="center">
                                <v-btn color="light" type="submit" :loading="loading"
                                    :disabled="isDisableSubmitResetPassword" class="mt-2"
                                    style="min-width: 150px; max-width: 200px;">
                                    Reset Password
                                </v-btn>
                            </v-row>


                        </v-form>
                    </v-card-text>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DecryptAES256 } from '@/libs/crypto';
import { GetEnv } from '@/utils/utils';
import { useRoute, useRouter } from 'vue-router';
import { Auth_Process } from '@/utils/requestHelper';
import { BASE_AUTH_URL } from '@/configs/config';

const route = useRoute();
const router = useRouter();

const url_signature = ref(''); // Menyimpan signature dari URL
const expiry_tstamp = ref(0); // Timestamp expire dari URL
const remainingTime = ref(0); // Waktu tersisa dalam detik
let countdownInterval = null;

const isLoading = ref(false);

// Form fields
const new_password = ref('');
const confirm_password = ref('');
const loading = ref(false);
const serverError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const popUpInfoVisible = ref(false);

const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
    if (popUpInfoProps.value.status === "success") {
        router.push('/login');
    }
};

// Computed properties
const isDisableSubmitResetPassword = computed(() => {
    const passwordValid = new_password.value.length >= 8 && new_password.value.length <= 30;
    const confirmPasswordValid = confirm_password.value.length >= 8 && confirm_password.value.length <= 255;
    const passwordsMatch = new_password.value === confirm_password.value;

    passwordError.value = passwordValid ? '' : 'Password harus 8-255 karakter';
    confirmPasswordError.value = confirmPasswordValid ? '' : 'Password harus 8-255 karakter';
    if (!passwordsMatch && confirm_password.value) confirmPasswordError.value = 'Password tidak cocok';

    return !(passwordValid && confirmPasswordValid && passwordsMatch);
});

const isDisableConfirmPassword = computed(() => {
    return new_password.value.length < 8 || new_password.value.length > 30;
});

const formattedRemainingTime = computed(() => {
    if (remainingTime.value <= 0) return "00:00";
    const minutes = Math.floor(remainingTime.value / 60);
    const seconds = remainingTime.value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// Countdown timer
const startCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        remainingTime.value = Math.max(expiry_tstamp.value - currentTime, 0);

        if (remainingTime.value === 0) {
            clearInterval(countdownInterval);
            popUpInfoProps.value = {
                status: "error",
                errorMessage: "Waktu reset password telah habis. Silakan coba lagi.",
                errorCode: "410001"
            };

            popUpInfoVisible.value = true;
            setTimeout(() => router.push('/login'), 3000);
        }
    }, 1000);
};

onUnmounted(() => {
    if (countdownInterval) clearInterval(countdownInterval);
});

// Submit handler
const submitResetPassword = async () => {
    if (isDisableSubmitResetPassword.value) {
        serverError.value = "Harap perbaiki kesalahan pada password sebelum melanjutkan.";
        return;
    }

    loading.value = true;
    serverError.value = '';

    try {
        const response = await verifyResetPassword(new_password.value, url_signature.value);

        if (response.status !== "success") {
            // Handle different error codes
            let errorMessage = response.error_message;

            switch (response.error_code) {
                case '401':
                    errorMessage = "Username atau password salah";
                    break;
                case '500':
                    errorMessage = "Terjadi kesalahan pada server";
                    break;
                case '999999':
                    errorMessage = "Terjadi kesalahan yang tidak diketahui";
                    break;
                // Add more cases as needed
                default:
                    errorMessage = errorMessage || "Terjadi kesalahan";
            }

            popUpInfoProps.value = {
                status: "error",
                errorMessage: errorMessage,
                errorCode: response.error_code || "999999"
            };
            popUpInfoVisible.value = true;
            return;
        }

        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Reset password berhasil. Silakan login dengan password baru.",
            errorCode: "000000"
        };
        popUpInfoVisible.value = true;
        setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
        console.error("[ResetPassword] ERROR:", error);
        popUpInfoProps.value = {
            status: "error",
            errorMessage: error.message || "Terjadi kesalahan saat mereset password",
            errorCode: "999999"
        };
        popUpInfoVisible.value = true;
    } finally {
        loading.value = false;
    }
};

// API call
const verifyResetPassword = async (newPassword, fullSignature) => {
    const baseUrl = BASE_AUTH_URL;
    const operation = "reset-password/verify-url";

    // Extract just the signature part (without nonce)
    const signatureWithoutNonce = fullSignature.slice(0, -8); // Remove last 8 chars (nonce)

    const params = {
        new_password: newPassword,
        url_signature: signatureWithoutNonce // Send only the signature part
    };

    console.log("[verifyResetPassword] Request:", params);
    const response = await Auth_Process(baseUrl, operation, params);
    console.log("[verifyResetPassword] Response:", response);

    return response;
};

function parseFinalSignature(finalSignature) {
    const nonceLength = 8;
    if (!finalSignature || finalSignature.length <= nonceLength) {
        throw new Error("Signature terlalu pendek");
    }

    // Pisahkan nonce (8 karakter terakhir)
    const nonce = finalSignature.slice(-nonceLength);
    const cipherAndIv = finalSignature.slice(0, -nonceLength);

    // Pisahkan cipher text dan IV (dipisahkan oleh titik)
    const parts = cipherAndIv.split(".");
    if (parts.length !== 2) {
        throw new Error("Format signature tidak valid, harus ada satu titik pemisah");
    }
    const cipherTextHex = parts[0];
    const ivHex = parts[1];

    return { cipherTextHex, ivHex, nonce };
}

onMounted(() => {
    const fullSignature = route.params.signature;
    if (!fullSignature) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Link reset password tidak valid",
            errorCode: "400002"
        };
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    url_signature.value = fullSignature;

    let cipherTextHex, ivHex, nonce;
    try {
        ({ cipherTextHex, ivHex, nonce } = parseFinalSignature(fullSignature));
    } catch (err) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: err.message,
            errorCode: "400003"
        };
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    // Key harus sama dengan yang digunakan di backend (APPKEY)
    const keyHex = GetEnv('VITE_KEY', '', true);  // harus ada, throw error kalau kosong


    const [decrypted, decryptError] = DecryptAES256(cipherTextHex, ivHex, keyHex);
    if (decryptError) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "error mendekripsi link: " + decryptError,
            errorCode: "400004"
        };
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    // Format pesan hasil dekripsi: "expiry_timestamp|email"
    const parts = decrypted.split('|');
    if (parts.length !== 2) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Format data link tidak valid",
            errorCode: "400005"
        };
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    expiry_tstamp.value = parseInt(parts[0], 10);
    if (isNaN(expiry_tstamp.value)) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "Expiry timestamp tidak valid",
            errorCode: "400006"
        };
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    remainingTime.value = Math.max(expiry_tstamp.value - now, 0);
    console.log("🔹 Remaining time:", remainingTime.value, "seconds");

    if (remainingTime.value <= 0) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "error",
            errorMessage: "URL reset password telah kadaluarsa",
            errorCode: "410001"
        };
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    startCountdown();
});


function backToLogin() {
    router.push(
        { name: 'login' }
    )
}
</script>
