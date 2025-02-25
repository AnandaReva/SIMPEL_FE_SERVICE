<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6" offset-md="3">
                <v-card>
                    <v-card-title class="text-h5">Reset Password</v-card-title>
                    <v-card-text>
                        <v-form @submit.prevent="submitResetPassword">
                            <v-text-field v-model="new_password" label="New Password" type="password" outlined dense
                                :error-messages="passwordError"></v-text-field>
                            <v-text-field v-model="confirm_password" label="Confirm Password" type="password" outlined
                                dense :error-messages="confirmPasswordError"></v-text-field>
                            <v-btn color="primary" type="submit" :loading="loading" :disabled="isDisableSubmitResetPassword">Reset Password</v-btn>
                            <p v-if="serverError" class="error-text">{{ serverError }}</p>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Auth_Process } from '@/utils/requestHelper';
import { BASE_AUTH_URL } from '@/configs/config';

const route = useRoute();
const router = useRouter();

const signature = ref('');
const new_password = ref('');
const confirm_password = ref('');
const loading = ref(false);
const serverError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');


const isDisableSubmitResetPassword = computed(() => {
    const passwordValid = new_password.value.length >= 8 && new_password.value.length <= 30;
    const confirmPasswordValid = confirm_password.value.length >= 8 && confirm_password.value.length <= 30;
    const passwordsMatch = new_password.value === confirm_password.value;

    passwordError.value = passwordValid ? '' : 'Password harus 8-30 karakter';
    confirmPasswordError.value = confirmPasswordValid ? '' : 'Password harus 8-30 karakter';
    if (!passwordsMatch) confirmPasswordError.value = 'Passwords do not match';

    return !(passwordValid && confirmPasswordValid && passwordsMatch);
});


onMounted(() => {
    signature.value = route.params.signature || '';

    console.log("[ResetPassword] Signature from query:", route.query.signature);
    console.log("[ResetPassword] Final Signature Value:", signature.value);

    if (!signature.value) {
        console.error("[ResetPassword] ERROR: Invalid or missing signature.");
        alert("Invalid or missing signature.");
        router.push('/login');
    }
});

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
</script>

<style scoped>
.error-text {
    color: red;
    font-size: 14px;
    margin-top: 8px;
}
</style>
