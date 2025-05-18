<template>
    <v-container fluid class="pa-4 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">
        <v-card color="base" elevation="2" class="px-2 py-4 w-100 h-100">
            <v-row class="fill-height ma-0 pa-0">
                <v-col cols="12">
                    <v-btn @click="backToDeviceManagPage()" color="primary" elevation="2" class="ma-0">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <p class="text-h6 font-weight-medium text-center mb-0">TAMBAH PERANGKAT</p>
                </v-col>

                <v-col cols="12" class="pa-0">
                    <v-row dense>
                        <!-- Left Column: Device Information -->
                        <v-col cols="12" md="6">
                            <v-card outlined class="mb-4">
                                <v-card-text>
                                    <v-row>
                                        <v-col cols="12" class="mb-4">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Nama Perangkat</p>
                                            <v-text-field maxlength="50" v-model="device_name" 
                                                label="Nama Perangkat" outlined dense
                                                prepend-inner-icon="mdi-access-point-network"
                                                :rules="device_name_rules" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12" class="mb-4">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                            <v-text-field v-model="password" label="Password" outlined dense
                                                prepend-inner-icon="mdi-lock" :type="showPassword ? 'text' : 'password'"
                                                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                                @click:append="showPassword = !showPassword"
                                                :rules="device_password_rules" required></v-text-field>
                                        </v-col>
                                        <v-col cols="12">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Interval Pembacaan (detik)</p>
                                            <v-text-field v-model.number="device_read_interval" type="number" 
                                                outlined dense prepend-inner-icon="mdi-timer"
                                                :rules="read_interval_rules" required></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <!-- Right Column: Device Image + Data -->
                        <v-col cols="12" md="6">
                            <!-- Device Image -->
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

                            <!-- Device Data -->
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
                                                    <v-text-field v-model="container.title" outlined hide-details
                                                        label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" required
                                                        :rules="[
                                                            () => requiredIfData(container),
                                                            () => noDuplicateTitles(container, index, dataContainers)
                                                        ]"></v-text-field>
                                                </v-col>
                                                <v-col cols="5.5" class="px-1 py-0">
                                                    <v-text-field v-model="container.data" outlined hide-details
                                                        label="Isi data" required
                                                        :rules="[() => requiredIfTitle(container)]"></v-text-field>
                                                </v-col>
                                                <v-col cols="1" class="d-flex align-center px-0">
                                                    <v-btn @click="removeContainer(index)" color="error"
                                                        style="max-height: 30px; width: 30px; min-width: 30px"
                                                        size="small">
                                                        <v-icon>mdi-close</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </div>

                                    <!-- Add New Data Button -->
                                    <v-col cols="auto" class="d-flex align-center">
                                        <v-btn @click="addDataContainer" color="primary"
                                            class="rounded-circle d-flex justify-center align-center"
                                            style="max-height: 50px; width: 50px; min-width: 50px"
                                            :disabled="isDisableAddContainer">
                                            <v-icon>mdi-plus</v-icon>
                                        </v-btn>
                                    </v-col>

                                    <!-- Submit Button -->
                                    <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                                        :disabled="isDisableSubmitBtn" @click="submitRegisterDevice">
                                        Daftarkan Perangkat
                                    </v-btn>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter();
const emit = defineEmits(["toogle-add-device-state", "register-device"]);

// Form data
const device_name = ref("");
const password = ref("");
const device_image = ref(null);
const device_image_src = ref("");
const device_image_base64 = ref("");
const device_read_interval = ref(0);
const showPassword = ref(false);

// Data containers
const dataContainers = ref([{ title: "", data: "" }]);

// Validation rules
const device_name_rules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 6 || "Nama perangkat minimal 6 karakter",
    (v) => v.length <= 50 || "Nama perangkat maksimal 50 karakter",
];

const device_password_rules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 30 || "Password maksimal 30 karakter",
];

const read_interval_rules = [
    (v) => !!v || "Interval harus diisi",
    (v) => (v >= 1 && v <= 60) || "Interval harus antara 1 hingga 60 detik",
];

// Handle file upload without compression
const handleFileUpload = (file) => {
    if (!file) {
        device_image_base64.value = "";
        device_image_src.value = "";
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 5MB");
        device_image.value = null;
        return;
    }

    // Create preview URL
    device_image_src.value = URL.createObjectURL(file);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
        device_image_base64.value = e.target.result.split(',')[1]; // Get base64 part only
    };
    reader.readAsDataURL(file);
};

// Data container functions
const addDataContainer = () => {
    if (dataContainers.value.length === 0) {
        dataContainers.value.push({ title: "", data: "" });
        return;
    }

    const lastContainer = dataContainers.value[dataContainers.value.length - 1];

    if (!lastContainer.title.trim() || !lastContainer.data.trim()) {
        alert("Harap isi judul dan isi data sebelum menambahkan container baru");
        return;
    }

    dataContainers.value.push({ title: "", data: "" });
};

const removeContainer = (index) => {
    dataContainers.value.splice(index, 1);
};

const noDuplicateTitles = (item, index, items) => {
    const duplicate = items.some(
        (other, otherIndex) =>
            otherIndex !== index &&
            other.title &&
            other.title.trim() === item.title.trim()
    );
    return !duplicate || "Judul sudah ada";
};

const requiredIfData = (item) => {
    if (!item.title.trim() && !item.data.trim()) return true;
    if (item.data.trim() && !item.title.trim()) return "Judul data tidak boleh kosong";
    return true;
};

const requiredIfTitle = (item) => {
    if (!item.title.trim() && !item.data.trim()) return true;
    if (item.title.trim() && !item.data.trim()) return "Isi data tidak boleh kosong";
    return true;
};

// Computed properties
const isDisableAddContainer = computed(() => {
    if (dataContainers.value.length === 0) return false;
    return dataContainers.value.some(container =>
        requiredIfData(container) !== true || requiredIfTitle(container) !== true
    );
});

const isDisableSubmitBtn = computed(() => {
    const isDeviceNameValid = device_name.value && 
        device_name.value.length >= 6 && 
        device_name.value.length <= 50;

    const isPasswordValid = password.value && 
        password.value.length >= 8 && 
        password.value.length <= 30;

    const isReadIntervalValid = device_read_interval.value >= 1 && 
        device_read_interval.value <= 60;

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

// Submit function
const submitRegisterDevice = async () => {
    const formattedData = formatDataContainers(dataContainers.value);

    emit("register-device", {
        name: device_name.value,
        password: password.value,
        read_interval: device_read_interval.value,
        image: device_image_base64.value,
        data: formattedData
    });

    clearForm();
};

// Clear form
const clearForm = () => {
    device_name.value = "";
    password.value = "";
    device_image.value = null;
    device_image_src.value = "";
    device_image_base64.value = "";
    device_read_interval.value = 0;
    dataContainers.value = [{ title: "", data: "" }];
};

// Navigation
const backToDeviceManagPage = () => {
    emit("toogle-add-device-state");
};
</script>