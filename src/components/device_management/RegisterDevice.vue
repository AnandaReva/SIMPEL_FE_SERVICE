<template>
    <v-col class="fill-height px-0">
        <v-col cols="auto" class="d-flex align-center">
            <v-btn @click="backToContactList" color="primary" class="d-flex justify-center align-center"
                style="max-height: 50px;">
                <v-icon>mdi-arrow-left-bold</v-icon> <span>Kembali</span>
            </v-btn>
        </v-col>

        <v-row class="fill-height" :class="{ 'disable-interactions': isLoading }">
            <v-col class="mx-auto px-0">
                <p class="text-h6 font-weight-medium ma-0 text-center">Tambah Perangkat Baru</p>

                <v-container class="pa-4 elevation-1">
                    <v-progress-circular v-if="isLoading" color="primary" indeterminate
                        class="loading-spinner"></v-progress-circular>

                    <v-form ref="registerDeviceForm" @submit.prevent="submitRegisterDevice" class="d-flex flex-column">
                        <v-text-field maxlength="50" v-model="device_name" label="Nama Perangkat" outlined dense
                            prepend-inner-icon="mdi-access-point-network" class="mb-4" :rules="deviceNameRules"
                            required>
                        </v-text-field>

                        <v-text-field v-model="password" label="Password" outlined dense prepend-inner-icon="mdi-lock"
                            class="mb-4" :rules="passwordRules" required type="password">
                        </v-text-field>

                        <!-- Upload Gambar -->
                        <v-file-input v-model="device_image" label="Gambar Perangkat (Opsional, max 5MB)" outlined dense
                            prepend-inner-icon="mdi-image" class="mb-4" accept="image/png, image/jpeg"
                            @change="handleFileUpload">
                        </v-file-input>


                        <v-row class="pa-4">

                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat (Optional)</p>
                        </v-row>


                        <div class="scrollable-container pa-0">
                            <v-container v-for="(container, index) in dataContainers" :key="index"
                                class="border ma-0 px-1">
                                <v-row>
                                    <v-col cols="6" class="px-1">
                                        <v-text-field v-model="container.title" label="Judul (Lokasi, Spesifikasi dll)"
                                            outlined required :rules="[requiredIfData(container)]">
                                        </v-text-field>
                                    </v-col>

                                    <v-col cols="5" class="px-1">
                                        <v-text-field v-model="container.data" label="Isi data" outlined dense required
                                            :rules="[requiredIfTitle(container)]">
                                        </v-text-field>

                                    </v-col>

                                    <v-col cols="1" class="d-flex align-center px-0">
                                        <v-btn @click="removeContainer(index)" color="error"
                                            style="max-height: 30px; width: 30px; min-width: 30px;" size="small">
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-container>

                        </div>

                        <v-col cols="auto" class="d-flex align-center">
                            <v-btn @click="addDataContainer" color="primary"
                                class="search-button rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px;"
                                :disabled="isDisableAddContainer">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>






                        <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                            :disabled="isDisableRegisterDevice">
                            Tambah Perangkat
                        </v-btn>
                    </v-form>
                </v-container>
            </v-col>
        </v-row>

        <PopUpBox v-if="popupVisible" class="popup-container" :status="popUpProps.status"
            :errorMessage="popUpProps.errorMessage" :errorCode="popUpProps.errorCode" :visible="popupVisible"
            @close="closePopup" />
    </v-col>
</template>

<script setup>
import { ref, computed } from "vue";
import { BASE_API_URL } from "@/configs/config";
import { Process } from "@/utils/requestHelper";

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
const device_name = ref("");
const password = ref("");
const device_image = ref(null);
const device_image_base64 = ref("");

const deviceNameRules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 6 || "Nama perangkat minimal 6 karakter",
    (v) => v.length <= 50 || "Nama perangkat maksimal 50 karakter",
];

const passwordRules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 30 || "Password maksimal 30 karakter",
];

const isDisableRegisterDevice = computed(() => {
    // Cek apakah nama perangkat dan password valid
    const isDeviceNameValid = device_name.value && device_name.value.length >= 6 && device_name.value.length <= 50;
    const isPasswordValid = password.value && password.value.length >= 8 && password.value.length <= 30;

    // Cek apakah semua dataContainers valid
    const isDeviceDataValid = dataContainers.value.every(container => {
        return (!container.data.trim() || container.title.trim()) &&
            (!container.title.trim() || container.data.trim());
    });

    return !(isDeviceNameValid && isPasswordValid && isDeviceDataValid);
});


const handleFileUpload = (event) => {
    const file = event.target?.files?.[0] || event;

    if (!file) {
        device_image_base64.value = "";
        return;
    }

    if (!(file instanceof Blob)) {
        console.error("Invalid file type");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        popUpProps.value = {
            status: "error",
            errorMessage: "Ukuran gambar maksimal 5MB",
            errorCode: "FILE_SIZE_EXCEEDED",
        };
        popupVisible.value = true;
        device_image.value = null;
        return;
    }

    convertImageToBase64(file);
};


const convertImageToBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        device_image_base64.value = reader.result;
    };
    reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
        popUpProps.value = {
            status: "error",
            errorMessage: "Gagal mengonversi gambar",
            errorCode: "BASE64_ERROR",
        };
        popupVisible.value = true;
    };
};



const dataContainers = ref([
    { title: "", data: "" }
]);

const addDataContainer = () => {
    if (dataContainers.value.length > 0) {
        const lastContainer = dataContainers.value[dataContainers.value.length - 1];

        // Pastikan judul dan data terakhir sudah diisi sebelum menambah container baru
        if (!lastContainer.title.trim() || !lastContainer.data.trim()) {
            popUpProps.value = {
                status: "error",
                errorMessage: "Harap isi judul dan data sebelum menambahkan container baru",
                errorCode: "EMPTY_CONTAINER",
            };
            popupVisible.value = true;
            return;
        }
    }

    dataContainers.value.push({ title: "", data: "" });
};

const isDisableAddContainer = computed(() => {
    if (dataContainers.value.length === 0) return false;
    const lastContainer = dataContainers.value[dataContainers.value.length - 1];
    return !lastContainer.title.trim() || !lastContainer.data.trim();
});


const removeContainer = (index) => {
    dataContainers.value.splice(index, 1);
};


const requiredIfData = (container) => {
    return () => {
        if (container.data.trim() && !container.title.trim()) {
            return "Judul harus diisi jika isi data tidak kosong";
        }
        return true;
    };
};

const requiredIfTitle = (container) => {
    return () => {
        if (container.title.trim() && !container.data.trim()) {
            return "Isi data harus diisi jika judul tidak kosong";
        }
        return true;
    };
};


function validateDeviceData(deviceData) {
    return deviceData.filter(container => container.title.trim() && container.data.trim());
}




///////////////////// //////////////////////

const submitRegisterDevice = async () => {

    console.log("dataContainers before validate: ", dataContainers.value);
    dataContainers.value = validateDeviceData(dataContainers.value);


    console.log("Submitting register device...");
    console.log("device_name: ", device_name.value);
    console.log("password: ", password.value);
    console.log("device_image_base64: ", device_image_base64.value);
    console.log("dataContainers after validate: ", dataContainers.value);



    /*   isLoading.value = true;
      const success = await registerDevice(device_name.value, password.value, device_image_base64.value);
      isLoading.value = false;
  
      if (success) {
          device_name.value = "";
          password.value = "";
          device_image.value = null;
          device_image_base64.value = "";
          dataContainers.value = [{ title: "", data: "" }];
      } */
};

const registerDevice = async (deviceNameParam, passwordParam, imageBase64) => {



    const baseUrl = BASE_API_URL;
    const operation = "register_device";
    const params = {
        name: deviceNameParam,
        password: passwordParam,
        image: imageBase64, // Kirim Base64 ke backend
        data: dataContainers.value.map((container) => ({ title: container.title, data: container.data })), // Kirim data ke backend
    };

    const response_be = await Process(baseUrl, operation, params);

    if (response_be.status !== "success") {
        popUpProps.value = {
            status: "error",
            errorMessage: response_be.error_message,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;
        return false;
    }
    return true;
};

const emit = defineEmits(["toogle-add-device-state"]);

const backToContactList = () => {
    emit("toogle-add-device-state");
};
</script>

<style scoped>
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}


.scrollable-container {
    max-height: 300px;
    /* Ubah sesuai kebutuhan */
    overflow-y: auto;
    border: 2px solid white;
    padding: 10px;
    border-radius: 5px;


}
</style>
