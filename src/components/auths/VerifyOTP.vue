<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">



        <!-- Tombol Panah Kembali di Kiri Atas -->
        <v-btn icon class="position-absolute top-0 left-0 ma-2" @click="backToLogin()">
            <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <v-card color="primary" class="mx-auto my-auto pa-4" max-width="600">
            <v-row justify="center">
                <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
                    <v-progress-circular indeterminate color="primary" size="64" />
                </v-overlay>
                <v-col cols="12">
                    <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                        VERIFIKASI KODE OTP
                    </v-card-title>

                    <v-card-subtitle class="text-center text-body-1 mb-2">
                        Masukkan kode OTP yang telah dikirim ke email:
                        <strong>{{ otpData.email || "N/A" }}</strong>
                    </v-card-subtitle>

                    <v-card-subtitle class="text-center text-body-1 mb-4">
                        Sisa waktu <strong>{{ remainingTime }}</strong> detik
                    </v-card-subtitle>

                    <v-alert v-if="isExpired" type="error" class="mb-4">
                        Kode OTP telah kedaluwarsa. Silakan minta kode baru.
                    </v-alert>

                    <v-form ref="otpForm" @submit.prevent="submitOtp">
                        <!-- ⬇️ Gantikan input OTP dengan v-otp-input -->
                        <v-otp-input v-model="otp" length="6" type="number" variant="outlined" autofocus
                            class="mb-4 justify-center" :disabled="isLoading || isExpired"
                            :rules="otpRules"></v-otp-input>

                        <v-btn type="submit" color="light" block class="mt-2" size="large" elevation="0"
                            :disabled="isDisabledOtp || isExpired">
                            Konfirmasi
                        </v-btn>
                    </v-form>

                    <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
                        :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
                        :visible="popUpInfoVisible" @close="closePopUpInfo" />
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Auth_Process } from "@/utils/requestHelper";
import { BASE_AUTH_URL } from "@/configs/config"
import { GenerateHMAC } from "@/libs/crypto";

const router = useRouter();
const route = useRoute();
const otp = ref("");
const otpSignature = ref("");
const otpData = ref({}); // ✅ Data dinamis dari sessionStorage
const isLoading = ref(false);

const expireTstamp = ref(0);
const remainingTime = ref(0);
let countdownInterval = null;

const popUpInfoVisible = ref(false);

const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
};
const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});


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
    console.log("🔄 otpSignature Sebelum Terkirim:", otpSignature.value);

    const baseUrl = BASE_AUTH_URL;
    const operation = "register/verify-otp";
    const params = { otp_signature: otpSignatureParam };

    try {
        const response_be = await Auth_Process(baseUrl, operation, params);

        if (!response_be || response_be.status !== "success") {
            console.error("❌ VERIFIKASI OTP GAGAL:", response_be?.error_message || "Unknown error");

            let popUpMessage =  "Kode OTP tidak valid";

            popUpInfoProps.value = {
                status: "error",
                errorMessage: popUpMessage,
                errorCode: "",
            };

            popUpInfoVisible.value = true;
            return;
        }

        // ✅ VERIFIKASI BERHASIL: tampilkan popup terlebih dahulu
        console.log("✅ VERIFIKASI OTP BERHASIL!");
        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Verifikasi OTP berhasil. Mengarahkan ke halaman login...",
            errorCode: "",
        };
        popUpInfoVisible.value = true;

        // Tunggu 2 detik, lalu redirect ke halaman login
        setTimeout(() => {
            sessionStorage.removeItem("otp_data");
            sessionStorage.removeItem("otp_expiration_time");
            router.push({ name: "login" });
        }, 2000); // Ganti 2000 menjadi waktu yang kamu inginkan (dalam milidetik)

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
function backToLogin() {
    router.push(
        { name: 'login' }
    )
}
</script>




<style></style>