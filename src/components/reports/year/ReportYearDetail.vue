<template>
    <v-container>


        <v-row>
            <v-col cols="12">
                <v-card elevation="2" rounded="xl" class="pa-6 text-white">
                    <!-- Konten Card Pertama -->
                    <v-card rounded="none" flat color="base" class="pa-4 text-center mb-4">
                        <h3 class="text-center text-h6 font-weight-bold">
                            Laporan Tahun {{ props.year_selected_detail?.year }}
                        </h3>
                    </v-card>

                    <!-- Info Ringkas -->
                    <v-row class="mb-1" dense>
                        <v-col cols="6">
                            <v-card flat color="base" class="pa-4 text-center">
                                <div class="text-caption">Total Kosumsi Energi</div>
                                <div class="text-h5 font-weight-bold">
                                    {{ Number(props.year_selected_detail?.total_energy).toFixed(2) }}
                                    <span class="text-caption">kWh</span>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="6">
                            <v-card flat color="base" class="pa-4 text-center">
                                <div class="text-caption">Total Emisi Karbon</div>
                                <div class="text-h5 font-weight-bold">
                                    ±{{ props.year_selected_detail?.total_emission }}
                                    <span class="text-caption">Kg</span>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-divider class="mb-1" />

                    <!-- Detail Statistik -->
                    <v-card color="base" class="pa-4 mb-1" elevation="2" rounded="xl">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <div class="text-caption mb-1">Waktu Data Pertama</div>
                                <div class="text-body-2 mb-3">{{ props.year_selected_detail?.first_timestamp }}</div>

                                <div class="text-caption mb-1">Waktu Data Terakhir</div>
                                <div class="text-body-2 mb-3">{{ props.year_selected_detail?.last_timestamp }}</div>

                                <div class="text-caption mb-1">Interval Rata-rata</div>
                                <div class="text-body-2 mb-3">
                                    {{ Number(props.year_selected_detail?.avg_data_interval).toFixed(2) }} detik
                                </div>

                                <div class="text-caption mb-1">Jumlah Data</div>
                                <div class="text-body-2">{{ props.year_selected_detail?.total_data }} data</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-caption mb-1">Daya (W)</div>
                                <div class="text-body-2 mb-1">
                                    Rata-rata: {{ Number(props.year_selected_detail?.power.avg).toFixed(2) }}
                                </div>
                                <div class="text-body-2 mb-3">
                                    Min: {{ Number(props.year_selected_detail?.power.min).toFixed(2) }} |
                                    Maks: {{ Number(props.year_selected_detail?.power.max).toFixed(2) }}
                                </div>

                                <div class="text-caption mb-1">Arus (A)</div>
                                <div class="text-body-2 mb-1">
                                    Rata-rata: {{ Number(props.year_selected_detail?.current.avg).toFixed(2) }}
                                </div>
                                <div class="text-body-2 mb-3">
                                    Min: {{ Number(props.year_selected_detail?.current.min).toFixed(2) }} |
                                    Maks: {{ Number(props.year_selected_detail?.current.max).toFixed(2) }}
                                </div>

                                <div class="text-caption mb-1">Tegangan (V)</div>
                                <div class="text-body-2 mb-1">
                                    Rata-rata: {{ Number(props.year_selected_detail?.voltage.avg).toFixed(2) }}
                                </div>
                                <div class="text-body-2">
                                    Min: {{ Number(props.year_selected_detail?.voltage.min).toFixed(2) }} |
                                    Maks: {{ Number(props.year_selected_detail?.voltage.max).toFixed(2) }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-card>
            </v-col>
        </v-row>

        <!-- BARIS BARU -->
        <v-row>
            <v-col cols="12">
                <v-card elevation="2" rounded="xl" class="pa-6 text-white">
                    <v-card rounded="none" flat color="base" class="pa-4 text-center mb-4">
                        <h3 class="text-center text-h6 font-weight-bold">
                            Trend Konsumsi Bulanan
                        </h3>
                    </v-card>

                    <v-card color="base" class="pa-4 mb-1" elevation="2" rounded="xl">
                        <div id="monthlyEnergyChart" style="height: 370px; width: 100%;"></div>

                    </v-card>
                </v-card>


            </v-col>
        </v-row>
    </v-container>
</template>




<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';
import CanvasJS from "@canvasjs/charts";

const props = defineProps(['year_selected_detail', 'curr_device']);
const isLoading = ref(false)


const month_list = ref([])

// Untuk konversi nama bulan
const getMonthName = (monthNumber) => {
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    return monthNames[monthNumber - 1] || `Bulan ${monthNumber}`
}



const renderChart = () => {
    const chart = new CanvasJS.Chart("monthlyEnergyChart", {
        animationEnabled: true,
        theme: "light2",
        axisX: {
            title: "Bulan",
            interval: 1
        },
        axisY: {
            title: "Energi (kWh)",
        },
        data: [{
            type: "column",
            indexLabelFontColor: "#000", // Warna label di atas bar
            indexLabelPlacement: "outside",
            indexLabelFontSize: 12,
            dataPoints: month_list.value.map(item => ({
                label: getMonthName(item.month_number),
                y: item.total_energy !== null ? Number(item.total_energy) : null,
                indexLabel: item.total_energy !== null ? `${item.total_energy} kWh` : ""
            }))
        }]
    });

    chart.render();
};


const getReportMonthList = async () => {
    isLoading.value = true

    const params = {
        device_id: props.curr_device.id,
        order_by: 'month',
        sort_type: 'asc',
        year: props.year_selected_detail.year,

    }

    try {
        const operation = "get_report_available_months_by_year"
        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.error_code !== "000000") {
            console.error("getReportMonthList FAILED:", response_be.error_message)
            return
        }

        const responseBE = response_be.payload

        month_list.value = fillMissingMonths(
            (responseBE.month_list || []).map(item => ({
                ...item,
                total_energy: Number(item.total_energy).toFixed(2),
                month_name: getMonthName(item.month_number)
            })),
            props.year_selected_detail.year
        );

    } catch (error) {
        console.error("Error fetching months:", error)
    } finally {
        isLoading.value = false
    }
}



const fillMissingMonths = (list, year) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const result = [];

    for (let m = 1; m <= 12; m++) {
        // Stop jika bulan melebihi bulan sekarang pada tahun berjalan
        if (year === now.getFullYear() && m > currentMonth) break;

        const found = list.find(item => item.month_number === m);

        if (found) {
            result.push(found);
        } else {
            // Cek apakah bulan sebelumnya dan sesudahnya ada datanya
            const hasBefore = list.some(item => item.month_number < m);
            const hasAfter = list.some(item => item.month_number > m);
            if (hasBefore && hasAfter) {
                result.push({
                    month_number: m,
                    total_energy: null,
                    month_name: getMonthName(m)
                });
            }
        }
    }

    return result;
};


watch(() => props.year_selected_detail, async (newVal, oldVal) => {
    if (newVal && newVal.year !== oldVal?.year) {
        await getReportMonthList();
        renderChart();
    }
});


onMounted(async () => {
    if (props.year_selected_detail) {

        window.addEventListener('resize', renderChart); // Chart auto-resize
        await getReportMonthList();
        renderChart();

    }
})



onBeforeUnmount(() => {
    window.removeEventListener('resize', renderChart);
});



</script>