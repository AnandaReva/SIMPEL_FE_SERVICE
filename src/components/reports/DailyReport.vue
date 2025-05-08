<template>
  <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
    <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>





    <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">
      <v-row align="center" justify="space-between" class="mb-4 mx-0">
        <v-btn @click="backToReportPage" color="primary" class="d-flex align-center" style="max-height: 50px">
          <v-icon left>mdi-arrow-left-bold</v-icon>
          Kembali ke Laporan Bulanan
        </v-btn>
        <v-card-title class="text-h4 font-weight-bold text-black mb-0 px-0">{{ curr_device.name }}</v-card-title>
        <v-card-title class="text-h5 font-weight-bold text-primary mb-0 px-0">
          📅 LAPORAN BULAN {{ curr_month_name.toUpperCase() }} {{ curr_year }}
        </v-card-title>
      </v-row>


      <!-- Summary Card -->
      <v-card class="mb-6" elevation="2">
        <v-card-title class="text-h6 font-weight-bold">Ringkasan</v-card-title>
        <v-card-text>
          <v-row>
            <!-- Bagian Kiri -->
            <v-col cols="12" md="6">
              <v-list density="comfortable">
                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-flash</v-icon>
                  </template>
                  <v-list-item-title>Total Konsumsi Energi</v-list-item-title>
                  <v-list-item-subtitle>{{ curr_day_detail.energy_consumed_count?.toFixed(2) || '-' }}
                    kWh</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-database-outline</v-icon>
                  </template>
                  <v-list-item-title>Jumlah Data</v-list-item-title>
                  <v-list-item-subtitle>{{ curr_day_detail.total_data || '-' }} titik</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-clock-time-four-outline</v-icon>
                  </template>
                  <v-list-item-title>Rentang Waktu</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ curr_day_detail.first_record_timestamp || '-' }} - {{ curr_day_detail.last_record_timestamp ||
                      '-' }}
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-timer-sand</v-icon>
                  </template>
                  <v-list-item-title>Interval Rata-rata</v-list-item-title>
                  <v-list-item-subtitle>{{ curr_day_detail.data_interval || '-' }} detik</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template #prepend>
                    <v-icon color="primary">mdi-harddisk</v-icon>
                  </template>
                  <v-list-item-title>Ukuran Data</v-list-item-title>
                  <v-list-item-subtitle>{{ FormatSize(curr_day_detail.total_size_bytes) || '-' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-col>

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
                      <v-col cols="4">Rata-rata: {{ curr_day_detail.frequency?.avg?.toFixed(2) || '-' }}</v-col>
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
                      <v-col cols="4">Rata-rata: {{ curr_day_detail.power_factor?.avg?.toFixed(2) || '-' }}</v-col>
                    </v-row>
                  </v-list-item-subtitle>
                </v-list-item>

              </v-list>
            </v-col>

          </v-row>
        </v-card-text>
      </v-card>
      <v-card class="mb-6" elevation="2"></v-card>


      <br />
      <div id="chartContainer" style="height: 370px; width: 100%"></div>
    </v-card>

    <PopUpInfoBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
      :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import { FormatSize, FormatToLocal, GetLocalTimeZone } from '@/utils/utils'
import { useRoute, useRouter } from 'vue-router'
import CanvasJS from '@canvasjs/charts'


// Router
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const popUpProps = ref({ status: '', errorMessage: '', errorCode: '' })
const popupVisible = ref(false)
const closePopup = () => (popupVisible.value = false)

// Data
const curr_device = ref({ id: null, name: null })
const curr_year = ref(null)
const curr_month = ref(null)

const day_list = ref([])



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


const day_names_local = ref([
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
  { id: 7, name: 'Minggu' },
])


const getDayName = (dayNumber) => {
  const found = day_names_local.value.find(d => d.id === dayNumber)
  return found ? found.name : '-'
}



const curr_month_name = computed(() => {
  const found = month_names_local.value.find(m => m.id === curr_month.value)
  return found ? found.name : ''
})

const FormatToTimeOnly = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// Fetch Harian
const getReportDayList = async () => {
  isLoading.value = true
  try {
    const params = {
      year: curr_year.value,
      month: curr_month.value,
      device_id: curr_device.value.id,
    }
    const response = await Process(BASE_API_URL, 'get_report_day_list', params)
    console.log('get_report_day_list - params: ', params)
    console.log('get_report_day_list - response: ', response)

    if (response.status !== 'success') {
      // throw new Error(response.error_message || 'Gagal mendapatkan data harian')
    }

    let responsePayload = response.payload;
    console.log(`getReportDayList - responsePayload: `, responsePayload)

    const localTZ = GetLocalTimeZone()

    day_list.value = (response.payload.day_list || []).map((day) => {
      const firstDate = new Date(day.first_record_timestamp)
      const lastDate = new Date(day.last_record_timestamp)

      return {
        date: `${firstDate.toLocaleDateString('id-ID', { weekday: 'long' })}, ${firstDate.toLocaleDateString('id-ID')}`,

        day_date_num: day.day_num,
        day_num: day.day_num,
        // day_name: getDayName(day.day_number),

        first_record_time: FormatToTimeOnly(day.first_record_timestamp),
        last_record_time: FormatToTimeOnly(day.last_record_timestamp),

        energy_consumed_count: day.energy_consumed_count,
        total_data: day.total_data,
        data_interval: day.data_interval,
        total_size_bytes: day.total_size_bytes,

        voltage: day.voltage,
        current: day.current,
        power: day.power,
        frequency: day.frequency,
        power_factor: day.power_factor
      }
    })


  } catch (error) {
    console.error("❌ getReportDayList error:", error); // Tambahkan ini
    popUpProps.value = {
      status: 'error',
      errorMessage: 'Gagal mendapatkan data harian',
      errorCode: error.errorCode || 'UNKNOWN_ERROR',
    }
    popupVisible.value = true
  }
  finally {
    isLoading.value = false
  }
}


// Chart
watch(day_list, (val) => {
  if (val.length > 0) renderCanvasChart()
})

function renderCanvasChart() {
  const dataPoints = day_list.value.map((day) => ({
    y: day.energy_consumed_count,
    label: FormatToLocal(day.date, 'Asia/Jakarta').split(',')[0],
  }))

  const chart = new CanvasJS.Chart('chartContainer', {
    animationEnabled: true,
    theme: 'light2',
    title: {
      text: `Penggunaan Listrik Harian - ${curr_month_name.value}`,
    },
    axisY: {
      title: 'Energi (kWh)',
      includeZero: true,
    },
    data: [
      {
        type: 'column',
        color: '#346285',
        dataPoints: dataPoints,
      },
    ],
  })

  chart.render()
}

// OnMounted
onMounted(() => {
  console.groupCollapsed("---onMounted---");

  // Cek apakah ada data device yang tersimpan di localStorage
  const savedDevice = localStorage.getItem('report');

  const yearFromUrl = route.params.year;
  const monthFromUrl = route.params.month;


  if (savedDevice && yearFromUrl) {
    const parsedDevice = JSON.parse(savedDevice);
    if (parsedDevice && parsedDevice.device && yearFromUrl && monthFromUrl) {
      curr_device.value.id = Number(parsedDevice.device.device_id);
      curr_device.value.name = parsedDevice.device.device_name;
      curr_year.value = parseInt(yearFromUrl);
      curr_month.value = parseInt(monthFromUrl);

      getReportDayList();
    }

  }


  console.log('Device ID from localStorage:', curr_device.value.id);
  console.log('Device Name from localStorage:', curr_device.value.name);
  console.log('Year fromURL:', yearFromUrl);
  console.log('month fromURL:', monthFromUrl);


  console.groupEnd();
});

// Placeholder untuk aksi Detail
function selectDay(dateDaySelected) {
  console.groupCollapsed('Lihat detail:', dateDaySelected)

  console.log("---Day---")
  console.log("selectMonth - dateDaySelected: ", dateDaySelected);

  // Assuming curr_device is a reactive reference (e.g., Vue ref) or an object containing device details
  console.log("selectDay - device_id: ", curr_device.value.id);  // Access device_id correctly

  // Navigate to the reportYear route with dynamic parameters
  router.push({
    name: 'report-daily-detail',
    params: { year: Number(curr_year.value), month: Number(curr_month.value), curr_date_day: Number(dateDaySelected) }
  });

}

function backToReportPage() {
  router.push({ name: 'report-month', params: { year: curr_year.value } })
}
</script>