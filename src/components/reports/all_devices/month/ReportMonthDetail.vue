<template>

    <v-container>


        <v-row>
            <v-col cols="12">
                <v-card elevation="2" rounded="xl" class="pa-6 text-white">
                    <v-card flat color="base" class="pa-4 text-center mb-4">
                        <h3 class="text-center text-h6 font-weight-bold">
                            Laporan Semua Perangkat Bulan {{ getMonthName(props.month_selected_detail?.month) }} Tahun {{
                                props.month_selected_detail?.year }}
                        </h3>
                    </v-card>

                    <v-row class="mb-1" dense>
                        <v-col cols="6">
                            <v-card flat color="base" class="pa-4 text-center">
                                <div class="text-caption">Total Konsumsi Energi</div>
                                <div class="text-h5 font-weight-bold">
                                    {{ Number(props.month_selected_detail?.total_energy).toFixed(2) }} <span
                                        class="text-caption">kWh</span>
                                </div>
                            </v-card>
                        </v-col>
                        <v-col cols="6">
                            <v-card flat color="base" class="pa-4 text-center">
                                <div class="text-caption">Total Emisi Karbon</div>
                                <div class="text-h5 font-weight-bold">
                                    ±{{ total_emission }}
                                    <span class="text-caption">Kg CO₂</span>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <v-divider class="mb-1" />

                    <v-card color="base" class="pa-4 mb-1" elevation="2" rounded="xl">
                        <v-row dense>
                            <v-col cols="12" md="6">
                                <div class="text-caption mb-1">Waktu Data Pertama</div>
                                <div class="text-body-2 mb-3">{{
                                    ConvertUTCToLocal(props.month_selected_detail?.first_timestamp, timezoneOffset) }}
                                </div>

                                <div class="text-caption mb-1">Waktu Data Terakhir</div>
                                <div class="text-body-2 mb-3">{{
                                    ConvertUTCToLocal(props.month_selected_detail?.last_timestamp, timezoneOffset) }}
                                </div>

                                <div class="text-caption mb-1">Interval Rata-rata</div>
                                <div class="text-body-2 mb-3">
                                    {{ Number(props.month_selected_detail?.avg_data_interval).toFixed(2) }} detik
                                </div>

                                <div class="text-caption mb-1">Jumlah Data</div>
                                <div class="text-body-2">{{ props.month_selected_detail?.total_data }} data</div>
                            </v-col>

                            <v-col cols="12" md="6">
                                <div class="text-caption mb-1">Daya (W)</div>
                                <div class="text-body-2 mb-1">
                                    Rata-rata: {{ Number(props.month_selected_detail?.power.avg).toFixed(2) }}
                                </div>
                                <div class="text-body-2 mb-3">
                                    Min: {{ Number(props.month_selected_detail?.power.min).toFixed(2) }} |
                                    Maks: {{ Number(props.month_selected_detail?.power.max).toFixed(2) }}
                                </div>

                                <div class="text-caption mb-1">Arus (A)</div>
                                <div class="text-body-2 mb-1">
                                    Rata-rata: {{ Number(props.month_selected_detail?.current.avg).toFixed(2) }}
                                </div>
                                <div class="text-body-2 mb-3">
                                    Min: {{ Number(props.month_selected_detail?.current.min).toFixed(2) }} |
                                    Maks: {{ Number(props.month_selected_detail?.current.max).toFixed(2) }}
                                </div>

                                <div class="text-caption mb-1">Tegangan (V)</div>
                                <div class="text-body-2 mb-1">
                                    Rata-rata: {{ Number(props.month_selected_detail?.voltage.avg).toFixed(2) }}
                                </div>
                                <div class="text-body-2">
                                    Min: {{ Number(props.month_selected_detail?.voltage.min).toFixed(2) }} |
                                    Maks: {{ Number(props.month_selected_detail?.voltage.max).toFixed(2) }}
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
                            Trend Konsumsi Harian
                        </h3>
                    </v-card>

                    <v-card color="base" class="pa-4 mb-1" elevation="2" rounded="xl">
                        <div id="dailyEnergyChart" style="height: 370px; width: 100%;"></div>

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
import { ConvertUTCToLocal } from '@/utils/utils';
import CanvasJS from '@canvasjs/charts';

const props = defineProps(['month_selected_detail']);
const day_list = ref([]);
const isLoading = ref(false);

const getMonthName = (monthNumber) => {
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return monthNames[monthNumber - 1] || `Bulan ${monthNumber}`;
};

const getDayName = (dayNumber) => {
    const dayNames = {
        1: "Senin",
        2: "Selasa",
        3: "Rabu",
        4: "Kamis",
        5: "Jumat",
        6: "Sabtu",
        7: "Minggu"
    };
    return dayNames[dayNumber] || `Hari ${dayNumber}`;
};




const fillMissingDays = (list, year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const result = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const found = list.find(item => item.day_date_number === i);
        if (found) {
            result.push(found);
        } else {
            const dateObj = new Date(year, month - 1, i);
            const dayName = getDayName(dateObj.getDay() === 0 ? 7 : dateObj.getDay());

            result.push({
                day_date_number: i,
                total_energy: null,
                day_name: dayName
            });
        }
    }

    return result;
};


const renderChart = () => {
    const chart = new CanvasJS.Chart("dailyEnergyChart", {
        animationEnabled: true,
        theme: "light2",
        axisX: {
            title: "Tanggal",
            interval: 1,
            labelAngle: -45,
            labelFontSize: 10,
            labelWrap: true,
            labelMaxWidth: 50
        },
        axisY: {
            title: "Energi (kWh)"
        },
        data: [{
            type: "column",
            indexLabelFontColor: "#fff", // Warna putih untuk kontras
            indexLabelPlacement: "inside", // Letakkan label di dalam bar
            indexLabelOrientation: "vertical", // Orientasi vertikal
            indexLabelFontSize: 12,
            indexLabelFontWeight: "bold",
            nullDataLineDashType: "dot",
            dataPoints: day_list.value.map(item => ({
                label: `${item.day_date_number} (${item.day_name})`,
                y: item.total_energy !== null ? Number(item.total_energy) : null,
                indexLabel: item.total_energy !== null ? `${item.total_energy}\nkWh` : "" // \n untuk line break
            }))
        }]
    });
    chart.render();
};
//////////////// CARBON EMISSION ////////////////////

const total_emission = ref(0);
const emission_factor = ref(0.813);



const calculateEmission = () => {
    const energy_kwh = parseFloat(props.month_selected_detail?.total_energy || 0);
    total_emission.value = (energy_kwh * emission_factor.value).toFixed(2);
};



const getReportDayList = async () => {
    isLoading.value = true;

    const params = {
        order_by: 'day',
        sort_type: 'asc',
        year: props.month_selected_detail.year,
        month: props.month_selected_detail.month
    };

    try {
        const operation = "get_report_all_devices_available_day_date_by_month";
        const response_be = await Process(BASE_API_URL, operation, params);

        if (response_be.error_code !== "000000") {
            console.error("getReportDayList FAILED:", response_be.error_message);
            return;
        }

        const rawList = response_be.payload.day_list || [];
        const formattedList = rawList.map(item => ({
            ...item,
            total_energy: Number(item.total_energy).toFixed(2),
            day_name: getDayName(item.day_number)
        }));

        day_list.value = fillMissingDays(formattedList, props.month_selected_detail.year, props.month_selected_detail.month);
    } catch (error) {
        console.error("Error fetching days:", error);
    } finally {
        isLoading.value = false;
        renderChart();
    }
};

// Gabungan watch
watch(() => props.month_selected_detail, async (newVal, oldVal) => {
    if (newVal) {
        // Hitung ulang emisi
        calculateEmission();

        // Jika tahun berubah, render ulang chart
        if (newVal.month !== oldVal?.month) {
            await getReportDayList();
            renderChart();
        }
    }
}, { immediate: true });

const timezoneOffset = ref(null);
onMounted(async () => {
    if (props.month_selected_detail) {
        window.addEventListener('resize', renderChart);
        await getReportDayList();
        renderChart();
    }

    // Ambil emission factor dari localStorage
    try {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const factor = parseFloat(userData?.data?.emission_factor);
        if (!isNaN(factor)) {
            emission_factor.value = factor;
        }
    } catch (e) {
        emission_factor.value = 0.813; // fallback
    }

    // Ambil timezone offset
    const userRaw = localStorage.getItem('user_data');
    if (userRaw) {
        try {
            const user = JSON.parse(userRaw);
            const tz = Number(user?.data?.timezone);
            if (!isNaN(tz)) {
                timezoneOffset.value = tz * 60; // jam → menit
            }
        } catch (e) {
            console.warn('Gagal parse user_data dari localStorage:', e);
        }
    }

    if (timezoneOffset.value === null) {
        timezoneOffset.value = new Date().getTimezoneOffset() * -1;
    }
});



onBeforeUnmount(() => {
    window.removeEventListener('resize', renderChart);
});
</script>
