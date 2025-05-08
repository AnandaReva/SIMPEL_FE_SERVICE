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
                <v-btn @click="backToYearReportPage" color="primary" class="d-flex align-center"
                    style="max-height: 50px">
                    <v-icon left>mdi-arrow-left-bold</v-icon>
                    Kembali ke Laporan Tahunan
                </v-btn><v-card-title class="text-h4 font-weight-bold text-black mb-0 px-0"> {{ curr_device.name
                    }}</v-card-title>
                <v-card-title class="text-h5 font-weight-bold text-primary mb-0 px-0">📊 LAPORAN TAHUN {{ curr_year
                    }}</v-card-title>
            </v-row>



            <!-- Bagian Kanan -->
            <v-col cols="12" md="6">
                <v-list density="comfortable">

                    <!-- Daya (W) -->
                    <v-list-item>
                        <template #prepend>
                            <v-icon color="primary">mdi-flash-outline</v-icon>
                        </template>
                        <v-list-item-title>Daya (W)</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-row>
                                <v-col cols="4">Maks: {{ curr_day_detail.power?.max?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Min: {{ curr_day_detail.power?.min?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Rata-rata: {{ curr_day_detail.power?.avg?.toFixed(2) || '-' }}</v-col>
                            </v-row>
                        </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Tegangan (V) -->
                    <v-list-item>
                        <template #prepend>
                            <v-icon color="primary">mdi-sine-wave</v-icon>
                        </template>
                        <v-list-item-title>Tegangan (V)</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-row>
                                <v-col cols="4">Maks: {{ curr_day_detail.voltage?.max?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Min: {{ curr_day_detail.voltage?.min?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Rata-rata: {{ curr_day_detail.voltage?.avg?.toFixed(2) || '-' }}</v-col>
                            </v-row>
                        </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Arus (A) -->
                    <v-list-item>
                        <template #prepend>
                            <v-icon color="primary">mdi-current-ac</v-icon>
                        </template>
                        <v-list-item-title>Arus (A)</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-row>
                                <v-col cols="4">Maks: {{ curr_day_detail.current?.max?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Min: {{ curr_day_detail.current?.min?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Rata-rata: {{ curr_day_detail.current?.avg?.toFixed(2) || '-' }}</v-col>
                            </v-row>
                        </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Frekuensi (Hz) -->
                    <v-list-item>
                        <template #prepend>
                            <v-icon color="primary">mdi-waveform</v-icon>
                        </template>
                        <v-list-item-title>Frekuensi (Hz)</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-row>
                                <v-col cols="4">Maks: {{ curr_day_detail.frequency?.max?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Min: {{ curr_day_detail.frequency?.min?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Rata-rata: {{ curr_day_detail.frequency?.avg?.toFixed(2) || '-'
                                    }}</v-col>
                            </v-row>
                        </v-list-item-subtitle>
                    </v-list-item>

                    <!-- Power Factor -->
                    <v-list-item>
                        <template #prepend>
                            <v-icon color="primary">mdi-sigma</v-icon>
                        </template>
                        <v-list-item-title>Power Factor</v-list-item-title>
                        <v-list-item-subtitle>
                            <v-row>
                                <v-col cols="4">Maks: {{ curr_day_detail.power_factor?.max?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Min: {{ curr_day_detail.power_factor?.min?.toFixed(2) || '-' }}</v-col>
                                <v-col cols="4">Rata-rata: {{ curr_day_detail.power_factor?.avg?.toFixed(2) || '-'
                                    }}</v-col>
                            </v-row>
                        </v-list-item-subtitle>
                    </v-list-item>

                </v-list>
            </v-col>

            <!-- Tabel Laporan -->

            <v-card class="mb-6" elevation="2">
                <v-card-title color="primary" class="text-h6 font-weight-bold">Detail</v-card-title>
                <div class="table-container">

                    <v-data-table-server :items="month_list" :items-length="month_list.length"
                        v-model:items-per-page="month_list.length" class="elevation-1 text-body-2" fixed-header
                        height="450" dense no-data-text="Tidak ada data tahun yang tersedia.">

                        <!-- Custom header with sub-headers -->
                        <template #headers>
                            <tr>
                                <th rowspan="2">No</th>
                                <th rowspan="2">Bulan</th>
                                <th rowspan="2">Waktu Pertama</th>
                                <th rowspan="2">Waktu Terakhir</th>
                                <th rowspan="2">Total Energi (kWh)</th>
                                <th rowspan="2">Jumlah Data</th>
                                <th rowspan="2">Interval (d)</th>
                                <th rowspan="2">Ukuran</th>
                                <th colspan="3" class="text-center">Tegangan (Volt)</th>
                                <th colspan="3" class="text-center">Arus (Ampere)</th>
                                <th colspan="3" class="text-center">Daya (W)</th>
                                <th colspan="3" class="text-center">Frekuensi (Hz)</th>
                                <th colspan="3" class="text-center">PF</th>
                                <th colspan="3" class="text-center">Aksi</th>
                            </tr>
                            <tr>
                                <th class="text-center">Maks</th>
                                <th class="text-center">Min</th>
                                <th class="text-center">Rata-rata</th>
                                <th class="text-center">Maks</th>
                                <th class="text-center">Min</th>
                                <th class="text-center">Rata-rata</th>
                                <th class="text-center">Maks</th>
                                <th class="text-center">Min</th>
                                <th class="text-center">Rata-rata</th>
                                <th class="text-center">Maks</th>
                                <th class="text-center">Min</th>
                                <th class="text-center">Rata-rata</th>
                                <th class="text-center">Maks</th>
                                <th class="text-center">Min</th>
                                <th class="text-center">Rata-rata</th>
                                <th class="text-center">Lihat</th>
                                <th class="text-center">CSV</th>
                                <th class="text-center">Excel</th>
                            </tr>
                        </template>

                        <!-- Data rows -->
                        <template #item="{ item, index }">
                            <tr>
                                <td class="text-center">{{ index + 1 }}</td>
                                <td class="text-center">{{ getMonthNameLocal(item.month_number) }}</td>
                                <td class="text-center">{{ FormatToLocal(item.first_record_timestamp) }}</td>
                                <td class="text-center">{{ FormatToLocal(item.last_record_timestamp) }}</td>
                                <td class="text-center">{{ item.energy_consumed_count.toFixed(2) }} kWh</td>
                                <td class="text-center">{{ item.total_data }}</td>
                                <td class="text-center">{{ item.data_interval }} s</td>
                                <td class="text-center">{{ FormatSize(item.total_size_bytes) }}</td>

                                <!-- Voltage -->
                                <td class="text-center">{{ item.voltage?.max?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.voltage?.min?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.voltage?.avg?.toFixed(2) ?? '-' }}</td>

                                <!-- Current -->
                                <td class="text-center">{{ item.current?.max?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.current?.min?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.current?.avg?.toFixed(2) ?? '-' }}</td>

                                <!-- Power -->
                                <td class="text-center">{{ item.power?.max?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.power?.min?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.power?.avg?.toFixed(2) ?? '-' }}</td>

                                <!-- Frequency -->
                                <td class="text-center">{{ item.frequency?.max?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.frequency?.min?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.frequency?.avg?.toFixed(2) ?? '-' }}</td>

                                <!-- Power Factor -->
                                <td class="text-center">{{ item.power_factor?.max?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.power_factor?.min?.toFixed(2) ?? '-' }}</td>
                                <td class="text-center">{{ item.power_factor?.avg?.toFixed(2) ?? '-' }}</td>

                                <!-- Action -->
                                <td class="text-center">
                                    <v-btn size="x-small" variant="text" color="primary"
                                        @click="selectMonth(item.month_number)">
                                        <v-icon start small>mdi-eye</v-icon> Detail
                                    </v-btn>
                                </td>
                                <td class="text-center">
                                    <v-btn size="x-small" color="success" variant="text" class="me-2"
                                        @click.stop="downloadData('csv', item.month)">
                                        <v-icon start>mdi-file-delimited</v-icon> CSV
                                    </v-btn>
                                </td>
                                <td class="text-center">
                                    <v-btn size="small" color="success" variant="text"
                                        @click.stop="downloadData('excel', item.month)">
                                        <v-icon start>mdi-file-excel</v-icon> Excel
                                    </v-btn>
                                </td>
                            </tr>
                        </template>
                    </v-data-table-server>
                </div>
            </v-card>





            <br>




            <div id="chartContainer" style="height: 370px; width: 100%;"></div>



        </v-card>

        <!-- Pop-up Error -->
        <PopUpInfoBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
            :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />
    </v-container>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import { FormatSize, FormatToLocal } from '@/utils/utils';

import { useRoute, useRouter } from 'vue-router';

import CanvasJS from "@canvasjs/charts";


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
});


const curr_year_detail = ref({})


const curr_year = ref(null);

const month_list = ref([]);

const month_names_local = ref([
    { id: 1, name: 'Januari' },
    { id: 2, name: 'Februari' },
    { id: 3, name: 'Maret' },
    { id: 4, name: 'April' },
    { id: 5, name: 'Mei' },
    { id: 6, name: 'Juni' },
    { id: 7, name: 'Juli' },
    { id: 8, name: 'Agustus' },
    { id: 9, name: 'September' },
    { id: 10, name: 'Oktober' },
    { id: 11, name: 'November' },
    { id: 12, name: 'Desember' }
])




const getMonthNameLocal = (monthNumber) => {
    const month = month_names_local.value.find(m => m.id === monthNumber)
    return month ? month.name : 'Bulan Tidak Diketahui'
}





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

        const responsePayload = response.payload;

        curr_year_detail.value = {
            device_id: responsePayload.device_id,
            device_name: curr_device.value?.name || '-',
            total_data: responsePayload.total_data,
            total_size_bytes: responsePayload.total_size_bytes,
            energy_consumed_count: responsePayload.energy_consumption, // <- dari BE
            data_interval: responsePayload.data_interval,
            first_record_timestamp: responsePayload.first_record_timestamp,
            last_record_timestamp: responsePayload.last_record_timestamp,
            voltage: {
                avg: responsePayload.avg_voltage,
                min: responsePayload.min_voltage,
                max: responsePayload.max_voltage,
            },
            current: {
                avg: responsePayload.avg_current,
                min: responsePayload.min_current,
                max: responsePayload.max_current,
            },
            power: {
                avg: responsePayload.avg_power,
                min: responsePayload.min_power,
                max: responsePayload.max_power,
            },
            frequency: {
                avg: responsePayload.avg_frequency,
                min: responsePayload.min_frequency,
                max: responsePayload.max_frequency,
            },
            power_factor: {
                avg: responsePayload.avg_power_factor,
                min: responsePayload.min_power_factor,
                max: responsePayload.max_power_factor,
            },
        }


        // Gunakan langsung month_name dari API tanpa mapping
        month_list.value = (response.payload.month_list || [])
            .map(month => ({
                month_number: month.month_number,
                month_name: month.month_name.trim(), // Bersihkan spasi tambahan
                first_record_timestamp: month.first_record_timestamp,
                last_record_timestamp: month.last_record_timestamp,
                data_interval: month.data_interval,
                energy_consumed_count: month.energy_consumed_count,
                total_size_bytes: month.total_size_bytes,
                total_data: month.total_data,
                power: month.power,
                voltage: month.voltage,
                current: month.current,
                frequency: month.frequency,
                power_factor: month.power_factor,
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



function selectMonth(monthSelected) {
    console.log("---selectMonth---")
    console.log("selectMonth - monthSelected: ", monthSelected);

    // Assuming curr_device is a reactive reference (e.g., Vue ref) or an object containing device details
    console.log("selectMonth - device_id: ", curr_device.value.id);  // Access device_id correctly

    // Navigate to the reportYear route with dynamic parameters
    router.push({
        name: 'report-daily',
        params: { month: Number(curr_year.value), month: Number(monthSelected) }
    });
}




onMounted(() => {
    console.groupCollapsed("---onMounted---");

    // Cek apakah ada data device yang tersimpan di localStorage
    const savedDevice = localStorage.getItem('report');

    const yearFromUrl = route.params.year;

    if (savedDevice && yearFromUrl) {
        const parsedDevice = JSON.parse(savedDevice);
        if (parsedDevice && parsedDevice.device && yearFromUrl) {
            curr_device.value.id = Number(parsedDevice.device.device_id);
            curr_device.value.name = parsedDevice.device.device_name;
            curr_year.value = parseInt(yearFromUrl);

            getReportMonthList();
        }

    }


    console.log('Device ID from localStorage:', curr_device.value.id);
    console.log('Device Name from localStorage:', curr_device.value.name);
    console.log('Year fromURL:', yearFromUrl);


    console.groupEnd();
});


///////////////// CHART ////////////////

// Watch month_list dan render chart saat datanya ada
watch(month_list, (val) => {
    if (val.length > 0) renderCanvasChart()
})

function renderCanvasChart() {
    if (typeof CanvasJS === 'undefined') {
        console.error('CanvasJS belum dimuat.');
        return;
    }

    const dataPoints = month_list.value.map((month) => ({
        y: month.energy_consumed_count,
        label: month.month_name,
        indexLabelFontColor: "#444",
        indexLabelPlacement: "outside"
    }));

    const chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        theme: "light2",
        title: {
            text: `Penggunaan Listrik Tahun ${curr_year.value}`
        },
        axisY: {
            title: "Energi (kWh)",
            includeZero: true
        },
        data: [{
            type: "column",
            color: "#346285",
            dataPoints: dataPoints
        }]
    });

    chart.render();
}



/////////////////////
function downloadData(tipe, month) {
    // Contoh pemanggilan API download atau pembuatan file
    console.log(`Downloading ${tipe} for month ${month}`);
    // Lakukan pemanggilan API / logika lainnya sesuai kebutuhan
}

function backToYearReportPage() {

    router.push({
        name: 'report-year'
    });

}


</script>
