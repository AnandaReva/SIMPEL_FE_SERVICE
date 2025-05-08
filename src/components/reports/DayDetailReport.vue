<template>
  <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
    <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

    <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">
      <v-row align="center" justify="space-between" class="mb-4 mx-0">
        <v-btn @click="backToMonthlyReport" color="primary" class="d-flex align-center" style="max-height: 50px">
          <v-icon left>mdi-arrow-left-bold</v-icon>
          Kembali ke Laporan Bulanan
        </v-btn>
        <v-card-title class="text-h4 font-weight-bold text-black mb-0 px-0">{{ curr_device.name }}</v-card-title>
        <v-card-title class="text-h5 font-weight-bold text-primary mb-0 px-0">
          📊 LAPORAN TANGGAL {{ formattedDate }} {{ curr_date_day }} {{ curr_month_name.toUpperCase() }} {{ curr_year }}
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

      <!-- Tabel Laporan -->

      <v-card class="mb-6" elevation="2">
        <v-card-title color="primary" class="text-h6 font-weight-bold">Detail</v-card-title>
        <div class="table-container">

          <v-data-table-server :items="hour_list" :items-length="hour_list.length"
            v-model:items-per-page="hour_list.length" class="elevation-1 text-body-2" dense
            no-data-text="Tidak ada data tahun yang tersedia.">

            <!-- Custom header with sub-headers -->
            <template #headers>
              <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Jam</th>
                <th rowspan="2">Waktu Pertama (menit:detik)</th>
                <th rowspan="2">Waktu Terakhir (menit:detik)</th>
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
                <td class="text-center">{{ item.hour_num }}</td>
                <td class="text-center">{{ item.first_record_timestamp }}</td>
                <td class="text-center">{{ item.last_record_timestamp }}</td>
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
                  <v-btn size="x-small" variant="text" color="primary" @click="selectMonth(item.month_number)">
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
                  <v-btn size="small" color="success" variant="text" @click.stop="downloadData('excel', item.month)">
                    <v-icon start>mdi-file-excel</v-icon> Excel
                  </v-btn>
                </td>
              </tr>
            </template>
          </v-data-table-server>
        </div>
      </v-card>





      <PopUpInfoBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
        :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import { FormatSize, FormatToLocal, GetLocalTimeZone } from '@/utils/utils'
import { useRoute, useRouter } from 'vue-router'
import CanvasJS from '@canvasjs/charts'

const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const popUpProps = ref({ status: '', errorMessage: '', errorCode: '' })
const popupVisible = ref(false)
const closePopup = () => (popupVisible.value = false)

const curr_device = ref({ id: null, name: null })
const curr_year = ref(null)
const curr_month = ref(null)
const curr_date_day = ref(null);
const curr_day_detail = ref({})


const day_data = ref({})
const hour_list = ref([])


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



function FormatToMinuteSecondOnly(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${minutes}:${seconds}`;
}



const getReportDayDetail = async () => {
  isLoading.value = true
  try {
    const params = {
      year: curr_year.value,
      month: curr_month.value,
      day_date: curr_date_day.value,
      device_id: curr_device.value.id
    }

    const response = await Process(BASE_API_URL, 'get_report_day_detail', params)
    console.log('get_report_day_detail - params: ', params)
    console.log('get_report_day_detail - response: ', response)

    if (response.status !== 'success') {
      throw new Error(response.error_message || 'Gagal mendapatkan data detail harian')
    }

    const responsePayload = response.payload
    const localTZ = GetLocalTimeZone()

    curr_day_detail.value = {
      device_id: responsePayload.device_id,
      device_name: curr_device.value?.name || '-',
      day_num: responsePayload.day_num,
      date: new Date(responsePayload.day_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      total_data: responsePayload.total_data,
      total_size_bytes: responsePayload.total_size_bytes,
      energy_consumed_count: responsePayload.energy_consumption, // <- dari BE
      data_interval: responsePayload.data_interval,
      first_record_timestamp: FormatToTimeOnly(responsePayload.first_record_timestamp),
      last_record_timestamp: FormatToTimeOnly(responsePayload.last_record_timestamp),
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


    hour_list.value = (response.payload.hour_list || []).map((hour) => {
      return {
        hour_num: hour.hour,

        // Ambil hanya menit dan detik
        first_record_timestamp: FormatToMinuteSecondOnly(hour.first_timestamp),
        last_record_timestamp: FormatToMinuteSecondOnly(hour.last_timestamp),

        energy_consumed_count: hour.energy_consumed,
        total_data: hour.total_data,
        data_interval: hour.data_interval || null, // jika tidak tersedia, default ke null
        total_size_bytes: hour.total_size_bytes,

        voltage: {
          avg: hour.avg_voltage,
          min: hour.min_voltage,
          max: hour.max_voltage,
        },
        current: {
          avg: hour.avg_current,
          min: hour.min_current,
          max: hour.max_current,
        },
        power: {
          avg: hour.avg_power,
          min: hour.min_power,
          max: hour.max_power,
        },
        frequency: {
          avg: hour.avg_frequency,
          min: hour.min_frequency,
          max: hour.max_frequency,
        },
        power_factor: {
          avg: hour.avg_power_factor,
          min: hour.min_power_factor,
          max: hour.max_power_factor,
        }
      };
    });


  } catch (error) {
    console.error("❌ getReportDayDetail error:", error)
    popUpProps.value = {
      status: 'error',
      errorMessage: error.message || 'Terjadi kesalahan saat mengambil detail harian',
      errorCode: error.errorCode || 'UNKNOWN_ERROR'
    }
    popupVisible.value = true
  } finally {
    isLoading.value = false
  }
}

function backToReportPage() {
  router.push({ name: 'report-daily', params: { year: curr_year.value, month: curr_month.value } })
}

onMounted(() => {
  const savedDevice = localStorage.getItem('report')
  if (savedDevice) {
    const parsed = JSON.parse(savedDevice)
    if (parsed && parsed.device) {
      curr_device.value.id = parsed.device.device_id
      curr_device.value.name = parsed.device.device_name
    }
  }
  curr_year.value = parseInt(route.params.year)
  curr_month.value = parseInt(route.params.month)
  curr_date_day.value = parseInt(route.params.curr_date_day)
  if (curr_device.value.id && curr_year.value && curr_month.value && curr_date_day.value) {
    getReportDayDetail()
  }
})
</script>
