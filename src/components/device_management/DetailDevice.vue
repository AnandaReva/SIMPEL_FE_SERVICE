<template>
    <v-col class="fill-height px-0">
        <v-col cols="auto" class="d-flex align-center">
            <v-btn @click="backToDeviceList" color="primary" class="d-flex justify-center align-center"
                style="max-height: 50px;">
                <v-icon>mdi-arrow-left-bold</v-icon> <span>Kembali</span>
            </v-btn>
        </v-col>

        <v-row class="fill-height">
            <v-col class="mx-auto px-0">
                <p class="text-h6 font-weight-medium ma-0 text-center">Detail Perangkat</p>

                <v-container class="pa-4 elevation-1">
                    <v-form ref="deviceDetailForm" @submit.prevent="submitDeviceUpdate" class="d-flex flex-column">
                        <v-text-field maxlength="50" v-model="deviceData.name" label="Nama Perangkat" outlined dense
                            prepend-inner-icon="mdi-access-point-network" class="mb-4" :rules="deviceNameRules"
                            required>
                        </v-text-field>

                        <v-text-field v-model="deviceData.password" label="Password" outlined dense
                            prepend-inner-icon="mdi-lock" class="mb-4" :rules="passwordRules" required type="password">
                        </v-text-field>

                        <v-file-input v-model="deviceData.image" label="Gambar Perangkat (Opsional, max 5MB)" outlined
                            dense prepend-inner-icon="mdi-image" class="mb-4" accept="image/png, image/jpeg"
                            @change="handleFileUpload">
                        </v-file-input>

                        <v-number-input v-model="deviceData.read_interval" control-variant="split"
                            label="Interval Pembacaan Data Sensor (Detik)" :min="1" :max="60" required
                            :rules="readIntervalRules">
                        </v-number-input>

                        <v-row class="pa-4">
                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat</p>
                        </v-row>

                        <div class="scrollable-container pa-0">
                            <v-container v-for="(container, index) in deviceData.additionalData" :key="index"
                                class="border ma-0 px-1">
                                <v-row>
                                    <v-col cols="6" class="px-1">
                                        <v-text-field v-model="container.title" label="Judul" outlined required>
                                        </v-text-field>
                                    </v-col>

                                    <v-col cols="5" class="px-1">
                                        <v-text-field v-model="container.data" label="Isi Data" outlined dense required>
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
                                class="rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px;">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>

                        <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2">
                            Update Perangkat
                        </v-btn>
                    </v-form>
                </v-container>
            </v-col>
        </v-row>
    </v-col>
</template>

<script setup>
import { ref, reactive } from "vue";
import { VNumberInput } from "vuetify/labs/VNumberInput";

const emit = defineEmits(["update-device", "toogle-detail-device-state"]);
const props = defineProps({
    deviceData: {
        type: Object,
        required: true,
    },
});

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

const handleFileUpload = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            props.deviceData.image = reader.result;
        };
    }
};

const addDataContainer = () => {
    props.deviceData.additionalData.push({ title: "", data: "" });
};

const removeContainer = (index) => {
    props.deviceData.additionalData.splice(index, 1);
};

const submitDeviceUpdate = () => {
    emit("update-device", props.deviceData);
};

const backToDeviceList = () => {
    emit("toogle-detail-device-state");
};
</script>