<template>
    <v-container>
        <v-row>

            <v-progress-circular v-if="isLoading" color="primary" indeterminate
                class="loading-spinner"></v-progress-circular>

            <v-col cols="12" md="6" offset-md="3">
                <v-card class="form-card">
                    <v-card-title class="text-h5">Reset Password</v-card-title>
                    <v-card-subtitle class="text-caption">
                        Sisa waktu {{ formattedRemainingTime }}
                    </v-card-subtitle>
                    <v-card-text>
                        <v-form @submit.prevent="submitResetPassword">
                            <v-text-field v-model="new_password" label="New Password" type="password" outlined dense
                                :error-messages="passwordError"></v-text-field>
                            <v-text-field v-model="confirm_password" label="Confirm Password" type="password" outlined
                                dense :error-messages="confirmPasswordError"
                                :disabled="isDisableConfirmPassword"></v-text-field>


                            <br>
                            <v-btn color="primary" type="submit" :loading="loading"
                                :disabled="isDisableSubmitResetPassword">Reset Password</v-btn>
                            <p v-if="serverError" class="error-text">{{ serverError }}</p>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>

            <PopUpBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
                :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
                @close="closePopup" />
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Auth_Process } from '@/utils/requestHelper';
import { BASE_AUTH_URL } from '@/configs/config';

const route = useRoute();
const router = useRouter();

const url_signature = ref(''); // Menyimpan signature dari URL
const expiry_tstamp = ref(0); // Timestamp expire dari URL
const remainingTime = ref(0); // Waktu tersisa dalam detik
let countdownInterval = null;

// Form fields
const new_password = ref('');
const confirm_password = ref('');
const loading = ref(false);
const serverError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

// Popup handling
const popupVisible = ref(false);
const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});

const closePopup = () => {
    popupVisible.value = false;
};

// Computed properties
const isDisableSubmitResetPassword = computed(() => {
    const passwordValid = new_password.value.length >= 8 && new_password.value.length <= 30;
    const confirmPasswordValid = confirm_password.value.length >= 8 && confirm_password.value.length <= 30;
    const passwordsMatch = new_password.value === confirm_password.value;

    passwordError.value = passwordValid ? '' : 'Password harus 8-30 karakter';
    confirmPasswordError.value = confirmPasswordValid ? '' : 'Password harus 8-30 karakter';
    if (!passwordsMatch) confirmPasswordError.value = 'Passwords do not match';

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
    countdownInterval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        remainingTime.value = Math.max(expiry_tstamp.value - currentTime, 0);

        if (remainingTime.value === 0) {
            clearInterval(countdownInterval);
            popUpProps.value = {
                status: "Gagal",
                errorMessage: "Waktu reset password telah habis. Silakan coba lagi.",
                errorCode: "410001"
            };
            popupVisible.value = true;
            setTimeout(() => router.push('/login'), 3000);
        }
    }, 1000);
};

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

        if (response.error_code !== "000000") {
            throw new Error(response.error_message || "Gagal mereset password");
        }

        popUpProps.value = {
            status: "Sukses",
            errorMessage: "Password berhasil direset!",
            errorCode: ""
        };
        popupVisible.value = true;
        setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
        console.error("[ResetPassword] ERROR:", error);
        serverError.value = error.message || "Gagal mereset password. Coba lagi.";
    } finally {
        loading.value = false;
    }
};

// API call
const verifyResetPassword = async (newPassword, signature) => {
    const baseUrl = BASE_AUTH_URL;
    const operation = "reset-password-verify-url";

    const params = {
        new_password: newPassword,
        url_signature: signature
    };

    console.log("[verifyResetPassword] Request:", params);
    const response = await Auth_Process(baseUrl, operation, params);
    console.log("[verifyResetPassword] Response:", response);

    return response;
};

// Initialize component
onMounted(() => {
    // Dapatkan signature dari route params
    const fullSignature = route.params.signature;

    if (!fullSignature) {
        console.error("[ResetPassword] ERROR: Signature tidak ditemukan");
        popUpProps.value = {
            status: "Gagal",
            errorMessage: "Link reset password tidak valid",
            errorCode: "400002"
        };
        popupVisible.value = true;
        setTimeout(() => router.push('/login'), 3000);
        return;
    }

    // Simpan signature
    url_signature.value = fullSignature;

    // Untuk demo, kita set expiry time 15 menit dari sekarang
    // Di production, ini harus diambil dari decrypt signature
    expiry_tstamp.value = Math.floor(Date.now() / 1000) + (15 * 60);
    remainingTime.value = expiry_tstamp.value - Math.floor(Date.now() / 1000);

    startCountdown();
});

onUnmounted(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});
</script>
<style scoped>
.error-text {
    color: red;
    font-size: 14px;
    margin-top: 8px;
}


.form-card {
    background: linear-gradient(45deg, #1867c0 0%, #5cbbf6 100%);
    /* Ungu tua dengan transparansi */
    border-radius: 12px;
    /* Membuat sudut lebih halus */
    color: white;
    /* Warna teks putih */
}

/* Styling for the loading spinner */
.loading-spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    /* Pastikan di atas elemen lain */
}


/* Disable interactions when isLoading is true */
.disable-interactions * {
    pointer-events: none;
}


/* Optional: Add an overlay to make it clear that the screen is in loading state */
.disable-interactions {
    position: relative;
}

.disable-interactions::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    /* Semi-transparent overlay */
    z-index: 5;
    /* Ensure it overlays on top of the content */
}


/* Pastikan PopUpBox tetap bisa diinteraksi */
.popup-container {
    position: fixed;
    /* Tetap di atas layar */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1100;
    /* Lebih tinggi dari overlay */
    pointer-events: auto;
    /* Aktifkan interaksi */
}
</style>
