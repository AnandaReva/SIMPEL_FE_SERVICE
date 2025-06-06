<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Loading Overlay -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

        <!-- Pengaturan -->
        <v-card color="base" elevation="2" rounded="xl" class="fill-height pa-10 w-100 custom-height-card">
            <h2 class="text-h5 font-weight-bold mb-4">Pengaturan</h2>

            <!-- Umum -->
            <v-card outlined class="mb-4">
                <v-card-text>


                    <h3 class="text-subtitle-1 font-weight-bold mb-3">Umum</h3>
                </v-card-text>

                <v-card-text>

                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="Faktor Emisi (kg CO₂/kWh)" v-model="curr_data.general.emissionFactor"
                                type="number" step="0.001" :rules="emissionFactorRules" outlined dense />
                            <v-select label="Tanggal Laporan" v-model="curr_data.general.reportDate"
                                :items="Array.from({ length: 31 }, (_, i) => i + 1)" outlined dense />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-btn v-if="hasGeneralChanges" color="primary" @click="saveField('general')" depressed
                                size="small">Simpan</v-btn>
                        </v-col>
                    </v-row>


                </v-card-text>
            </v-card>

            <!-- Akun -->
            <v-card outlined class="mb-4">

                <v-card-text>
                    <h3 class="text-subtitle-1 font-weight-bold mb-3">Akun</h3>

                </v-card-text>


                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="Nama Lengkap" v-model="curr_data.account.full_name"
                                :rules="fullNameRules" outlined dense />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field label="Username" v-model="curr_data.account.username" :rules="usernameRules"
                                outlined dense />
                        </v-col>
                        <v-col cols="12" class="text-end">
                            <v-btn v-if="showAccountSaveButton" color="primary" @click="saveField('account')"
                                size="small" depressed>
                                Simpan
                            </v-btn>


                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-text>

                    <!-- New Email Input -->
                    <v-text-field label="Email" v-model="curr_data.email.new" :rules="emailRules" outlined dense
                        prepend-inner-icon="mdi-email-edit"
                        :hint="hasValidEmailChange ? 'Email baru valid' : 'Masukkan email baru yang valid'"
                        :persistent-hint="true" />


                    <!-- Save Email Button -->
                    <v-col cols="12" class="text-end">
                        <v-btn color="primary" @click="saveField('email')" size="small" depressed
                            :disabled="!hasValidEmailChange">
                            Simpan Email
                        </v-btn>
                    </v-col>


                    <v-row class="mt-4">




                        <!-- Wrap password inputs inside a curr_data -->
                        <form @submit.prevent="changePassword" style="width: 100%">
                            <v-col cols="12" md="6">
                                <h3 class="text-subtitle-1 font-weight-reguler mb-3">Ganti Password</h3>
                                <v-text-field label="Password Lama" v-model="curr_data.password.oldPassword"
                                    type="password" :rules="passwordRules" outlined dense />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field label="Password Baru" v-model="curr_data.password.newPassword"
                                    type="password" :rules="passwordRules" outlined dense />
                            </v-col>
                            <v-col cols="12" class="text-end">
                                <v-btn :disabled="!isPasswordValid" color="primary" type="submit" depressed>
                                    Simpan Password
                                </v-btn>
                            </v-col>
                        </form>

                    </v-row>
                </v-card-text>
            </v-card>

            <!-- Sistem -->
            <v-card outlined class="mb-4">
                <v-card-text>

                    <h3 class="text-subtitle-1 font-weight-bold mb-3">Sistem</h3>
                </v-card-text>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select :items="['Terang', 'Gelap']" label="Tema" v-model="curr_data.system.theme"
                                outlined dense />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select :items="['Indonesia', 'English']" label="Bahasa"
                                v-model="curr_data.system.language" outlined dense />
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select :items="timeZones" item-title="label" item-value="value" label="Zona Waktu"
                                v-model="curr_data.system.time_zone" outlined dense />

                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <v-btn v-if="hasSystemChanges" color="primary" @click="saveField('system')" depressed
                                size="small">Simpan</v-btn>
                        </v-col>
                    </v-row>

                </v-card-text>
            </v-card>
        </v-card>


        <!-- Pop-up -->
        <PopUpInfoBox v-if="popUpInfoVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
            :errorCode="popUpProps.errorCode" :visible="popUpInfoVisible" @close="closePopup" />
    </v-container>
</template>
<script setup>
import PopUpInfoBox from './parts/PopUpInfoBox.vue'
import PopUpConfirmationBox from './parts/PopUpConfirmationBox.vue'
import VerifyResetPassword from './auths/VerifyResetPassword.vue'
import VerifyOTP from './auths/VerifyOTP.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isLoading = ref(false)
const popUpProps = ref({ status: '', errorMessage: '', errorCode: '' })
const popUpInfoVisible = ref(false)
const closePopup = () => (popUpInfoVisible.value = false)

// Grouped curr_data structure
const curr_data = reactive({
    account: {
        full_name: '',
        username: '',
    },
    email: "",
    password: {
        oldPassword: '',
        newPassword: ''
    },
    general: {
        emissionFactor: null,
        reportDate: null
    },
    system: {
        theme: '',
        language: '',
        notification: false
    }
})

// Grouped original curr_data structure
const original_data = reactive({
    account: {
        full_name: '',
        username: '',
    },
    email: "", // menyimpan email original
    general: {
        emissionFactor: null,
        reportDate: null
    },
    system: {
        theme: '',
        language: '',
        notification: false
    }
})



////////////// GENERAL ////////////////

const default_settings_value = ref({
    emissionFactor: 0.0005,
    reportDate: 1,
    language: 'Indonesia',
    theme: 'Terang',
    notification: true,
    time_zone: 'Asia/Jakarta'
})

const hasGeneralChanges = computed(() =>
    curr_data.general.emissionFactor !== original_data.general.emissionFactor ||
    curr_data.general.reportDate !== original_data.general.reportDate
)

const hasSystemChanges = computed(() =>
    curr_data.system.theme !== original_data.system.theme ||
    curr_data.system.language !== original_data.system.language ||
    curr_data.system.notification !== original_data.system.notification
)


// Rest of your script remains the same...
const emissionFactorRules = [
    (v) => v !== null && v !== undefined && v !== '' || "Faktor Emisi harus diisi",
    (v) => parseFloat(v) > 0 || "Faktor Emisi harus lebih dari 0",
];





/////////////// ACCOUNT ////////////////
const emailRegrex = ref(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i);
const usernameRegrex = ref(/^[A-Za-z0-9~!@#$%^&*()_+<>?/':=.,-]+$/);

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



const hasAccountChanges = computed(() =>
    curr_data.account.full_name !== original_data.account.full_name ||
    curr_data.account.username !== original_data.account.username
)


const isAccountValid = computed(() => {
    return fullNameRules.every(rule => rule(curr_data.account.full_name) === true) &&
        usernameRules.every(rule => rule(curr_data.account.username) === true);
});

const showAccountSaveButton = computed(() => {
    return isAccountValid.value &&
        (curr_data.account.full_name !== original_data.account.full_name ||
            curr_data.account.username !== original_data.account.username);
});



// Menjadi:
const isEmailValid = computed(() =>
    emailRules.every(rule => rule(curr_data.email) === true)
)

const hasValidEmailChange = computed(() =>
    curr_data.email.new !== '' &&
    curr_data.email.new !== original_data.email &&
    emailRegrex.value.test(curr_data.email.new)
)



const showEmailSaveButton = computed(() =>
    isEmailValid.value && curr_data.email.new !== original_data.email

);



function saveField(field) {

    isLoading.value = true
    setTimeout(() => {
        if (field === 'email') {
            router.push({ name: 'VerifyOTP', query: { email: curr_data.email.new } })
        }
        else if (field === 'general') {
            original_data.general.emissionFactor = curr_data.general.emissionFactor
            original_data.general.reportDate = curr_data.general.reportDate
        } else if (field === 'system') {
            original_data.system.theme = curr_data.system.theme
            original_data.system.language = curr_data.system.language
            original_data.system.notification = curr_data.system.notification
        } else if (field === 'account') {
            original_data.account.full_name = curr_data.account.full_name
            original_data.account.username = curr_data.account.username
            original_data.email = { newEmail: curr_data.email }
        }
        isLoading.value = false
    }, 1000)
}

function changePassword() {
    if (!curr_data.password.oldPassword || !curr_data.password.newPassword) return
    isLoading.value = true
    setTimeout(() => {
        router.push({ name: 'VerifyResetPassword', query: { from: 'settings' } })
        isLoading.value = false
    }, 1000)
}


const isPasswordValid = computed(() => {
    return passwordRules.every(rule => rule(curr_data.password.oldPassword) === true) &&
        passwordRules.every(rule => rule(curr_data.password.newPassword) === true);
});




///////////// SYSTEM ////////////////


const timeZones = [
    { label: '(UTC+09:30) Adelaide, Darwin', value: 'Australia/Darwin' },
    { label: '(UTC−09:00) Alaska', value: 'America/Anchorage' },
    { label: '(UTC+12:00) Auckland, Fiji', value: 'Pacific/Auckland' },
    { label: '(UTC−04:00) Atlantic Time (Canada)', value: 'America/Halifax' },
    { label: '(UTC−01:00) Azores', value: 'Atlantic/Azores' },
    { label: '(UTC−12:00) Baker Island', value: 'Etc/GMT+12' },
    { label: '(UTC+08:00) Beijing, Singapore, Perth', value: 'Asia/Shanghai' },
    { label: '(UTC−05:00) Eastern Time (US & Canada)', value: 'America/New_York' },
    { label: '(UTC+01:00) Berlin, Madrid, Paris', value: 'Europe/Berlin' },
    { label: '(UTC−03:00) Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
    { label: '(UTC+02:00) Helsinki, Cairo, Cape Town', value: 'Europe/Helsinki' },
    { label: '(UTC+05:30) India Standard Time', value: 'Asia/Kolkata' },
    { label: '(UTC+05:00) Islamabad, Karachi', value: 'Asia/Karachi' },
    { label: '(UTC+07:00) Jakarta, Bangkok, Hanoi', value: 'Asia/Jakarta' },
    { label: '(UTC+04:30) Kabul', value: 'Asia/Kabul' },
    { label: '(UTC+14:00) Line Islands', value: 'Pacific/Kiritimati' },
    { label: '(UTC±00:00) London, Dublin, Lisbon', value: 'Europe/London' },
    { label: '(UTC−07:00) Mountain Time (US & Canada)', value: 'America/Denver' },
    { label: '(UTC+03:00) Moscow, Nairobi, Baghdad', value: 'Europe/Moscow' },
    { label: '(UTC−11:00) Niue, Samoa', value: 'Pacific/Niue' },
    { label: '(UTC−10:00) Hawaii-Aleutian', value: 'Pacific/Honolulu' },
    { label: '(UTC−08:00) Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
    { label: '(UTC+11:00) Solomon Islands', value: 'Pacific/Guadalcanal' },
    { label: '(UTC−02:00) South Georgia', value: 'Atlantic/South_Georgia' },
    { label: '(UTC+10:00) Sydney, Guam', value: 'Australia/Sydney' },
    { label: '(UTC+03:30) Tehran', value: 'Asia/Tehran' },
    { label: '(UTC+09:00) Tokyo, Seoul', value: 'Asia/Tokyo' },
    { label: '(UTC+13:00) Tonga, Phoenix Islands', value: 'Pacific/Tongatapu' },
    { label: '(UTC+04:00) Dubai, Baku', value: 'Asia/Dubai' },
    { label: '(UTC+06:00) Dhaka, Almaty', value: 'Asia/Dhaka' },
    { label: '(UTC−06:00) Central Time (US & Canada)', value: 'America/Chicago' }
]



///////////////////////////////////
onMounted(() => {
    console.log('Settings component mounted');
    const localData = localStorage.getItem('user_data');
    if (!localData) {
        console.error('No user data found in localStorage');
        return;
    }

    const userData = JSON.parse(localData);
    console.log('User Data:', userData);

    // Account
    original_data.account.full_name = userData.full_name || '';
    original_data.account.username = userData.username || '';
    original_data.email = userData.email || '';



    curr_data.account = { ...original_data.account };

    curr_data.email = {
        new: original_data.email
    }


    // General
    const generalData = userData.data || {};
    original_data.general.emissionFactor = generalData.emissionFactor ?? default_settings_value.value.emissionFactor;
    original_data.general.reportDate = generalData.reportDate ?? default_settings_value.value.reportDate;
    curr_data.general = { ...original_data.general };

    // System
    original_data.system.theme = generalData.theme ?? default_settings_value.value.theme;
    original_data.system.language = generalData.language ?? default_settings_value.value.language;
    original_data.system.notification = generalData.notification ?? default_settings_value.value.notification;
    original_data.system.time_zone = generalData.time_zone ?? default_settings_value.value.time_zone;
    curr_data.system = { ...original_data.system };
});

</script>
