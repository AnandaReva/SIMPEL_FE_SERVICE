<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay Loading -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>





        <!-- Card utama -->


        <!-- Header Filter -->
        <v-row no-gutters class="w-100 align-center mb-4">
            <v-col cols="9">
                <v-select v-model="selectedOrderByYearsAvailable" :items="[
                    { title: 'Tahun', value: 'tahun' },
                    { title: 'Total Energi', value: 'energy' }
                ]" density="compact" variant="outlined" label="Order By" hide-details />
            </v-col>
            <v-col cols="3" class="d-flex justify-end">
                <v-btn icon @click="toggleSortYear" class="ma-0">
                    <v-icon>
                        {{ selectedSortTypeyearList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                    </v-icon>
                </v-btn>
            </v-col>
        </v-row>

        <!-- Daftar Tahun -->

        <v-list dense class="w-100">
            <template v-for="(item, index) in year_list" :key="index">
                <v-list-item @click="selectYear(item.year)" class="pa-2 ms-0">

                    <v-row align="center" justify="space-between" no-gutters>
                        <v-col cols="auto">
                            <span style="font-weight: bold;">{{ item.year }}</span>
                        </v-col>
                        <v-col cols="auto" class="text-right">
                            <div style="font-size: 0.9rem;">Total Konsumsi</div>
                            <div style="font-weight: bold;">{{ item.total_energy }} kWh</div>
                        </v-col>
                    </v-row>

                </v-list-item>
                <v-divider v-if="index !== year_list.length - 1" class="my-2" />
            </template>
        </v-list>


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
import { ref, onMounted, watch } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

const props = defineProps({ curr_device: {} })


const emits = defineEmits(['select-year']);


const selectedOrderByYearsAvailable = ref('tahun');
const selectedSortTypeyearList = ref('ASC');
const isLoading = ref(false);

const isFetchingYears = ref(false);

const start_year = ref(null) // Cursor pagination, null = dari tahun terbaru
const next_start_year = ref(null)
const prev_start_year = ref(null)
const year_list = ref([])
const year_list_totalData = ref(0)
const year_list_pageSize = ref(10)
const paginationDirection = ref("next") // 'next' or 'prev'


const max_year = ref(null)
const min_year = ref(null)

// Sorting
const year_orderBy = ref("year")
const year_sortType = ref("desc") // default sort descending


watch(selectedOrderByYearsAvailable, async (newVal) => {
    if (newVal === 'tahun') {
        year_orderBy.value = 'year'
    } else if (newVal === 'energy') {
        year_orderBy.value = 'energy'
    }

    start_year.value = null
    paginationDirection.value = "next"
    await getReportYearList()
})



watch(year_list_pageSize, async (newSize) => {
    console.log("year_list_pageSize - year_list_pageSize: ", year_list_pageSize)

    start_year.value = null
    paginationDirection.value = "next"
    await getReportYearList()
})




// Calculate next/prev years based on current data and sort type
const calculatePaginationYears = () => {
    if (year_list.value.length === 0) {
        next_start_year.value = null
        prev_start_year.value = null
        return
    }

    const firstYear = year_list.value[0].year
    const lastYear = year_list.value[year_list.value.length - 1].year

    if (year_sortType.value === 'desc') {
        // Descending order (newest first)
        next_start_year.value = lastYear - 1
        prev_start_year.value = firstYear + 1
    } else {
        // Ascending order (oldest first)
        next_start_year.value = lastYear + 1
        prev_start_year.value = firstYear - 1
    }
}

// Pagination functions
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

const isDisableNextButton = () => {
    if (!year_list.value.length) return true
    if (year_sortType.value === 'desc') {
        return year_list.value[year_list.value.length - 1].year <= min_year.value
    } else {
        return year_list.value[year_list.value.length - 1].year >= max_year.value
    }
}

const isDisablePrevButton = () => {
    if (!year_list.value.length) return true
    if (year_sortType.value === 'desc') {
        return year_list.value[0].year >= max_year.value
    } else {
        return year_list.value[0].year <= min_year.value
    }
}


const toggleSortYear = async () => {
    year_sortType.value = year_sortType.value === 'asc' ? 'desc' : 'asc'

    // Reset pagination
    start_year.value = null
    paginationDirection.value = "next"
    await getReportYearList()
}

// Main data fetching function
const getReportYearList = async () => {
    if (isFetchingYears.value) return

    isFetchingYears.value = true
    isLoading.value = true

    let params = {
        device_id: props.curr_device.id,
        page_size: year_list_pageSize.value,
        sort_type: year_sortType.value,
        order_by: year_orderBy.value
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

        // Replace data instead of appending
        year_list.value = (responseBE.year_list || []).map(item => ({
            ...item,
            total_energy: Number(item.total_energy).toFixed(2),
        }))

        year_list_totalData.value = responseBE.total_year || 0

        max_year.value = responseBE.max_year
        min_year.value = responseBE.min_year


        // Calculate next/prev years on client side
        calculatePaginationYears()

    } catch (error) {
        console.error("Error fetching years:", error)
    } finally {
        isFetchingYears.value = false
        isLoading.value = false
    }
}

////////////////////////////////
const selectYear = (yearSelected) => {
    console.log("selectYear - yearSelected: ", yearSelected)
    emits('select-year', yearSelected)
}





////////////////////////////////

watch(() => props.curr_device.id, async (newId) => {
    if (newId) {
        // Reset and fetch new data
        start_year.value = null
        next_start_year.value = null
        prev_start_year.value = null
        year_list.value = []
        year_list_totalData.value = 0
        paginationDirection.value = "next"

        await getReportYearList()
    }
})

onMounted(async () => {
    await getReportYearList()
})

</script>