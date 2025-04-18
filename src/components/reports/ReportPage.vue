<template>
    <v-card class="pa-4 elevation-2 fill-height position-relative" :class="{ 'disable-interactions': isLoading }">

        <!-- Spinner -->
        <v-progress-circular v-if="isLoading" color="primary" indeterminate class="loading-spinner"
            size="40"></v-progress-circular>

        <h2 class="text-h5 font-weight-bold mb-3">Pilih Rentang Waktu</h2>

        <v-row dense align="center" class="mb-4">
            <!-- Start Date -->
            <v-col cols="12" md="4">
                <div class="text-subtitle-2 mb-2">Tanggal Awal</div>
                <v-date-picker v-model="reportStartDate" :max="reportEndDate" elevation="1" color="blue"
                    hide-header></v-date-picker>
            </v-col>

            <!-- End Date -->
            <v-col cols="12" md="4">
                <div class="text-subtitle-2 mb-2">Tanggal Akhir</div>
                <v-date-picker v-model="reportEndDate" :min="reportStartDate" elevation="1" color="blue"
                    hide-header></v-date-picker>
            </v-col>

            <!-- Submit -->
            <v-col cols="12" md="2" class="d-flex align-end">
                <v-btn color="primary" class="mt-4" block @click="handleSubmit">
                    Submit
                </v-btn>
            </v-col>
        </v-row>

        <!-- Chart / Laporan Data -->
        <!-- <div>...chart / hasil...</div> -->

    </v-card>
</template>

<script setup>
import { ref } from "vue";
import { ConvertToEpoch } from "@/utils/utils";

const reportStartDate = ref(null);
const reportEndDate = ref(null);
const isLoading = ref(false);


// contoh device / data laporan
const selectedDeviceId = ref(null);
const reportData = ref({});

const handleSubmit = () => {
    if (!reportStartDate.value || !reportEndDate.value) {
        console.warn("Tanggal belum lengkap.");
        return;
    }

    // Pastikan hanya mengambil bagian tanggal (tanpa waktu)
    const startDate = new Date(reportStartDate.value);
    startDate.setHours(0, 0, 0, 0); // set ke 00:00:00

    const endDate = new Date(reportEndDate.value);
    endDate.setHours(23, 59, 59, 999); // opsional: set ke akhir hari

    const startEpoch = Math.floor(startDate.getTime() / 1000);
    const endEpoch = Math.floor(endDate.getTime() / 1000);

    console.log("Tanggal dipilih (yyyy/mm/dd):", reportStartDate.value, "hingga", reportEndDate.value);
    console.log("Start Epoch:", startEpoch);
    console.log("End Epoch:", endEpoch);

    // Lanjutkan pemanggilan API atau pengolahan data di sini
};

</script>

<style scoped>
.loading-spinner {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
}

.disable-interactions {
    pointer-events: none;
    opacity: 0.6;
}
</style>