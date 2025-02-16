<template>



    <v-row class="fill-height" :class="{ 'disable-interactions': isLoading }">

        <!-- Show loading spinner when isLoading is true -->
        <v-progress-circular v-if="isLoading === true" color="primary" indeterminate
            class="loading-spinner"></v-progress-circular>

        <!-- Section Kiri -->
        <v-col cols="12" md="6" class="primary d-flex align-center justify-center pa-10">
            <div class="text-white">
                <v-img src="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-dark-atom.svg" class="mb-8"
                    max-width="120"></v-img>
                <h1 class="text-h3 font-weight-bold mb-4">SIMPEL</h1>
                <p class="text-h6">Sistem Monitoring Penggunaan Listrik</p>
                <p class="text-body-1 mt-4">
                    Pantau dan kelola konsumsi listrik dengan mudah melalui platform terintegrasi berbasis
                    Internet of Things.
                </p>
            </div>
        </v-col>

        <!-- Section Kanan (Login) -->
        <v-col cols="12" md="6" class="login-section d-flex align-center justify-center">
            <v-card class="login-card pa-8" elevation="0" width="400">
                <v-card-title class="text-center text-h5 font-weight-bold mb-2">
                    Selamat Datang
                </v-card-title>
                <v-card-subtitle class="text-center text-body-1 mb-6">
                    Masuk untuk melanjutkan
                </v-card-subtitle>

                <v-form ref="loginForm" @submit.prevent="submitLogin">
                    <v-text-field v-model="username" label="Username" outlined dense prepend-inner-icon="mdi-account"
                        class="mb-4" required></v-text-field>

                    <v-text-field v-model="password" label="Password" type="password" outlined dense
                        prepend-inner-icon="mdi-lock" class="mb-4" required></v-text-field>

                    <v-btn type="submit" color="#F3E5F5" block class="mt-2" size="large" elevation="0">
                        Masuk
                    </v-btn>
                </v-form>
            </v-card>
        </v-col>



        <!-- PopUp Box -->
        <PopUpBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
            :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />


    </v-row>

</template>

<script setup>
import PopUpBox from '@/components/parts/PopUpBox.vue';

import { useRouter } from 'vue-router';
const router = useRouter();

import { ref } from 'vue';
import { Auth_Process, getAuthUrl } from "@/utils/requestHelper";
import { RandomStringGenerator } from '@/utils/utils';
import { GeneratePBKDF2, GenerateHMAC } from '@/libs/crypto';

const username = ref('');
const password = ref('');
const saltedPassword = ref('');
const half_nonce = ref('');
const full_nonce = ref('');
const salt = ref('');
const token = ref('');


const popupVisible = ref(false);


const closePopup = () => {
    popupVisible.value = false;
};


const popUpProps = ref({
    status: '',
    errorMessage: '',
    errorCode: ''
});

const isLoading = ref(false);

const submitLogin = async () => {
    console.log("🔹 Logging in with:", username.value, password.value);

    // Generate half_nonce
    half_nonce.value = RandomStringGenerator(8);
    console.log("half_nonce:", half_nonce.value);

    try {
        isLoading.value = true;

        const isLoginSuccess = await login(username.value, password.value, half_nonce.value);
        if (isLoginSuccess) {
            token.value = await calculateToken(full_nonce.value, salt.value);
            if (token.value) {
                await verifyToken();
            }
        }
    } catch (error) {
        console.error("Login Auth_Process failed:", error);
    } finally {
        isLoading.value = false;
    }
};

const login = async (usernameParam, passwordParam, halfNonceParam) => {

    const baseUrl = getAuthUrl();
    const operation = "login";
    const params = {
        username: usernameParam,
        password: passwordParam,
        half_nonce: halfNonceParam,
    };

    console.log("login params:", params);
    const response_be = await Auth_Process(baseUrl, operation, params);


    //  console.log("login response_be:", response_be);

    if (response_be.status != "success") {
        console.error("LOGIN FAILED!!:", response_be.error_message);
        popUpProps.value = {
            status: response_be.status,
            errorMessage: response_be.error_message,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;
        return false;
    }

    console.log("LOGIN SUCCESS!!:");
    console.log("full_nonce from response:" + response_be.payload.full_nonce);
    console.log("salt from response:" + response_be.payload.salt);

    full_nonce.value = response_be.payload.full_nonce;
    salt.value = response_be.payload.salt;
    return true;
};

const calculateToken = async (fullNonce, saltParam) => {
    console.log("Execute calculateToken, ", "password: ", password.value, "salt: ", saltParam);

    const [hashedPassword, error] = GeneratePBKDF2(password.value, saltParam, 32, 5000);

    if (error) {
        console.error("Error generating Argon2 hash:", error);
        return "";
    }

    saltedPassword.value = hashedPassword;
    console.log("Salted password:", saltedPassword.value);

    // Generate HMAC
    const [tokenResult, hmacError] = GenerateHMAC(saltedPassword.value, fullNonce);

    if (hmacError) {
        console.error("Error generating HMAC:", hmacError);
        return "";
    }

    console.log("Token result:", tokenResult);
    return tokenResult;
};

const verifyToken = async () => {

    const baseUrl = getAuthUrl();
    const operation = "verify-token";
    const params = { token: token.value };

    console.log("login params:", params);
    const response_be = await Auth_Process(baseUrl, operation, params);

    console.log("verify_token response_be:", response_be);

    if (response_be.status != "success") {
        console.error("VERIFY TOKEN FAILED!! :", response_be.error_message);
        popUpProps.value = {
            status: response_be.status,
            errorMessage: response_be.error_message,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;
        return
    }

    console.log("VERIFY TOKEN SUCCESSFUL!");
    console.log(`username: ${response_be.payload.username}, full_name: ${response_be.payload.full_name}, role: ${response_be.payload.role}`);
    console.log(`session_id: ${response_be.payload.session_id}, session_hash: ${response_be.payload.session_hash}`);

    const userData = {
        username: response_be.payload.username,
        full_name: response_be.payload.full_name,
        role: response_be.payload.role,
        data: response_be.payload.data,
    };

    // Simpan data ke localStorage
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('session_id', response_be.payload.session_id);
    localStorage.setItem('session_hash', response_be.payload.session_hash);

    // Setelah login berhasil, alihkan ke dashboard
    router.push({ name: 'dashboard' });
};
</script>

<style scoped>
.primary {
    background: linear-gradient(45deg, #1867C0 0%, #5CBBF6 100%);
}

/* Warna untuk section kanan (form login) */
.login-section {
    background: white;
    /* Warna ungu lembut */
}

.login-card {
    background: linear-gradient(45deg, #1867C0 0%, #5CBBF6 100%);
    /* Ungu tua dengan transparansi */
    border-radius: 12px;
    /* Membuat sudut lebih halus */
    color: white;
    /* Warna teks putih */
}


/* Styling for the loading spinner */
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    /* Ensure it stays on top of other elements */
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
    content: '';
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
