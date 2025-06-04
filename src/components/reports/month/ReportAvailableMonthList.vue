<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay Loading -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

        <!-- Header Filter -->
        <v-row no-gutters class="w-100 align-center mb-4">
            <v-col cols="9">
                <v-select v-model="selectedOrderByMonthsAvailable" :items="[
                    { title: 'Bulan', value: 'month' },
                    { title: 'Total Energi', value: 'energy' }
                ]" density="compact" variant="outlined" label="Urutkan Berdasarkan" hide-details />
            </v-col>
            <v-col cols="3" class="d-flex justify-end">
                <v-btn icon @click="toggleSortMonth" class="ma-0">
                    <v-icon>
                        {{ selectedSortTypeMonthList === 'ASC' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                    </v-icon>
                </v-btn>
            </v-col>
        </v-row>

        <!-- Daftar Bulan -->
        <v-list dense class="w-100">
            <template v-for="(item, index) in month_list" :key="index">
                <v-list-item @click="selectMonth(item.month_number)" class="pa-2 ms-0"
                    style="  border-radius: 8px;">
                    <v-row align="center" justify="space-between" no-gutters>
                        <v-col cols="auto">
                            <span style="font-weight: bold;">{{ getMonthName(item.month_number) }}</span>
                        </v-col>
                        <v-col cols="auto" class="text-right">
                            <div style="font-size: 0.9rem;">Total Energi</div>
                            <div style="font-weight: bold;">{{ item.total_energy }} kWh</div>
                        </v-col>
                    </v-row>
                </v-list-item>
                <v-divider v-if="index !== month_list.length - 1" class="my-2" />
            </template>
        </v-list>
    </v-container>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'

const props = defineProps(['curr_device', 'year_selected'])
const emits = defineEmits(['select-month'])

const selectedOrderByMonthsAvailable = ref('month')
const selectedSortTypeMonthList = ref('ASC')
const isLoading = ref(false)

const month_list = ref([])

const month_orderBy = ref("month")
const month_sortType = ref("desc") // default sort descending

// Untuk konversi nama bulan
const getMonthName = (monthNumber) => {
    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    return monthNames[monthNumber - 1 ] || `Bulan ${monthNumber}`
}

watch(selectedOrderByMonthsAvailable, async (newVal) => {
    month_orderBy.value = newVal === 'energy' ? 'energy' : 'month'
    await getReportMonthList()
})

const toggleSortMonth = async () => {
    month_sortType.value = month_sortType.value === 'asc' ? 'desc' : 'asc'
    await getReportMonthList()
}

const getReportMonthList = async () => {
    isLoading.value = true

    const params = {
        device_id: props.curr_device.id,
        order_by: month_orderBy.value,
        sort_type: month_sortType.value,
        year: props.year_selected,
    }

    try {
        const operation = "get_report_available_months_by_year"
        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.error_code !== "000000") {
            console.error("getReportMonthList FAILED:", response_be.error_message)
            return
        }

        const responseBE = response_be.payload

        month_list.value = (responseBE.month_list || []).map(item => ({
            ...item,
            total_energy: Number(item.total_energy).toFixed(2)
        }))
    } catch (error) {
        console.error("Error fetching months:", error)
    } finally {
        isLoading.value = false
    }
}

const selectMonth = (monthSelected) => {
    emits('select-month', monthSelected)
}

watch(() => props.curr_device.id, async (newId) => {
    if (newId) {
        month_list.value = []
        await getReportMonthList()
    }
})

onMounted(async () => {
    await getReportMonthList()
})
</script>
