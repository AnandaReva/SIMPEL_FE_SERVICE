<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">

        <!-- Overlay Loading -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>


        <!-- Grafik LineChart Scrollable -->
        <v-row>
            <v-col>
                <div style="max-height: 400px; overflow-x: auto; width: 100%;">
                    <!-- Min-width bisa lebih besar agar memicu scroll horizontal -->
                    <div ref="chartContainer" style="height: 360px; min-width: 600px; width: 100%;"></div>
                </div>
            </v-col>
        </v-row>


        <!-- Pagination -->
        <v-row class="w-100 mt-4" align="center" justify="space-between">
            <v-col cols="4" class="d-flex justify-start">
                <v-btn icon :disabled="isDisablePrevButton()" @click="prevPage">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="4" class="d-flex justify-center">
                <v-select v-model="year_list_pageSize" :items="[5, 10, 25, 50]" density="compact" label="Jumlah baris"
                    hide-details style="width: 120px;" />
            </v-col>

            <v-col cols="4" class="d-flex justify-end">
                <v-btn icon :disabled="isDisableNextButton()" @click="nextPage">
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
            </v-col>
        </v-row>

    </v-container>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import CanvasJS from "@canvasjs/charts";
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

const props = defineProps({ curr_device: {} })

const isLoading = ref(false)
const isFetchingYears = ref(false)

const year_list = ref([])
const year_list_totalData = ref(0)
const year_list_pageSize = ref(10)
const start_year = ref(null)
const next_start_year = ref(null)
const prev_start_year = ref(null)
const paginationDirection = ref("next")

const year_sortType = ref("desc")
const year_orderBy = ref("year")

const max_year = ref(null)
const min_year = ref(null)

const chartContainer = ref(null)
let chartInstance = null

const renderChart = () => {
    if (!chartContainer.value || !year_list.value.length) return;

    const dataPoints = year_list.value.map((item) => ({
        label: item.year.toString(),
        y: parseFloat(item.total_energy),
        indexLabel: `${item.total_energy} KwH`, 
        indexLabelPlacement: "outside",
        indexLabelFontColor: "#000",
        indexLabelFontSize: 10, // lebih kecil
    }));



    const options = {
        animationEnabled: true,
        theme: "light2",
        axisY: { title: "Total Energi (kWh)" },
        axisX: {
            title: "Tahun",
            interval: 1,
            labelAngle: -45 // opsional, biar label tahun tidak tabrakan
        },
        data: [{
            type: "column", // 🔁 Ganti dari "line" ke "column"
            indexLabelFontSize: 12,
            dataPoints
        }]
    };

    chartInstance = new CanvasJS.Chart(chartContainer.value, {
        ...options,
        width: chartContainer.value.offsetWidth // agar ikut lebar container
    });

    chartInstance.render();
};

const calculatePaginationYears = () => {
    if (year_list.value.length === 0) {
        next_start_year.value = null
        prev_start_year.value = null
        return
    }

    const firstYear = year_list.value[0].year
    const lastYear = year_list.value[year_list.value.length - 1].year

    if (year_sortType.value === 'desc') {
        next_start_year.value = lastYear - 1
        prev_start_year.value = firstYear + 1
    } else {
        next_start_year.value = lastYear + 1
        prev_start_year.value = firstYear - 1
    }
}

const isDisableNextButton = () => {
    if (!year_list.value.length) return true
    const lastYear = year_list.value[year_list.value.length - 1].year
    return year_sortType.value === 'desc'
        ? lastYear <= min_year.value
        : lastYear >= max_year.value
}

const isDisablePrevButton = () => {
    if (!year_list.value.length) return true
    const firstYear = year_list.value[0].year
    return year_sortType.value === 'desc'
        ? firstYear >= max_year.value
        : firstYear <= min_year.value
}

const nextPage = async () => {
    paginationDirection.value = "next"
    start_year.value = next_start_year.value
    await getReportYearList()
}

const prevPage = async () => {
    paginationDirection.value = "prev"
    start_year.value = prev_start_year.value
    await getReportYearList()
}

const getReportYearList = async () => {
    if (isFetchingYears.value) return
    isFetchingYears.value = true
    isLoading.value = true

    let params = {
        device_id: props.curr_device.id,
        page_size: year_list_pageSize.value,
        sort_type: year_sortType.value,
        order_by: year_orderBy.value,
    }

    if (start_year.value !== null) {
        params.start_year = start_year.value
        params.direction = paginationDirection.value
    }

    try {
        const operation = "get_report_available_years"
        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.error_code !== "000000") {
            console.error("getReportYearList FAILED:", response_be.error_message)
            return
        }

        const responseBE = response_be.payload

        year_list.value = (responseBE.year_list || []).map(item => ({
            ...item,
            total_energy: Number(item.total_energy).toFixed(2)
        }))

        year_list_totalData.value = responseBE.total_year || 0
        max_year.value = responseBE.max_year
        min_year.value = responseBE.min_year

        calculatePaginationYears()
        await nextTick()
        renderChart()

    } catch (error) {
        console.error("Error fetching years:", error)
    } finally {
        isFetchingYears.value = false
        isLoading.value = false
    }
}

watch(() => props.curr_device.id, async (newId) => {
    if (newId) {
        start_year.value = null
        next_start_year.value = null
        prev_start_year.value = null
        year_list.value = []
        year_list_totalData.value = 0
        paginationDirection.value = "next"
        await getReportYearList()
    }
})

watch(year_list_pageSize, async () => {
    start_year.value = null
    paginationDirection.value = "next"
    await getReportYearList()
})

onMounted(async () => {
    window.addEventListener('resize', renderChart); // Chart auto-resize
    await getReportYearList();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', renderChart);
});

</script>

<style scoped>
.disable-interactions {
    pointer-events: none;
    opacity: 0.6;
}
</style>
