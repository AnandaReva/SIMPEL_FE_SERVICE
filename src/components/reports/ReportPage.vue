<template>
    <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
        <!-- Overlay Loading -->
        <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
            <v-progress-circular indeterminate color="primary" size="64" />
        </v-overlay>

        <!-- Laporan Bulanan -->
        <v-card color="base" elevation="2" rounded="xl" class="fill-height pa-4 w-100 custom-height-card">
            <v-container height="100%">
                <!-- Dialog: Pilih Tahun -->
                <v-dialog v-model="isShowYearSelector" max-width="500">
                    <v-card color="base">
                        <v-card-title class="d-flex justify-space-between align-center">
                            <span class="text-h6">Pilih Tahun</span>
                            <v-btn icon @click="isShowYearSelector = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <ReportAvailableYearTable @select-year="selectYear" />
                        </v-card-text>
                    </v-card>
                </v-dialog>

                <!-- Dialog: Pilih Bulan -->
                <v-dialog v-model="isShowMonthSelector" max-width="500">
                    <v-card color="base">
                        <v-card-title class="d-flex justify-space-between align-center">
                            <span class="text-h6">Pilih Bulan</span>
                            <v-btn icon @click="isShowMonthSelector = false">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-card-title>
                        <v-card-text>
                            <ReportAvailableMonthList :year_selected="year_selected" @select-month="selectMonth" />
                        </v-card-text>
                    </v-card>
                </v-dialog>

                <v-row justify="center" class="pa-4">
                    <!-- Pilih / Ganti Tahun -->
                    <v-col cols="3">
                        <v-btn block :color="year_selected ? 'primary' : 'info'" @click="handleShowYearSelector">
                            {{ year_selected ? 'Ganti Tahun' : 'Pilih Tahun' }}
                        </v-btn>
                    </v-col>

                    <!-- Pilih / Ganti Bulan -->
                    <v-col cols="3">
                        <v-btn block :disabled="!year_selected" :color="month_selected ? 'primary' : 'info'"
                            @click="handleShowMonthSelector">
                            {{ month_selected ? 'Ganti Bulan' : 'Pilih Bulan' }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row align="center" justify="space-between" class="px-4">
                    <v-col cols="12">
                        <v-card-title class="text-h5 font-weight-medium text-black text-center">
                            <v-row align="center" justify="space-between">
                                <!-- Total perangkat di tengah -->
                                <v-col cols="12" class="text-center">
                                    Total Perangkat: {{ total_devices }}
                                </v-col>

                                <!-- Kanan: Lihat Detail + tombol -->
                                <v-col cols="auto" class="position-absolute" style="right: 24px; top: 12px;">
                                    <div class="d-flex align-center">
                                        <span class="text-caption mr-2">Lihat Detail Setiap Perangkat</span>
                                        <v-btn icon color="primary" class="rounded-circle"
                                            style="width: 36px; height: 36px;" @click="toDeviceDetailedReportPage">
                                            <v-icon>mdi-magnify</v-icon>
                                        </v-btn>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-card-title>
                    </v-col>
                </v-row>


                <v-row class="fill-height">
                    <v-col cols="12">
                        <div style="width: 100%;">
                            <!-- Jika perangkat dipilih -->
                            <template v-if="total_devices > 0">
                                <!-- Jika year_selected TIDAK ADA -->
                                <div v-if="!year_selected" style="overflow-x: auto; width: 100%;">
                                    <v-col class="d-flex align-center justify-center" style="width: 100%;">
                                        <ReportYearlyChart style="width: 100%;" />
                                    </v-col>
                                </div>

                                <!-- Jika year_selected_detail ADA dan month_selected tidak ada -->
                                <div
                                    v-else-if="year_selected && year_selected_detail && Object.keys(year_selected_detail).length && !month_selected">
                                    <v-col class="d-flex align-center justify-center" style="width: 100%;">
                                        <ReportYearDetail :year_selected_detail="year_selected_detail" />
                                    </v-col>
                                </div>

                                <!-- Jika month_selected_detail ADA -->
                                <div
                                    v-else-if="month_selected && month_selected_detail && Object.keys(month_selected_detail).length">
                                    <v-col class="d-flex align-center justify-center" style="width: 100%;">
                                        <ReportMonthDetail :month_selected_detail="month_selected_detail" />
                                    </v-col>
                                </div>
                            </template>

                            <!-- Jika tidak ada data -->
                            <v-row v-else class="fill-height" align="center" justify="center">
                                <v-col cols="auto">
                                    <v-card elevation="2" class="mb-6 mx-auto" max-width="400">
                                        <v-col class="d-flex align-center justify-center">
                                            <v-icon size="64" color="grey">mdi-chart-bar</v-icon>
                                        </v-col>
                                        <v-col class="d-flex align-center justify-center">
                                            <p class="text-h6 mt-4 mb-6">Tidak ada data tersedia</p>
                                        </v-col>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </div>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>

        <!-- Pop-up Error -->
        <PopUpInfoBox v-if="popUpInfoVisible" :status="popUpInfoProps.status"
            :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
            :visible="popUpInfoVisible" @close="closePopup" />
    </v-container>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import ReportAvailableYearTable from './all_devices/year/ReportAvailableYearTable.vue'
import ReportAvailableMonthList from './all_devices/month/ReportAvailableMonthList.vue'

import ReportYearlyChart from './all_devices/year/ReportYearlyChart.vue'
import ReportYearDetail from './all_devices/year/ReportYearDetail.vue'
import ReportMonthDetail from './all_devices/month/ReportMonthDetail.vue'
import PopUpInfoBox from '../parts/PopUpInfoBox.vue'

const route = useRoute()
const router = useRouter()

// State management
const isLoading = ref(false)
const popUpInfoProps = ref({ status: '', errorMessage: '', errorCode: '' })
const popUpInfoVisible = ref(false)
const closePopup = () => (popUpInfoVisible.value = false)

// Device data
const total_devices = ref(0)
const user_role = ref('')

// Year selection
const isShowYearSelector = ref(false)
const year_selected = ref(null)
const year_selected_detail = ref({})
const isFetchingYearDetail = ref(false)

// Month selection
const isShowMonthSelector = ref(false)
const month_selected = ref(null)
const month_selected_detail = ref({})
const isFetchingMonthDetail = ref(false)

// Dialog handlers
const handleShowYearSelector = () => {
    isShowYearSelector.value = true
}

const handleShowMonthSelector = () => {
    isShowMonthSelector.value = true
}

// Year selection handler
const selectYear = (yearSelected) => {
    if (!yearSelected) {
        console.error("Invalid year selected")
        return
    }

    // Reset previous selections
    year_selected_detail.value = {}
    month_selected.value = null
    month_selected_detail.value = {}

    year_selected.value = yearSelected
    isShowYearSelector.value = false
    getReportYearDetail()
}

// Month selection handler
const selectMonth = (monthSelected) => {
    if (!monthSelected) {
        console.error("Invalid month selected")
        return
    }
    month_selected.value = monthSelected
    isShowMonthSelector.value = false
    getReportMonthDetail()
}

// API Calls
const getReportYearDetail = async () => {
    if (isFetchingYearDetail.value) return

    isFetchingYearDetail.value = true
    isLoading.value = true

    try {
        const operation = "get_report_all_devices_year_detail"
        const params = { year: year_selected.value }
        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.status !== "success") {
            console.error("getReportYearDetail FAILED:", response_be.error_message)
            popUpInfoProps.value = {
                status: "error",
                errorMessage: `Gagal Mendapatkan Data Tahun ${year_selected.value} untuk Semua Perangkat`,
                errorCode: response_be.error_code,
            }
            popUpInfoVisible.value = true
            return
        }

        year_selected_detail.value = response_be.payload.year_detail || {}
    } catch (error) {
        console.error("Error fetching year Detail:", error)
    } finally {
        isFetchingYearDetail.value = false
        isLoading.value = false
    }
}

const getReportMonthDetail = async () => {
    if (isFetchingMonthDetail.value) return

    isFetchingMonthDetail.value = true
    isLoading.value = true

    try {
        const operation = "get_report_all_devices_month_detail"
        const params = {
            year: year_selected.value,
            month: month_selected.value,
        }
        const response_be = await Process(BASE_API_URL, operation, params)

        if (response_be.status !== "success") {
            console.error("getReportMonthDetail FAILED:", response_be.error_message)
            popUpInfoProps.value = {
                status: "error",
                errorMessage: `Gagal Mendapatkan Data Bulan ${month_selected.value} untuk Semua Perangkat`,
                errorCode: response_be.error_code,
            }
            popUpInfoVisible.value = true
            return
        }

        month_selected_detail.value = response_be.payload.month_detail || {}
    } catch (error) {
        console.error("Error fetching month Detail:", error)
    } finally {
        isFetchingMonthDetail.value = false
        isLoading.value = false
    }
}

const getDeviceCount = async () => {
    isLoading.value = true

    try {
        const operation = "get_device_count"
        const response_be = await Process(BASE_API_URL, operation, {})

        if (response_be.status !== "success") {
            console.error("getDeviceCount FAILED:", response_be.error_message)
            popUpInfoProps.value = {
                status: "error",
                errorMessage: "Gagal Mendapatkan Data Jumlah perangkat terdaftar",
                errorCode: response_be.error_code,
            }
            popUpInfoVisible.value = true
            return
        }

        total_devices.value = response_be.payload.total_devices || 0
    } catch (error) {
        console.error("Error fetching device count:", error)
    } finally {
        isLoading.value = false
    }
}


///////////////////////////////////////////////

function toDeviceDetailedReportPage() {
    router.push({ name: "report-device" });

}


//////////////////////////////////////////////////

// Lifecycle hooks
onMounted(() => {
    // Ambil data pengguna dari localStorage
    const user_data = JSON.parse(localStorage.getItem('user_data'))
    user_role.value = user_data?.role

    // Cek otorisasi role
    if (!["system master", "system admin"].includes(user_role.value)) {
        router.push({ name: "monitoring" })
        return
    }

    // Tetapkan bulan dan tahun saat ini
    const now = new Date()
    month_selected.value = now.getMonth() + 1  // getMonth() => 0-11
    year_selected.value = now.getFullYear()

    // Ambil jumlah perangkat dan jika ada, lanjutkan
    getDeviceCount().then(() => {
        if (total_devices.value > 0) {
            // Validasi bulan
            if (month_selected.value >= 1 && month_selected.value <= 12) {
                console.log('Inisialisasi:', {
                    month: month_selected.value,
                    year: year_selected.value
                })
                getReportMonthDetail()
            } else {
                console.warn("Bulan tidak valid:", month_selected.value)
            }
        } else {
            console.info("Tidak ada perangkat terdaftar.")
        }
    }).catch(err => {
        console.error("Gagal mengambil jumlah perangkat:", err)
    })
})

</script>

<style scoped>
.disable-interactions {
    pointer-events: none;
    opacity: 0.7;
}
</style>