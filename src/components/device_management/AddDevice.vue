<template>
    <v-container fluid class="pa-4 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">


        <v-card color="base" elevation="0" style="height: 100%; width: 100%;" class="pa-2">


            <v-col cols="12">

                <v-btn @click="backToDeviceManagPage()" color="primary" elevation="2" class="ma-0">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>

                <v-card flat class="px-4 py-2 my-4">

                    <p class="text-h6 font-weight-medium text-center mb-0">TAMBAH PERANGKAT</p>
                </v-card>
            </v-col>

            <v-col cols="12" class="pa-0">

                <!-- Konten Scrollable -->
                <div>
                    <!-- Informasi Dasar Perangkat -->
                    <v-card outlined class=" px-4 py-2 my-4">
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Nama Perangkat</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-access-point-network</v-icon>
                                        <v-text-field maxlength="255" v-model="device_name" label="Nama Perangkat"
                                            :rules="device_name_rules" required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-lock</v-icon>
                                        <v-text-field v-model="device_password" label="Password" outlined dense
                                            :type="showPassword ? 'text' : 'device_password'"
                                            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                            @click:append="showPassword = !showPassword" :rules="device_password_rules"
                                            required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Interval Pembacaan (Detik)</p>
                                    <v-card flat class="pa-3">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-timer</v-icon>
                                        <v-text-field v-model.number="device_read_interval" type="number" outlined dense
                                            :rules="read_interval_rules" required></v-text-field>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>



                    <!-- Gambar Perangkat -->
                    <v-card outlined class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon size="24" color="primary" class="mr-2">mdi-image</v-icon>
                            <span class="text-subtitle-1 font-weight-medium">Gambar Perangkat</span>
                        </v-card-title>
                        <v-card-text class="text-center">
                            <v-img v-if="device_image_src" :src="device_image_src" max-height="200" contain
                                class="mx-auto" />
                            <p v-else class="text-caption text-grey">Tidak ada gambar</p>
                            <v-file-input v-model="device_image" accept="image/*" label="Upload Gambar"
                                prepend-icon="mdi-camera" @change="handleFileUpload" class="mt-4"></v-file-input>
                        </v-card-text>
                    </v-card>

                    <!-- Data Perangkat -->
                    <v-card outlined class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                            <span class="text-subtitle-1 font-weight-medium">Data Perangkat</span>
                        </v-card-title>

                        <v-card-text style="max-height: 300px; overflow-y: auto;">
                            <div class="scrollable-container pa-0 border ma-0"
                                style="max-height: 300px; overflow-y: auto;">
                                <!-- Data Fields -->
                                <v-container v-for="(container, index) in dataContainers" :key="index">
                                    <v-row>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="container.title" outlined
                                                label="Judul (Lokasi, Alamat IP, Spesifikasi dll)"
                                                :error-messages="validateContainer(container, index).title"
                                                @blur="validateContainer(container, index)"></v-text-field>
                                        </v-col>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="container.data" outlined label="Isi data"
                                                :error-messages="validateContainer(container, index).data"
                                                @blur="validateContainer(container, index)"></v-text-field>
                                        </v-col>
                                        <v-col cols="1" class="d-flex align-center px-0">
                                            <v-btn @click="removeContainer(index)" color="error"
                                                style="max-height: 30px; width: 30px; min-width: 30px" size="small">
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </div>

                        </v-card-text>
                        <!-- Add New Data Button -->
                        <v-col cols="auto" class="d-flex align-center">
                            <v-btn @click="addDataContainer" color="primary"
                                class="rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px"
                                :disabled="isDisableAddContainer">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                    </v-card>
                </div>
            </v-col>


            <v-col>
                <div class="d-flex justify-center" style="max-width: 300px; width: 100%; margin: 0 auto;">
                    <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                        :disabled="isDisableSubmitBtn" @click="submitRegisterDevice">
                        Daftarkan Perangkat
                    </v-btn>
                </div>
            </v-col>




        </v-card>


        <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
            :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
            :visible="popUpInfoVisible" @close="closePopUpInfo" />

        <PopUpConfirmationBox v-if="popUpConfirmVisible" class="popup-container" :title="popUpConfirmProps.title"
            :message="popUpConfirmProps.message" :status="popUpConfirmProps.status" :visible="popUpConfirmVisible"
            @confirm="handleConfirm" @cancel="handleCancel" />



    </v-container>


</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

import PopUpInfoBox from '../parts/PopUpInfoBox.vue';
import PopUpConfirmationBox from '../parts/PopUpConfirmationBox.vue';


const router = useRouter();


const popUpConfirmVisible = ref(false);

const popUpConfirmProps = ref({
    title: "",
    message: "",
    status: "",
});

/////

const popUpInfoVisible = ref(false);

const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
};
const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);



// Form data
const device_name = ref("");
const device_password = ref("");
const device_image = ref(null);
const device_image_src = ref("");
const device_image_base64 = ref("");
const device_read_interval = ref(0);
const showPassword = ref(false);

// Data containers
const dataContainers = ref([{ title: "", data: "" }]);

// Validation rules
const deviceNameAndPasswordRegex = /^[a-zA-Z0-9!@#$%&\-+]+$/;



// Validation rules
const device_name_rules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 2 || "Nama perangkat minimal 2 karakter",
    (v) => v.length <= 255 || "Nama perangkat maksimal 255 karakter",
    (v) => deviceNameAndPasswordRegex.test(v) || "Tidak boleh mengandung spasi atau underscore (_)",
];

const device_password_rules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 255 || "Password maksimal 255 karakter",
    (v) => deviceNameAndPasswordRegex.test(v) || "Tidak boleh mengandung spasi atau underscore (_)",
];


const read_interval_rules = [
    (v) => !!v || "Interval harus diisi",
    (v) => (v >= 1 && v <= 120) || "Interval harus antara 1 hingga 120 detik",
];




/////////// IMAGE /////////////

const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
        device_image_base64.value = null;
        device_image_src.value = "";
        return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {

        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "warning",
            errorMessage: "Ukuran gambar maksimal 10MB",
            errorCode: "",
        };
        device_image_base64.value = null;
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const base64Full = reader.result; // contoh: "data:image/jpeg;base64,/9j/4AAQ..."
        const base64Clean = base64Full.split(",")[1]; // hanya ambil bagian setelah koma

        // ⬇️ Ini yang akan kamu kirim ke backend (langsung string base64)
        device_image_base64.value = base64Clean;

        // Untuk preview
        device_image_src.value = base64Full;
    };

    reader.readAsDataURL(file);
};



/////////// DEVICE DATA //////////

// Data container functions
const addDataContainer = () => {
    console.log("---addDataContainer---")
    dataContainers.value.push({ title: "", data: "" });
};

// Validation rules
const validateContainer = (container, index) => {
    const errors = {
        title: [],
        data: []
    };

    // Check for empty title
    if (!container.title?.trim()) {
        errors.title.push("Judul tidak boleh kosong");
    }

    // Check for empty data
    if (!container.data?.trim()) {
        errors.data.push("Data tidak boleh kosong");
    }

    // Check for duplicate titles
    if (container.title?.trim()) {
        const isDuplicate = dataContainers.value.some(
            (other, otherIndex) =>
                otherIndex !== index &&
                other.title?.trim() === container.title?.trim()
        );
        if (isDuplicate) {
            errors.title.push("Judul sudah ada");
        }
    }

    return errors;
};

// Computed property to disable add button
const isDisableAddContainer = computed(() => {
    return dataContainers.value.some((container, index) => {
        const errors = validateContainer(container, index);
        return errors.title.length > 0 || errors.data.length > 0;
    });
});

const removeContainer = (index) => {
    dataContainers.value.splice(index, 1);
};


/////////// SUBMIT ///////////

const isDisableSubmitBtn = computed(() => {
    const isDeviceNameValid = device_name.value &&
        device_name.value.length >= 2 &&
        device_name.value.length <= 256;

    const isPasswordValid = device_password.value &&
        device_password.value.length >= 8 &&
        device_password.value.length <= 256;

    const isReadIntervalValid = device_read_interval.value >= 1 &&
        device_read_interval.value <= 120;

    const isDeviceDataValid = dataContainers.value.every(container => {
        return container.data.trim() && container.title.trim();
    });

    return !(isDeviceNameValid && isPasswordValid && isReadIntervalValid && isDeviceDataValid);
});

// Format data containers to object
const formatDataContainers = (containers) => {
    let formattedData = {};
    containers.forEach(container => {
        if (container.title && container.data) {
            formattedData[container.title] = container.data;
        }
    });
    return formattedData;
};



const pending_submit_data = ref({});



// Submit function - trigger confirmation popup
const submitRegisterDevice = () => {
    const formattedData = formatDataContainers(dataContainers.value);

    pending_submit_data.value = {
        name: device_name.value,
        password: device_password.value,
        read_interval: device_read_interval.value,
        image: device_image_base64.value,
        data: formattedData
    };


    console.group(`---submitRegisterDevice---`)
    console.log(`submitRegisterDevice - name: ${device_image.value}, password: ${device_password.value}, read_interval: ${device_read_interval.value}, data: ${JSON.stringify(formattedData)}, image: ${JSON.stringify(device_image_base64)}`)


    console.log(device_image_base64.value); // cek object-nya


    popUpConfirmProps.value = {
        title: "Konfirmasi Tambah Perangkat",
        message: "Apakah Anda yakin ingin menambahkan perangkat ini?",
        status: "info",
    };

    popUpConfirmVisible.value = true;
};


// Confirmed by user
const handleConfirm = async () => {
    popUpConfirmVisible.value = false;

    if (!pending_submit_data.value) return;

    const { name, password, read_interval, image, data } = pending_submit_data.value;




    isLoading.value = true;

    const newDeviceId = await addNewDevice(name, password, image, data, read_interval);

    if (newDeviceId) {
        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Sukses Mendaftarkan Perangkat Baru",
            errorCode: "",
        };

        clearForm();
        //router.push({ name: "device-management" });
    }

    pending_submit_data.value = null;
};

const handleCancel = () => {
    popUpConfirmVisible.value = false;
    pending_submit_data.value = null;
};




//////////////////////////////
const addNewDevice = async (
    deviceNameParam,
    passwordParam,
    deviceImageBlobParam,
    deviceDataParam,
    deviceIntervalReadParam,
) => {
    console.group("---addDevice---");

    isLoading.value = true;

    const baseUrl = BASE_API_URL;
    const operation = "add_device_data";

    const params = {
        name: deviceNameParam,
        password: passwordParam,
        read_interval: deviceIntervalReadParam,
    };

    if (deviceImageBlobParam) params.image = deviceImageBlobParam;
    if (deviceDataParam && Object.keys(deviceDataParam).length > 0) params.data = deviceDataParam;

    console.log("Final params to send:", params);

    try {
        const response_be = await Process(baseUrl, operation, params);

        if (!response_be || response_be.status !== "success") {
            const errMessage = response_be?.error_message || "Gagal mendaftarkan perangkat";
            const errCode = response_be?.error_code || "UNKNOWN_ERROR";

            throw { message: errMessage, code: errCode };
        }

        const newDeviceId = response_be.payload?.device_id;

        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Perangkat berhasil ditambahkan",
            errorCode: "NEW DEVICE ADDED",
        };

        return newDeviceId;

    } catch (error) {
        console.error("Error registering device:", error);

        let errorMessage = error.message || "Terjadi kesalahan saat registrasi perangkat";
        let errorCode = error.code || "REGISTER_DEVICE_ERROR";

        // Tangani kasus konflik device name (error code 409)
        if (errorCode === 409 || errorCode === "409") {
            errorMessage = `Perangkat dengan nama "${deviceNameParam}" sudah terdaftar`;
            errorCode = "DEVICE_NAME_CONFLICT";
        }

        popUpInfoProps.value = {
            status: "error",
            errorMessage,
            errorCode,
        };

        return null;

    } finally {
        popUpInfoVisible.value = true;
        isLoading.value = false;
        console.groupEnd();
    }
};





///////////////////////////

const clearForm = () => {
    device_name.value = "";
    device_password.value = "";
    device_image.value = null;
    device_image_src.value = "";
    device_image_base64.value = null;
    device_read_interval.value = 0;
    dataContainers.value = [{ title: "", data: "" }];
};



// Navigation
const backToDeviceManagPage = () => {
    router.push({ name: "device-management" });
};
</script>