<template>
    <v-col class="fill-height px-0">
        <v-col cols="auto" class="d-flex align-center">
            <v-btn @click="backToContactList" color="primary" class="d-flex justify-center align-center"
                style="max-height: 50px;">
                <v-icon>mdi-arrow-left-bold</v-icon> <span>Kembali</span>
            </v-btn>
        </v-col>
        <v-container class="overflow-y-auto" style="max-height: 75vh;"></v-container>
        <v-row class="fill-height ">


            <v-col class="mx-auto px-0">
                <p class="text-h6 font-weight-medium ma-0 text-center">Tambah Perangkat Baru</p>

                <v-container class="pa-4 flex-grow-1 overflow-y-auto" max-height="500px" >


                    <v-form ref="registerDeviceForm" @submit.prevent="submitRegisterDevice" class="d-flex flex-column">
                        <v-text-field maxlength="50" v-model="device_name" label="Nama Perangkat" outlined dense
                            prepend-inner-icon="mdi-access-point-network" class="mb-4" :rules="deviceNameRules"
                            required>
                        </v-text-field>

                        <v-text-field v-model="password" label="Password" outlined dense prepend-inner-icon="mdi-lock"
                            class="mb-4" :rules="passwordRules" required type="password">
                        </v-text-field>

                        <!-- Menampilkan gambar yang sudah ada -->
                        <v-row class="d-flex justify-center mt-1 mb-3">
                            <v-img v-if="device_image_src && device_image" :src="device_image_src" class="d-flex"
                                max-height="200" max-width="450" contain />
                        </v-row>

                        <!-- Upload Gambar -->
                        <v-file-input v-model="device_image" label="Gambar Perangkat (Opsional, max 5MB)" outlined dense
                            prepend-inner-icon="mdi-image" class="mb-4" accept="image/png, image/jpeg"
                            @change="handleFileUpload">
                        </v-file-input>


                        <v-number-input v-model="device_read_interval" control-variant="split"
                            label="Interval Pembacaan Data Sensor (Detik)" :min="1" :max="60" required
                            :rules="readIntervalRules">
                        </v-number-input>


                        <v-row class="pa-4">

                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat (Optional)</p>
                        </v-row>


                        <div class="scrollable-container pa-0 border ma-0">
                            <v-container v-for="(item, index) in dataContainers" :key="index">
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="item.title"
                                            label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" outlined :rules="[
                                                requiredIfData(item),
                                                () => noDuplicateTitles(item, index, dataContainers)
                                            ]">
                                        </v-text-field>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="item.data" label="Isi data" outlined
                                            :rules="[requiredIfTitle(item)]">
                                        </v-text-field>
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

                        <v-col cols="auto" class="d-flex align-center">
                            <v-btn @click="addDataContainer" color="primary"
                                class="search-button rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px;"
                                :disabled="isDisableAddContainer">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                        <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                            :disabled="isDisableSubmitBtn">
                            Tambah Perangkat
                        </v-btn>
                    </v-form>


                </v-container>
            </v-col>
        </v-row>
    </v-col>
</template>


<script setup>
import { ref, computed } from "vue";

import { VNumberInput } from 'vuetify/labs/VNumberInput'
import { CompressToZip, ConvertImageToBase64 } from "@/utils/utils"

const emit = defineEmits(["toogle-add-device-state", "register-device"]);

const device_name = ref("");
const password = ref("");
const device_image_src = ref("");
const device_image = ref(null);
const device_image_base64 = ref("");
const device_read_interval = ref(0)



const handleFileUpload = async (event) => {
    const file = event.target?.files?.[0] || event;

    if (!file) {
        device_image_base64.value = "";
        device_image_src.value = "";
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

    // Buat URL objek untuk preview gambar
    device_image_src.value = URL.createObjectURL(file);
    //console.log("Preview image URL:", device_image_src.value);

    try {
        const compressedFile = await CompressToZip(file, file.name);
        const base64Result = await ConvertImageToBase64(compressedFile);
        device_image_base64.value = base64Result;

    } catch (error) {
        console.error("Error processing image: :", error);
        popUpProps.value = {
            status: "error",
            errorMessage: "GAGAL MEMPROSES GAMBAR",
            errorCode: "ERROR",
        };
        popupVisible.value = true;
        device_image.value = null;
        return;
    }
};


const dataContainers = ref([
    { title: "", data: "" }
]);

const addDataContainer = () => {
    // Jika belum ada container, langsung tambahkan container pertama
    if (dataContainers.value.length === 0) {
        dataContainers.value.push({ title: "", data: "" });
        return;
    }

    const lastContainer = dataContainers.value[dataContainers.value.length - 1];

    // Pastikan judul dan data terakhir sudah diisi sebelum menambah container baru
    if (!lastContainer.title.trim() || !lastContainer.data.trim()) {
        popUpProps.value = {
            status: "error",
            errorMessage: "Harap isi judul dan isi data sebelum menambahkan container baru",
            errorCode: "EMPTY_CONTAINER",
        };
        popupVisible.value = true;
        return;
    }

    dataContainers.value.push({ title: "", data: "" });
};



const removeContainer = (index) => {
    dataContainers.value.splice(index, 1);
};


const noDuplicateTitles = (itemParam, index, items) => {
    // Cari apakah ada judul yang sama di container lain
    const duplicate = items.some(
        (otherContainer, otherIndex) =>
            otherIndex !== index &&
            otherContainer.title &&
            otherContainer.title.trim() === itemParam.title.trim()
    );

    return !duplicate || "Judul sudah ada";
};


const requiredIfData = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Judul data tidak kosong";
    }
    if (item.data.trim() && !item.title.trim()) {
        return "Judul data tidak kosong";
    }
    return true;
};

const requiredIfTitle = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    if (item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    return true;
};


const isDisableAddContainer = computed(() => {
    console.log("dataContainers.value.length: ", dataContainers.value.length)
    // Jika tidak ada container, tombol aktif
    if (dataContainers.value.length === 0) return false;


    // Disable jika ada container yang tidak valid
    return dataContainers.value.some(container =>
        requiredIfData(container) !== true || requiredIfTitle(container) !== true
    );
});
// Fungsi validasi untuk submit
function validateDeviceData(deviceData) {
    // Validasi tidak ada judul kosong dan tidak ada duplikat
    const titles = new Set();
    let isValid = true;

    const filteredData = deviceData.filter(container => {
        if (!container.title.trim() || !container.data.trim()) {
            return false;
        }

        if (titles.has(container.title.trim())) {
            isValid = false;
            return false;
        }

        titles.add(container.title.trim());
        return true;
    });

    return isValid ? filteredData : null;
}

const formatDataContainers = (dataContainers) => {
    let formattedData = {};
    dataContainers.forEach(container => {
        if (container.title && container.data) {
            formattedData[container.title] = container.data;
        }
    });
    return formattedData;
};




///////////////////// //////////////////////

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


const readIntervalRules = [
    (v) => !!v || "Interval harus diisi",
    (v) => (v >= 1 && v <= 60) || "Interval harus antara 1 hingga 60 detik",
];



const isDisableSubmitBtn = computed(() => {
    // Cek apakah nama perangkat valid (6-50 karakter)
    const isDeviceNameValid = device_name.value && device_name.value.length >= 6 && device_name.value.length <= 50;

    // Cek apakah password valid (8-30 karakter)
    const isPasswordValid = password.value && password.value.length >= 8 && password.value.length <= 30;

    // Cek apakah interval pembacaan valid (1-60 detik)
    const isReadIntervalValid = device_read_interval.value >= 1 && device_read_interval.value <= 60;

    // Cek apakah semua dataContainers valid
    const isDeviceDataValid = dataContainers.value.every(container => {
        return (container.data.trim() && container.title.trim()); // Pastikan keduanya tidak kosong
    });

    // Jika salah satu tidak valid, maka tombol register harus disable
    return !(isDeviceNameValid && isPasswordValid && isReadIntervalValid && isDeviceDataValid);
});



const submitRegisterDevice = async () => {
    console.log("dataContainers before validate: ", dataContainers.value);

    // Validasi dataContainers sebelum dikirim
    dataContainers.value = validateDeviceData(dataContainers.value);
    const formattedData = formatDataContainers(dataContainers.value);

    // Jika tidak ada device image, set base64 ke string kosong
    if (!device_image.value) {
        device_image_base64.value = "";
    }



    console.log("Submitting register device...");
    console.log("device_name: ", device_name.value);
    console.log("password: ", password.value);
    console.log("device_image: ", device_image.value); // Perbaikan typo
    console.log("device_image_base64: ", device_image_base64.value);
    console.log("dataContainers after validate: ", dataContainers.value);
    console.log("formattedDataContainers: ", formattedData);
    console.log("device_read_interval: ", device_read_interval.value);

    // Kirim data ke backend
    // emit("register-device", {
    //     name: device_name.value,
    //     password: password.value,
    //     image: device_image_base64.value,
    //     data: formattedData,
    //     read_interval: device_read_interval.value,

    // });


    emit("register-device",
        device_name.value,
        password.value,
        device_image_base64.value,
        formattedData,
        device_read_interval.value
    );

    clearForm();


};


function clearForm() {
    console.log("Clearing form...");
    device_name.value = "";
    password.value = "";
    device_image.value = null;
    device_image_base64.value = "";
    device_read_interval.value = 0;
    dataContainers.value = [{ title: "", data: "" }];
}




const backToContactList = () => {
    emit("toogle-add-device-state");
};
</script>

<style scoped></style>
