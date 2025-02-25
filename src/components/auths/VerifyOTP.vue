<template>


    <v-row class="fill-height">
        <v-progress-circular v-if="isLoading" color="primary" indeterminate
            class="loading-spinner"></v-progress-circular>

        <v-card class="form-card pa-8" elevation="0" max-width="600">
            <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                VERIFIKASI KODE OTP
            </v-card-title>

            <v-card-subtitle class="text-center text-body-1 mb-6">
                Masukkan kode OTP yang telah dikirimkan ke alamat email: <strong>{{ otpData.email || "N/A" }}</strong>
            </v-card-subtitle>

            <v-card-subtitle class="text-center text-body-1 mb-6">
                Sisa waktu <strong>{{ remainingTime }}</strong> detik
            </v-card-subtitle>

            <v-alert v-if="isExpired" type="error" class="mb-4">
                Kode OTP telah kedaluwarsa. Silakan minta kode baru.
            </v-alert>

            <v-form ref="otpForm" @submit.prevent="submitOtp">
                <v-text-field maxlength="6" v-model="otp" label="OTP" outlined dense prepend-inner-icon="mdi-lock"
                    class="mb-4" :rules="otpRules" required type="number"></v-text-field>

                <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="0"
                    :disabled="isDisabledOtp || isExpired">
                    Konfirmasi
                </v-btn>
            </v-form>
        </v-card>

        <PopUpBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
            :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />

    </v-row>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Auth_Process } from "@/utils/requestHelper";
import { BASE_AUTH_URL } from "@/configs/config"
import { GenerateHMAC } from "@/libs/crypto";

const router = useRouter();
const otp = ref("");
const otpSignature = ref("");
const otpData = ref({}); // ✅ Data dinamis dari sessionStorage
const isLoading = ref(false);
const popupVisible = ref(false);

const expireTstamp = ref(0);
const remainingTime = ref(0);
let countdownInterval = null;

const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});

const closePopup = () => {
    popupVisible.value = false;
};

// ✅ Hitung apakah OTP sudah kedaluwarsa
const isExpired = computed(() => {
    return Math.floor(Date.now() / 1000) > expireTstamp.value;
});

// ✅ Cek apakah OTP valid (6 digit angka)
const isDisabledOtp = computed(() => {
    return !otp.value || otp.value.length !== 6 || isNaN(otp.value);
});

// ✅ Aturan validasi OTP
const otpRules = [
    (v) => !!v || "Kode OTP harus diisi",
    (v) => /^\d{6}$/.test(v) || "Kode OTP harus 6 angka",
];

// ✅ Menghitung OTP Signature secara otomatis dari `otpData`
const calculateOTYPSignature = async () => {
    if (Object.keys(otpData.value).length === 0) {
        console.error("Data OTP kosong!");
        return "";
    }

    // 🔹 Urutkan berdasarkan nama field (key) dari A-Z sebelum digabungkan
    let sortedMessage = Object.keys(otpData.value)
        .sort() // Urutkan key secara alfabetis
        .map(key => otpData.value[key]) // Ambil nilai berdasarkan key yang sudah diurutkan
        .join("|"); // Gabungkan nilai dengan pemisah "|"

    console.log("🔹 Pesan untuk HMAC:", sortedMessage);


    // Generate HMAC
    const [otpSignature, hmacError] = GenerateHMAC(
        sortedMessage,
        otp.value.toString()
    );

    if (hmacError) {
        console.error("Error generating HMAC:", hmacError);
        return "";
    }

    return otpSignature;


};


// 🚀 Submit OTP
const submitOtp = async () => {
    if (isExpired.value) {
        console.error("OTP sudah kedaluwarsa.");
        return;
    }

    try {
        isLoading.value = true;

        otpSignature.value = await calculateOTYPSignature();

        console.log("🔐 Hasil kalkulasi OTP Signature: ", otpSignature.value);
        if (!otpSignature.value) throw new Error("Gagal menghitung OTP Signature.");

        // ✅ Pastikan otpSignature berupa string
        await verifyOTP(otpSignature.value.toString());
    } catch (error) {
        console.error("Verifikasi OTP gagal:", error);
    } finally {
        isLoading.value = false;
    }
};



// 🚀 Verifikasi OTP ke backend
const verifyOTP = async (otpSignatureParam) => {
    console.log("🔄 otpSignature Sebelum Dikirim:", otpSignature.value);



    const baseUrl = BASE_AUTH_URL;
    const operation = "register/verify-otp";

    const params = { otp_signature: otpSignatureParam };

    console.log("📡 Request ke:", `${baseUrl}/${operation}`);
    console.log("🔄 Parameters:", params);

    try {
        const response_be = await Auth_Process(baseUrl, operation, params);

        if (!response_be || response_be.status !== "success") {
            console.error("❌ VERIFIKASI OTP GAGAL:", response_be?.error_message || "Unknown error");

            const popUpMessage = "";

            if (response_be?.status === "401") {
                popUpMessage = "Kode OTP tidak valid";
            } else {
                popUpMessage = response_be?.error_message || "Verifikasi OTP gagal";
            }
            popUpProps.value = {
                status: response_be?.status || "Gagal",
                errorMessage: popUpMessage,
                errorCode: "", // jangan tampilan error code
            };

            popupVisible.value = true;
            return;
        }

        console.log("✅ VERIFIKASI OTP BERHASIL!");
        sessionStorage.removeItem("otp_data");
        sessionStorage.removeItem("otp_expiration_time");
        router.push({ name: "login" });
    } catch (error) {
        console.error("❌ Error saat memverifikasi OTP:", error);
    }
};

// 🚀 Ambil data dari session storage saat halaman dimuat
onMounted(() => {
    otpData.value = JSON.parse(sessionStorage.getItem("otp_data") || "{}");
    expireTstamp.value = parseInt(sessionStorage.getItem("otp_expire_tstamp"), 10) || 0;

    console.log("🔹 Data OTP:", otpData.value);

    // ✅ Hitung sisa waktu OTP
    const currentTime = Math.floor(Date.now() / 1000);
    remainingTime.value = expireTstamp.value - currentTime;

    countdownInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        remainingTime.value = expireTstamp.value - now;

        if (remainingTime.value <= 0) {
            remainingTime.value = 0;
            clearInterval(countdownInterval);
            console.log("�� OTP sudah kedaluwarsa!");
            sessionStorage.clear();

            router.push({ name: "login" });
        }
    }, 1000);
});

// **Pastikan interval dihentikan saat komponen dilepas**
onUnmounted(() => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
});
</script>


<style>
/* Untuk WebKit (Chrome, Safari, Edge) */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Untuk Firefox */
input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
}
</style>