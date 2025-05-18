<template>
    <v-container fluid class="pa-4 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">
        <v-card color="base" elevation="2" class="px-2 py-4 w-100 h-100">
            <v-row class="fill-height ma-0 pa-0">
                <v-col cols="12">
                    <v-btn @click="backToDeviceManagPage()" color="primary" elevation="2" class="ma-0">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <p class="text-h6 font-weight-medium text-center mb-0">EDIT PERANGKAT</p>
                </v-col>

                <v-col cols="12" class="pa-0">
                    <v-row dense>
                        <!-- Left Column: Device Information -->
                        <v-col cols="12" md="6">
                            <v-card outlined class="mb-4">
                                <v-card-text>
                                    <v-row v-if="curr_device_detail_data">
                                        <v-col cols="12" md="6" class="mb-4">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Nama Perangkat</p>
                                            <v-card flat class="pa-3 d-flex align-center">
                                                <v-icon size="24" color="primary" class="mr-2">mdi-access-point-network</v-icon>
                                                <v-text-field 
                                                    maxlength="50" 
                                                    v-model="curr_device_detail_data.name"
                                                    label="Nama Perangkat" 
                                                    outlined 
                                                    dense
                                                    prepend-inner-icon="mdi-access-point-network" 
                                                    class="mb-4"
                                                    :rules="deviceNameRules" 
                                                    required
                                                ></v-text-field>
                                            </v-card>
                                        </v-col>
                                        <v-col cols="12" md="6" class="mb-4">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                            <v-card flat class="pa-3 d-flex align-center">
                                                <v-icon size="24" color="primary" class="mr-2">mdi-lock</v-icon>
                                                <span>{{ curr_device_detail_data?.password || '-' }}</span>
                                            </v-card>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Interval Pembacaan</p>
                                            <v-card flat class="pa-3">{{ curr_device_detail_data?.read_interval || '-' }}</v-card>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Ditambahkan</p>
                                            <v-card flat class="pa-3">{{ FormatTimestamp(curr_device_detail_data?.create_timestamp) || '-' }}</v-card>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Terakhir</p>
                                            <v-card flat class="pa-3">{{ FormatTimestamp(curr_device_detail_data?.last_timestamp) || '-' }}</v-card>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                            <v-card flat class="pa-3">
                                                <span v-if="curr_device_detail_data?.status === 1">Aktif</span>
                                                <span v-else>Tidak Aktif</span>
                                            </v-card>
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
                                    <v-img 
                                        v-if="existingImageSrc" 
                                        :src="existingImageSrc" 
                                        max-height="200" 
                                        contain
                                        class="mx-auto" 
                                    />
                                    <p v-else class="text-caption text-grey">Tidak ada gambar</p>
                                </v-card-text>
                            </v-card>

                            <!-- Device Data -->
                            <v-card outlined class="mb-4">
                                <v-card-title class="d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                                    <span class="text-subtitle-1 font-weight-medium">Data Perangkat</span>
                                </v-card-title>
                                <v-card-text style="max-height: 300px; overflow-y: auto;">
                                    <div class="scrollable-container pa-0 border ma-0" style="max-height: 300px; overflow-y: auto;">
                                        <!-- Existing Data Fields -->
                                        <v-container v-for="(currData, index) in currDeviceDetailsData" :key="'existing-' + index">
                                            <v-row>
                                                <v-col cols="5.5" class="px-1 py-0">
                                                    <v-text-field 
                                                        v-model="currData.title" 
                                                        outlined 
                                                        hide-details
                                                        label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" 
                                                        required
                                                        :rules="[
                                                            requiredifCurrData(currData),
                                                            () => noDuplicateTitles(currData, index, false)
                                                        ]"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="5.5" class="px-1 py-0">
                                                    <v-text-field 
                                                        v-model="currData.data" 
                                                        outlined 
                                                        hide-details
                                                        label="Isi data" 
                                                        required
                                                        :rules="[requiredifCurrTitle(currData)]"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="1" class="d-flex align-center px-0">
                                                    <v-btn 
                                                        @click="removeExistingDataField(index)" 
                                                        color="error"
                                                        style="max-height: 30px; width: 30px; min-width: 30px" 
                                                        size="small"
                                                    >
                                                        <v-icon>mdi-close</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-container>

                                        <!-- New Data Fields -->
                                        <v-container v-for="(newData, index) in newDeviceDetailsData" :key="'new-' + index">
                                            <v-row>
                                                <v-col cols="5.5" class="px-1 py-0">
                                                    <v-text-field 
                                                        v-model="newData.title"
                                                        label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" 
                                                        outlined
                                                        :rules="[
                                                            requiredifNewData(newData),
                                                            () => noDuplicateTitles(newData, index, newDeviceDetailsData)
                                                        ]"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="5.5" class="px-1 py-0">
                                                    <v-text-field 
                                                        v-model="newData.data" 
                                                        label="Isi data" 
                                                        outlined
                                                        :rules="[requiredifNewTitle(newData)]"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col cols="1" class="d-flex align-center px-0">
                                                    <v-btn 
                                                        @click="removeNewDataField(index)" 
                                                        color="error"
                                                        style="max-height: 30px; width: 30px; min-width: 30px" 
                                                        size="small"
                                                    >
                                                        <v-icon>mdi-close</v-icon>
                                                    </v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-container>
                                    </div>

                                    <!-- Add New Data Button -->
                                    <v-col cols="auto" class="d-flex align-center">
                                        <v-btn 
                                            @click="addNewDataField" 
                                            color="primary"
                                            class="rounded-circle d-flex justify-center align-center"
                                            style="max-height: 50px; width: 50px; min-width: 50px"
                                            :disabled="isDisableAddContainer"
                                        >
                                            <v-icon>mdi-plus</v-icon>
                                        </v-btn>
                                    </v-col>

                                    <!-- Submit Button -->
                                    <v-btn 
                                        type="submit" 
                                        color="primary" 
                                        block 
                                        class="mt-2" 
                                        size="large" 
                                        elevation="2"
                                        :disabled="isDisableSubmitBtn"
                                        @click="submitDeviceUpdate"
                                    >
                                        Perbarui Data Perangkat
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
import { ref, onMounted, watch, reactive, computed } from 'vue'
import { FormatTimestamp } from '@/utils/utils'
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);
const curr_device_detail_data = ref(null);
const user_role = ref("user_guset");

// Device Data Management
const currDeviceDetailsData = ref([]); // Existing data (can edit key and value)
const newDeviceDetailsData = ref([]);  // New data to be added
const originalDeviceDetailsData = ref([]);
const updatedCurrDeviceDetailsData = ref([]);
const deletedCurrDeviceDetailsData = ref([]);
const addedCurrDeviceDetailsData = ref([]);

// Device Image
const existingImageSrc = ref(null);

// Form Rules
const deviceNameRules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 6 || "Nama perangkat minimal 6 karakter",
    (v) => v.length <= 50 || "Nama perangkat maksimal 50 karakter",
];

// Methods
const addNewDataField = () => {
    if (newDeviceDetailsData.value.length === 0 ||
        (newDeviceDetailsData.value[newDeviceDetailsData.value.length - 1].title &&
        newDeviceDetailsData.value[newDeviceDetailsData.value.length - 1].data)) {
        newDeviceDetailsData.value.push({ title: "", data: "" });
    }
};

const removeExistingDataField = (index) => {
    const deletedItem = currDeviceDetailsData.value[index];
    deletedCurrDeviceDetailsData.value.push(deletedItem);
    currDeviceDetailsData.value.splice(index, 1);
};

const removeNewDataField = (index) => {
    newDeviceDetailsData.value.splice(index, 1);
};

const requiredifNewData = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Judul data tidak kosong";
    }
    if (item.data.trim() && !item.title.trim()) {
        return "Judul data tidak kosong";
    }
    return true;
};

const requiredifNewTitle = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    if (item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    return true;
};

const requiredifCurrData = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Judul data tidak kosong";
    }
    if (item.data.trim() && !item.title.trim()) {
        return "Judul data tidak kosong";
    }
    return true;
};

const requiredifCurrTitle = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    if (item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    return true;
};

const noDuplicateTitles = (itemParam, index, isNewData) => {
    const allItems = [
        ...currDeviceDetailsData.value,
        ...newDeviceDetailsData.value
    ];

    const duplicate = allItems.some((otherItem, otherIndex) => {
        if (isNewData && otherIndex >= currDeviceDetailsData.value.length) {
            return (
                otherIndex !== (index + currDeviceDetailsData.value.length) &&
                otherItem.title &&
                otherItem.title.trim() === itemParam.title.trim()
            );
        } else if (!isNewData) {
            return (
                otherIndex !== index &&
                otherItem.title &&
                otherItem.title.trim() === itemParam.title.trim()
            );
        }
        return false;
    });

    return !duplicate || "Judul tidak boleh sama dengan yang lain";
};

const isDisableAddContainer = computed(() => {
    if (newDeviceDetailsData.value.length === 0) return false;
    const lastItem = newDeviceDetailsData.value[newDeviceDetailsData.value.length - 1];
    return !lastItem.title.trim() || !lastItem.data.trim();
});

const validateDeviceData = () => {
    const allTitles = new Set();
    let isValid = true;

    // Validate existing data
    currDeviceDetailsData.value.forEach(item => {
        if (!item.title.trim() || !item.data.trim()) {
            isValid = false;
            return;
        }

        if (allTitles.has(item.title.trim())) {
            isValid = false;
        } else {
            allTitles.add(item.title.trim());
        }
    });

    // Validate new data
    newDeviceDetailsData.value.forEach(item => {
        if (!item.title.trim() || !item.data.trim()) {
            isValid = false;
            return;
        }

        if (allTitles.has(item.title.trim())) {
            isValid = false;
        } else {
            allTitles.add(item.title.trim());
        }
    });

    return isValid;
};

const getEditedDeviceData = (originalDataParam, existingDataParam) => {
    const newDeleted = [];
    const newUpdated = [];
    const newAdded = [];

    const isDuplicate = (arr, title, data) => {
        return arr.some(item => item.title === title && item.data === data);
    };

    originalDataParam.forEach(originalItem => {
        const stillExists = existingDataParam.some(item => item.title === originalItem.title);
        if (!stillExists && !isDuplicate(newDeleted, originalItem.title, originalItem.data)) {
            newDeleted.push(originalItem);
        }
    });

    existingDataParam.forEach(existingItem => {
        const originalItem = originalDataParam.find(item => item.title === existingItem.title);

        if (!originalItem) {
            if (!isDuplicate(newAdded, existingItem.title, existingItem.data)) {
                newAdded.push(existingItem);
            }
        } else if (originalItem.data !== existingItem.data) {
            if (!isDuplicate(newUpdated, existingItem.title, existingItem.data)) {
                newUpdated.push({
                    title: existingItem.title,
                    data: existingItem.data
                });
            }
        }
    });

    deletedCurrDeviceDetailsData.value = [...newDeleted];
    updatedCurrDeviceDetailsData.value = [...newUpdated];
    addedCurrDeviceDetailsData.value = [...newAdded];
};

const isDisableSubmitBtn = computed(() => {
    // Basic form validation
    const isDeviceNameValid = curr_device_detail_data.value?.name &&
        curr_device_detail_data.value.name.length >= 6 &&
        curr_device_detail_data.value.name.length <= 50;

    // Data validation
    const isCurrDeviceDetailsDataValid = currDeviceDetailsData.value.every(item =>
        item.data.trim() && item.title.trim());

    const isNewDeviceDetailsDataValid = newDeviceDetailsData.value.every(item =>
        item.data.trim() && item.title.trim());

    return !(isDeviceNameValid && isCurrDeviceDetailsDataValid && isNewDeviceDetailsDataValid);
});

const submitDeviceUpdate = () => {
    if (!validateDeviceData()) {
        alert("Terdapat judul yang sama atau field yang kosong");
        return;
    }

    // Prepare payload
    const payload = {
        device_id: curr_device_detail_data.value.device_id,
        change_fields: {
            name: curr_device_detail_data.value.name,
            data: {}
        }
    };

    // Get changes in device data
    getEditedDeviceData(originalDeviceDetailsData.value, currDeviceDetailsData.value);

    // Add data changes to payload
    if (updatedCurrDeviceDetailsData.value.length > 0) {
        payload.change_fields.data.update = Object.fromEntries(
            updatedCurrDeviceDetailsData.value.map(item => [item.title, item.data])
        );
    }
    if (addedCurrDeviceDetailsData.value.length > 0) {
        payload.change_fields.data.insert = Object.fromEntries(
            addedCurrDeviceDetailsData.value.map(item => [item.title, item.data])
        );
    }
    if (newDeviceDetailsData.value.length > 0) {
        payload.change_fields.data.insert = {
            ...payload.change_fields.data.insert,
            ...Object.fromEntries(newDeviceDetailsData.value.map(item => [item.title, item.data]))
        };
    }
    if (deletedCurrDeviceDetailsData.value.length > 0) {
        payload.change_fields.data.delete = deletedCurrDeviceDetailsData.value.map(item => item.title);
    }

    console.log("Update payload:", payload);
    // Here you would typically call an API to update the device
    // emit('update-device', payload);
};

onMounted(() => {
    // Get user role
    let user_data = JSON.parse(localStorage.getItem('user_data'));
    user_role.value = user_data?.role;
    
    const allowedRoles = ["system master", "system_admin"];
    if (!allowedRoles.includes(user_role.value?.trim())) {
        router.push({ name: "device-management" });
    }

    // Load device data from session storage
    const rawCurrDeviceData = sessionStorage.getItem("curr_device_selected");
    try {
        curr_device_detail_data.value = JSON.parse(rawCurrDeviceData);
        
        // Initialize device details data
        if (curr_device_detail_data.value?.data) {
            const dataArray = Object.entries(curr_device_detail_data.value.data)
                .map(([key, value]) => ({ title: key, data: value }));
                
            currDeviceDetailsData.value = dataArray;
            originalDeviceDetailsData.value = JSON.parse(JSON.stringify(dataArray));
        }
        
        // Set existing image if available
        if (curr_device_detail_data.value?.image) {
            existingImageSrc.value = curr_device_detail_data.value.image;
        }

        console.log("onMounted - curr_device_detail_data: ", curr_device_detail_data);
    } catch (error) {
        console.error("Failed to parse curr_device_selected:", error);
        router.push({ name: "device-management" });
    }
});

const backToDeviceManagPage = () => {
    router.push({ name: "device-management" });
};
</script>