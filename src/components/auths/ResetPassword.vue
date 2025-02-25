<template>
    <v-row class="fill-height" :class="{ 'disable-interactions': isLoading }">
        <v-progress-circular v-if="isLoading" color="primary" indeterminate
            class="loading-spinner"></v-progress-circular>



        <v-col v-if="!isEmailResetPasswordSend" class=" d-flex align-center justify-center">
            <v-card class="form-card pa-8" elevation="0" width="400">
                <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                    Reset Password
                </v-card-title>


                <v-card-subtitle class="text-center text-body-1 mb-6">
                    Masukkan Email Akun Anda
                </v-card-subtitle>

                <v-form ref="loginForm" @submit.prevent="submitResetPassword">
                    <v-text-field v-model="email" label="Email" outlined dense prepend-inner-icon="mdi-email"
                        class="mb-4" :rules="emailRules" required></v-text-field>

                    <v-btn type="submit" color="#F3E5F5" block class="mt-2" size="large" elevation="0"
                        :disabled="isDisableConfirm">konfrimasi</v-btn>
                </v-form>
                <br />



            </v-card>



        </v-col>



        <v-col v-if="isEmailResetPasswordSend" class=" d-flex align-center justify-center">
            <v-card class="form-card pa-8" elevation="0" width="400">
                <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                    Email Reset Password Telah Dikirim ke {{ email }}
                </v-card-title>


                <v-card-subtitle class="text-center text-body-1 mb-6">
                    Periksa Inbox atau Spam Email Anda
                </v-card-subtitle>


                <br />



            </v-card>



        </v-col>




        <PopUpBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
            :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
            @close="closePopup" />

    </v-row>
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


const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const popupVisible = ref(false);
const closePopup = () => {
    popupVisible.value = false;
};


const submitResetPassword = async () => {

    console.log("🔹 Reset password with:", email.value);

    try {
        isLoading.value = true;

        const response = await ResetPasswordRequest(email.value);
        isLoading.value = false;

    } catch (error) {

        console.error("Error on submitResetPassword:", error);
    }// Pastikan semua proses selesai dulu, baru setTimeout berjalan
    setTimeout(() => {
        isLoading.value = false;
    }, 500);



}



async function ResetPasswordRequest(emailParam) {

    const baseUrl = BASE_AUTH_URL;
    const operation = "reset-password";
    const params = {
        email: emailParam
    };

    console.log("reset password params:", params);
    const response_be = await Auth_Process(baseUrl, operation, params);

    //  console.log("login response_be:", response_be);

    if (response_be.status != "success") {
        console.error("RESET PASSWORD REQUEST FAILED!!:", response_be.error_message); //////////


        let popUpMessage = "";
        let remainingTime = 0;
        if (response_be.error_code === "429") {

            remainingTime = response_be.payload.remainingTime;
            popUpMessage = "Terlalu banyak percobaan, coba lagi nanti dalam " + remainingTime + " detik";
        }

        popUpProps.value = {
            status: response_be.status,
            errorMessage: response_be.error_message,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;
        return false;
    }

    console.log("RESET PASSWORD REQUEST SUCCESS!!, waiting for email confirmation...");
    isEmailResetPasswordSend.value = true;

    return true;


}


onMounted(() => {
    if (sessionStorage.length === 0) {
        console.log('Session storage is clear');
    } else {
        console.log('Session storage is not clear');
    }
});

</script>



<style scoped>
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

</style>
