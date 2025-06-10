<template>
  <v-row class="fill-height ma-0" :class="{ 'disable-interactions': isLoading }">

    <v-col cols="12" md="6" class="d-flex pa-0 ma-0">
      <v-card border color="primary" rounded="0" class="d-flex align-center justify-center fill-height fill-width  "
        flat>
        <div class="text-center pa-10">
          <h1 class="text-h3 font-weight-bold mb-4">SIMPEL</h1>
          <p class="text-h6">Sistem Monitoring Penggunaan Listrik</p>
          <p class="text-body-1 mt-4">
            Pantau dan kelola konsumsi listrik dengan mudah melalui platform
            terintegrasi berbasis Internet of Things.
          </p>
        </div>
      </v-card>
    </v-col>

    <v-col cols="12" md="6" class="d-flex align-center justify-center pa-0 ma-0">
      <v-card color="primary" class="pa-8 ma-0" elevation="0" width="400">
        <v-card-title class="text-center text-h5 font-weight-bold mb-2">
          Selamat Datang
        </v-card-title>

        <div v-if="isLoginForm">
          <v-card-subtitle class="text-center text-body-1 mb-6">
            Masuk untuk melanjutkan
          </v-card-subtitle>

          <v-form ref="loginForm" @submit.prevent="submitLogin">
            <v-text-field maxlength="51" v-model="user_data" label="username atau email" outlined dense
              prepend-inner-icon="mdi-account" class="mb-4" :rules="userDataRules" required></v-text-field>
            <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Password" outlined dense
              prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="togglePasswordVisibility" class="mb-4" :rules="passwordRules"
              required></v-text-field>
            <v-btn type="submit" color="#F3E5F5" block class="mt-2" size="large" elevation="0"
              :disabled="isDisabledLogin">Masuk</v-btn>
          </v-form>
        </div>

        <div v-else>
          <v-card-subtitle class="text-center text-body-1 mb-6">
            Registrasi untuk bergabung
          </v-card-subtitle>

          <v-form ref="registerForm" @submit.prevent="submitRegister">
            <v-text-field maxlength="51" v-model="username" label="Username" outlined dense
              prepend-inner-icon="mdi-account" class="mb-4" :rules="usernameRules" required></v-text-field>
            <v-text-field maxlength="51" v-model="full_name" label="Nama lengkap" outlined dense
              prepend-inner-icon="mdi-account" class="mb-4" :rules="fullNameRules" required></v-text-field>
            <v-text-field maxlength="51" v-model="password" :type="showPassword ? 'text' : 'password'" label="Password"
              outlined dense prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="togglePasswordVisibility" class="mb-4" :rules="passwordRules"
              required></v-text-field>
            <v-text-field v-model="email" label="Email" outlined dense prepend-inner-icon="mdi-email" class="mb-4"
              :rules="emailRules" required></v-text-field>
            <v-btn type="submit" color="#F3E5F5" block class="mt-2" size="large" elevation="0"
              :disabled="isDisabledRegister">Register</v-btn>
          </v-form>
        </div>

        <v-card-actions class="justify-end pa-0 mt-4">
          <v-btn text color="light" @click="changeForm" class="text-caption py-1 px-1"
            style="min-width: auto; height: 50px">
            <i>{{
              isLoginForm
                ? "Belum punya akun? Daftar"
                : "Sudah punya akun? Login"
            }}</i>
          </v-btn>
        </v-card-actions>

        <v-card-actions class="justify-center pa-0">
          <v-btn @click="toResetPassword" type="button" block class="mt-2 text-caption" size="small" elevation="0"
            style="background-color: #F3E5F5; color: black;">
            Lupa Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>

    <PopUpInfoBox v-if="popUpInfoBox" :status="popUpInfoProps.status" :errorMessage="popUpInfoProps.errorMessage"
      :errorCode="popUpInfoProps.errorCode" :visible="popUpInfoBox" @close="closePopUpInfo" />

    <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>
  </v-row>
</template>

<script setup>
import PopUpInfoBox from "@/components/parts/PopUpInfoBox.vue";

import { useRouter } from "vue-router";
const router = useRouter();

import { ref, computed, watch } from "vue";
import { Auth_Process } from "@/utils/requestHelper";
import { BASE_AUTH_URL, PBKDF2IterationTIme } from "@/configs/config";


import { RandomStringGenerator } from "@/utils/utils";
import { GeneratePBKDF2, GenerateHMAC } from "@/libs/crypto";

const isLoginForm = ref(true); // default show login

function changeForm() {
  //console.log("isLoginForm: ", isLoginForm);
  // change form accordingly
  isLoginForm.value == true
    ? (isLoginForm.value = false)
    : (isLoginForm.value = true);
}

const username = ref("");
const password = ref("");

// register input var

const full_name = ref("");
const email = ref("");

// login input var
const user_data = ref("");
const saltedPassword = ref("");
const half_nonce = ref("");
const full_nonce = ref("");
const salt = ref("");
const token = ref("");

const showPassword = ref(false);

const popUpInfoBox = ref(false);

const closePopUpInfo = () => {
  popUpInfoBox.value = false;
};

const popUpInfoProps = ref({
  status: "",
  errorMessage: "",
  errorCode: "",
});


const isLoading = ref(false);

watch(isLoading, (newValue) => {
  console.log("isLoading changed to:", newValue);
});


const emailRegrex = ref(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i);
const usernameRegrex = ref(/^[A-Za-z0-9~!@#$%^&*()_+<>?/':=.,-]+$/);

// Rules

const userDataRules = [
  (v) => !!v || "Username atau email harus diisi",
];
const usernameRules = [
  (v) => !!v || "Username harus diisi",
  (v) => v.length >= 6 || "Username minimal 6 karakter",
  (v) => v.length <= 30 || "Username maksimal 50 karakter",
  (v) => usernameRegrex.value.test(v) || "Username hanya boleh mengandung huruf, angka, dan simbol '~!@#$%^&*()_+<>?/':=.,-'"

];

const passwordRules = [
  (v) => !!v || "Password harus diisi",
  (v) => v.length >= 8 || "Password minimal 8 karakter",
  (v) => v.length <= 30 || "Password maksimal 30 karakter",
];

const emailRules = [
  (v) => !!v || "Email harus diisi",
  (v) => emailRegrex.value.test(v) || "Format email tidak valid",
];

const fullNameRules = [
  (v) => !!v || "Nama lengkap harus diisi",
  (v) => v.length >= 3 || "Nama lengkap minimal 3 karakter",
  (v) => v.length <= 50 || "Nama lengkap maksimal 50 karakter",

];

//////////////// LOGIN ////////////////

// Computed untuk menonaktifkan tombol submit_login jika username atau password kosong
const isDisabledLogin = computed(
  () =>
    !user_data.value ||
    !password.value ||
    password.value.length < 8 ||
    password.value.length > 30
);

// Fungsi untuk toggle visibilitas password
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const submitLogin = async () => {
  // console.log("isLoading:", isLoading.value);
  console.log("🔹 Logging in with:", user_data.value, password.value);

  // Generate half_nonce
  half_nonce.value = RandomStringGenerator(8);
  console.log("half_nonce:", half_nonce.value);

  try {
    isLoading.value = true;

    const isLoginSuccess = await login(
      user_data.value,
      password.value,
      half_nonce.value
    );

    if (isLoginSuccess) {
      token.value = await calculateToken(full_nonce.value, salt.value);

      if (token.value) {
        await verifyToken();
      }
    }
  } catch (error) {
    console.error("Login Auth_Process failed:", error);
  }

  // Pastikan semua proses selesai dulu, baru setTimeout berjalan
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
};


// const submitLogin = async () => {
//   isLoading.value = true;
//   console.log("isLoading should be true:", isLoading.value);
//   await new Promise(resolve => setTimeout(resolve, 1000)); // Test delay
//   isLoading.value = false;
//   console.log("isLoading should be false:", isLoading.value);
// };



const login = async (userDataParam, passwordParam, halfNonceParam) => {
  const baseUrl = BASE_AUTH_URL;
  const operation = "login";
  const params = {
    user_data: userDataParam,
    password: passwordParam,
    half_nonce: halfNonceParam,
  };

  console.log("login params:", params);
  const response_be = await Auth_Process(baseUrl, operation, params);

  //  console.log("login response_be:", response_be);

  if (response_be.status != "success") {
    console.error("LOGIN FAILED!!:", response_be.error_message);

    let errorMessage = response_be.error_message;

    switch (response_be.error_code) {
      case 401:
        errorMessage = "Username atau password salah";
        break;
      case 500:
        errorMessage = "Terjadi kesalahan pada server";
        break;
      case 503:
        errorMessage = "Periksa Koneksi Internet";
        break;

      default:
        errorMessage = "Terjadi Kesalahan"
        break;
    }

    popUpInfoProps.value = {
      status: "error",
      errorMessage: errorMessage,
      errorCode: response_be.error_code,
    };
    popUpInfoBox.value = true;
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
  console.log(
    "Execute calculateToken, ",
    "password: ",
    password.value,
    "salt: ",
    saltParam
  );

  const [hashedPassword, error] = GeneratePBKDF2(
    password.value,
    saltParam,
    32,
    PBKDF2IterationTIme
  );

  if (error) {
    console.error("Error generating Argon2 hash:", error);
    return "";
  }

  saltedPassword.value = hashedPassword;
  console.log("Salted password:", saltedPassword.value);

  // Generate HMAC
  const [tokenResult, hmacError] = GenerateHMAC(
    saltedPassword.value,
    fullNonce
  );

  if (hmacError) {
    console.error("Error generating HMAC:", hmacError);
    return "";
  }

  console.log("Token result:", tokenResult);
  return tokenResult;
};

const verifyToken = async () => {
  const baseUrl = BASE_AUTH_URL;
  const operation = "verify-token";
  const params = { token: token.value };

  console.log("verify-token params:", params);
  const response_be = await Auth_Process(baseUrl, operation, params);

  console.log("verify_token response_be:", response_be);

  if (response_be.status != "success") {
    console.error("VERIFY TOKEN FAILED!! :", response_be.error_message);
    popUpInfoProps.value = {
      status: "error",
      errorMessage: response_be.error_message,
      errorCode: response_be.error_code,
    };
    popUpInfoBox.value = true;
    return;
  }

  console.log("VERIFY TOKEN SUCCESSFUL!");
  console.log(
    `username: ${response_be.payload.username}, full_name: ${response_be.payload.full_name}, role: ${response_be.payload.role}, email : ${response_be.payload.email}`
  );
  console.log(
    `session_id: ${response_be.payload.session_id}, session_hash: ${response_be.payload.session_hash}`
  );

  const userData = {
    username: response_be.payload.username,
    full_name: response_be.payload.full_name,
    email: response_be.payload.email,
    role: response_be.payload.role,
    data: response_be.payload.data,
  };

  // Simpan data ke localStorage
  localStorage.setItem("user_data", JSON.stringify(userData));
  localStorage.setItem("session_id", response_be.payload.session_id);
  localStorage.setItem("session_hash", response_be.payload.session_hash);

  // Setelah login berhasil, alihkan ke monitoring
  router.push({ name: "monitoring" });
};











////////// ////////// REGISTER ////////////////////

const isDisabledRegister = computed(() => {
  // const emailRegex =
  //   /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
  // const usernameRegex = /^[A-Za-z0-9._]+$/;

  return (
    !username.value ||
    username.value.length < 6 ||
    username.value.length > 30 ||
    !usernameRegrex.value.test(username.value) ||
    !password.value ||
    password.value.length < 8 ||
    password.value.length > 30 ||
    !full_name.value ||
    full_name.value.length < 3 ||
    full_name.value.length > 50 ||
    !email.value ||
    !emailRegrex.value.test(email.value)
  );
});

const submitRegister = async () => {
  isLoading.value = true;

  console.log(
    "🔹 Registering new user with: ",
    "username: ",
    username.value,
    "password: ",
    password.value,
    "email: ",
    email.value,
    "full_name: ",
    full_name.value
  );

  try {
    await register(username.value, password.value, email.value, full_name.value);
  } catch (error) {
    console.error("Register Auth_Process failed:", error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  }
};

const register = async (
  usernameParam,
  passwordParam,
  emailParam,
  fullNameParam
) => {
  const baseUrl = BASE_AUTH_URL;
  const operation = "register";
  const params = {
    username: usernameParam,
    password: passwordParam,
    email: emailParam,
    full_name: fullNameParam,
  };

  console.log("register param:", params);
  const response_be = await Auth_Process(baseUrl, operation, params);

  // console.log("register response_be:", response_be);

  if (response_be.status != "success") {
    console.error("REGISTER FAILED!!:", response_be.error_message); //////////
    popUpInfoProps.value = {
      status: "error",
      errorMessage: response_be.error_message,
      errorCode: response_be.error_code,
    };
    popUpInfoBox.value = true;
    return;
  }

  console.log("REGISTER SUCCESS!!:");
  console.log("status response:" + response_be.payload.status);
  console.log("otp_expire_tstamp:", response_be.payload.otp_expire_tstamp);




  const otp_expire_tstamp = response_be.payload.otp_expire_tstamp;

  // Generate OTP session data jika tersedia dalam response

  /* exp otp_data :
  
      {
        "username": "user1",
        "email":" user1@example.com", ",
        "password": "password123",
        "full_name": "User Satu"
        }
  */

  sessionStorage.setItem("otp_data", JSON.stringify(params));
  sessionStorage.setItem("otp_expire_tstamp", otp_expire_tstamp);

  console.log("otp_data:", sessionStorage.getItem("otp_data"));
  console.log("otp_expire_tstamp:", sessionStorage.getItem("otp_expire_tstamp"));
  router.push({ name: "verify-otp" });

  return; f
};



const toResetPassword = () => {
  localStorage.clear();
  router.push({ name: "reset-password" });
};


</script>

<style scoped></style>
