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
import { ref, computed, onMounted, onUnmounted , watch} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Auth_Process } from '@/utils/requestHelper';
import { BASE_AUTH_URL } from '@/configs/config';

const route = useRoute();
const router = useRouter();

const signature = ref('');
const expiry_tstamp = ref(0);
const nonce = ref('');

const new_password = ref('');
const confirm_password = ref('');
const loading = ref(false);
const serverError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

const remainingTime = ref(0);
let countdownInterval = null;



const popupVisible = ref(false);

const closePopup = () => {
    popupVisible.value = false;
};

const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});

const isLoading = ref(false);

watch(isLoading, (newValue) => {
    console.log("isLoading changed to:", newValue);
});



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

const startCountdown = () => {
    countdownInterval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        remainingTime.value = Math.max(expiry_tstamp.value - currentTime, 0);

        if (remainingTime.value === 0) {
            clearInterval(countdownInterval);
            alert("Waktu reset password telah habis. Silakan coba lagi.");
            router.push('/login');
        }
    }, 1000);
};

const submitResetPassword = async () => {
    if (isDisableSubmitResetPassword.value) {
        serverError.value = "Harap perbaiki kesalahan pada password sebelum melanjutkan.";
        return;
    }

    loading.value = true;
    serverError.value = '';

    try {
        const response = await verifyUrl(new_password.value, signature.value);

        if (!response || response.status !== "success") {
            throw new Error(response?.error_message || "Unknown error occurred");
        }

        alert("Password berhasil direset! Anda akan dialihkan ke halaman login.");
        setTimeout(() => {
            router.push('/login');
        }, 2000);






    } catch (error) {
        console.error("[ResetPassword] ERROR:", error);
        serverError.value = error.message || "Gagal mereset password. Coba lagi.";
    } finally {
        loading.value = false;
    }
};

const verifyUrl = async (newPasswordParam, urlSignatureParam) => {
    const baseUrl = BASE_AUTH_URL;
    const operation = "reset-password/verify-url";
    const params = {
        new_password: newPasswordParam,
        url_signature: urlSignatureParam
    };

    console.log("[verifyUrl] Sending request with params:", params);
    const response_be = await Auth_Process(baseUrl, operation, params);
    console.log("[verifyUrl] Response:", response_be);

    if (response_be.status !== "success") {
        console.error("[verifyUrl] ERROR:", response_be.error_message);
        throw new Error(response_be.error_message);
    }

    return response_be;
};

////////////////////// PROCESS SIGNATURE //////////////////////

const charToNum = { "k": "0", "b": "2", "d": "4", "f": "6", "h": "8" };

function extractExpiryFromSignature(signature) {
    let expiryStart = 5; // Expiry selalu disisipkan setelah karakter ke-5
    let expiryLength = 10; // Panjang expiry yang dikodekan BE
    let extracted = "";

    for (let i = 0; i < expiryLength; i++) {
        let char = signature[expiryStart + i];

        extracted += charToNum[char] ?? char; // Dekode karakter yang ada di charToNum
    }

    if (extracted.length !== expiryLength) {
        console.error("[ResetPassword] ERROR: Failed to extract expiry.");
        return 0; // Return 0 sebagai fallback
    }

    return parseInt(extracted, 10);
}

onMounted(() => {
    signature.value = route.params.signature || '';

    if (!signature.value) {
        console.error("[ResetPassword] ERROR: Invalid or missing signature.");
        alert("Invalid or missing signature.");
        router.push('/login');
    }

    console.log("[ResetPassword] Signature from params:", signature.value);

    // Extract nonce (last 8 characters)
    nonce.value = signature.value.slice(-8);
    signature.value = signature.value.slice(0, -8);

    console.log("[ResetPassword] Signature after deleting nonce:", signature.value);

    // Validasi expire time
    expiry_tstamp.value = extractExpiryFromSignature(signature.value);
    const currentTime = Math.floor(Date.now() / 1000);
    remainingTime.value = Math.max(expiry_tstamp.value - currentTime, 0);

    if (expiry_tstamp.value < currentTime) {
        console.error("[ResetPassword] ERROR: Token expired.");

        popUpProps.value = {
            status: "Gagal",
            errorMessage: "URL Kadaluarsa",
            errorCode: "",
        };
        popupVisible.value = true;


        alert("URL Kadaluarsa");
        router.push('/login');
    } else {
        startCountdown();
    }

    console.log("[ResetPassword] Nonce:", nonce.value);
    console.log("[ResetPassword] Expiry Timestamp:", expiry_tstamp.value);
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
