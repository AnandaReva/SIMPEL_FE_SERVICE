<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay Loading -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

        <!-- Laporan Bulanan -->
        <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">
            <!-- Header & Kembali -->
            <v-row align="center" justify="space-between" class="mb-4 mx-0">
                <v-btn @click="backToReportPage" color="primary" class="d-flex align-center" style="max-height: 50px">
                    <v-icon left>mdi-arrow-left-bold</v-icon>
                    Kembali ke Laporan Tahunan
                </v-btn><v-card-title class="text-h4 font-weight-bold text-black mb-0 px-0"> {{ curr_device.name
                }}</v-card-title>
                <v-card-title class="text-h5 font-weight-bold text-primary mb-0 px-0">📊 LAPORAN TAHUN {{ curr_year
                }}</v-card-title>
            </v-row>

            <!-- Tabel Laporan -->
            <div class="table-container">
                <v-data-table v-if="month_list.length > 0" :headers="headers" :items="month_list" :items-per-page="12"
                    :items-per-page-options="[]" class="elevation-1 rounded-lg full-width-table"
                    item-value="month_number" @click:row="selectMonth" hover fixed-header height="calc(100% - 60px)">
                    <template #item.index="{ index }">
                        {{ index + 1 }}
                    </template>
                    <template #item.first_record_timestamp="{ item }">
                        {{ FormatToLocal(item.first_record_timestamp) }}
                    </template>
                    <template #item.last_record_timestamp="{ item }">
                        {{ FormatToLocal(item.last_record_timestamp) }}
                    </template>
                    <template #item.energy_consumed_count="{ item }">
                        {{ FormatToLocal(item.energy_consumed_count) }} kWh
                    </template>
                    <template #item.actions="{ item }">
                        <v-btn size="small" color="primary" variant="text" class="me-2" @click.stop="selectMonth(item)">
                            <v-icon start>mdi-eye</v-icon>
                            Detail
                        </v-btn>

                        <v-btn size="small" color="success" variant="text" class="me-2"
                            @click.stop="downloadData('csv', item.year)">
                            <v-icon start>mdi-file-delimited</v-icon>
                            CSV
                        </v-btn>

                        <v-btn size="small" color="success" variant="text"
                            @click.stop="downloadData('excel', item.year)">
                            <v-icon start>mdi-file-excel</v-icon>
                            Excel
                        </v-btn>
                    </template>


                    <template #bottom>
                        <div class="d-flex justify-end px-4 py-2">
                            <span class="text-caption">Items per page: 12</span>
                        </div>
                    </template>
                    <template #no-data>
                        <v-alert type="info" class="ma-4">Tidak ada data tersedia untuk bulan ini.</v-alert>
                    </template>
                </v-data-table>
            </div>

        </v-card>

        <!-- Pop-up Error -->
        <PopUpInfoBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
            :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />
    </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import { FormatToLocal } from '@/utils/utils';

import { useRoute, useRouter } from 'vue-router';



const route = useRoute();
const router = useRouter();


const isLoading = ref(false);

// State management
const popUpProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});

const popupVisible = ref(false);
const closePopup = () => {
    popupVisible.value = false;
};



// Data untuk laporan
const curr_device = ref({
    id: null,
    name: null
})
const curr_year = ref(null);

const headers = ref([
    { title: 'No', key: 'index', sortable: false },
    { title: 'Bulan', key: 'month_name' },
    { title: 'Waktu Data Pertama', key: 'first_record_timestamp' },
    { title: 'Waktu Data Terakhir', key: 'last_record_timestamp' },
    { title: 'Total Penggunaan Listrik', key: 'energy_consumed_count' },
    { title: 'Jumlah Data', key: 'total_data' },
    { title: 'Aksi', key: 'actions', sortable: false },
]);


const month_list = ref([]);

// Fungsi untuk mengambil data bulan
const getReportMonthList = async () => {
    isLoading.value = true;

    try {
        const operation = 'get_report_month_list';
        const params = {
            year: curr_year.value,
            device_id: curr_device.value.id
        };

        const response = await Process(BASE_API_URL, operation, params);

        if (response.status !== 'success') {
            throw new Error(response.error_message || 'Failed to fetch months');
        }

        // Gunakan langsung month_name dari API tanpa mapping
        month_list.value = (response.payload.month_list || [])
            .map(month => ({
                month_number: month.month_number,
                month_name: month.month_name.trim(), // Bersihkan spasi tambahan
                first_record_timestamp: month.first_record_timestamp,
                last_record_timestamp: month.last_record_timestamp,
                energy_consumed_count: month.energy_consumed_count,
                total_data: month.total_data
            }))
            .sort((a, b) => a.month_number - b.month_number);

    } catch (error) {
        console.error('Error fetching months:', error);
        // Set popupscript jika ada kesalahan
        popUpProps.value = {
            status: 'error',
            errorMessage: 'Gagal mendapatkan data bulan tersedia',
            errorCode: error.errorCode || 'UNKNOWN_ERROR',
        };
        popupVisible.value = true;
    } finally {
        isLoading.value = false;
    }
};



function selectMonth() {

}

onMounted(() => {
    console.groupCollapsed("---onMounted---");

    // Cek apakah ada data device yang tersimpan di localStorage
    const savedDevice = localStorage.getItem('report');
    let deviceIdFromLocalStorage = null;
    let deviceNameFromLocalStorage = null;
    const yearFromUrl = route.params.year;

    if (savedDevice) {
        const parsedDevice = JSON.parse(savedDevice);
        if (parsedDevice && parsedDevice.device) {
            curr_device.value.id = parsedDevice.device.device_id;
            curr_device.value.name = parsedDevice.device.device_name;
        }
    }
    if (yearFromUrl) {
        curr_year.value = parseInt(yearFromUrl);
    }

    console.log('Device ID from localStorage:', deviceIdFromLocalStorage);
    console.log('Device Name from localStorage:', deviceNameFromLocalStorage);
    console.log('Year fromURL:', yearFromUrl);

    console.groupEnd();

    // Jika ID dan Name sudah ada di localStorage, jalankan selectDevice
    if (curr_device.value.id && curr_device.value.name && curr_year.value) {

        // Trigger kembali selectDevice
        getReportMonthList();
    }
});



function downloadData(tipe, year) {
    // Contoh pemanggilan API download atau pembuatan file
    console.log(`Downloading ${tipe} for year ${year}`);
    // Lakukan pemanggilan API / logika lainnya sesuai kebutuhan
}

function backToReportPage() {

    router.push({
        name: 'report',
    });

}


</script>
