<template>
  <v-container fluid class="px-1 py-4 fill-height" :class="{ 'disable-interactions': isLoading }">
    <!-- Overlay Loading -->
    <v-overlay :model-value="isLoading" class="d-flex justify-center align-center">
      <v-progress-circular indeterminate color="primary" size="64" />
    </v-overlay>

    <!-- Laporan Bulanan -->
    <v-card color="base" elevation="2" rounded="xl" class="pa-4" style="width: 100%; height: 100%;">
      <!-- Header & Kembali -->



      <v-container v-if="curr_month_detail">



        <v-row align="center" justify="space-between" class="mb-4 mx-0">



          <v-btn @click="backToMonthlyReport" color="primary" class="d-flex align-center" style="max-height: 50px">
            <v-icon left>mdi-arrow-left-bold</v-icon>
            Kembali ke Laporan Tahun {{curr_year}}
          </v-btn><v-card-title class="text-h4 font-weight-bold text-black mb-0 px-0"> {{ curr_device.name
          }}</v-card-title>
          <v-card-title class="text-h5 font-weight-bold text-primary mb-0 px-0">📊 LAPORAN BULAN {{
            GetMonthNameLocal(curr_month).toUpperCase() }} {{ curr_year
            }}</v-card-title>
        </v-row>


        <!-- {{ curr_month_detail }} -->


        <!-- Summary Card -->
        <v-card class="mb-6" elevation="1">
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
                    <v-list-item-subtitle>{{ curr_month_detail.energy_consumed_count?.toFixed(2) ||
                      '-' }}
                      kWh</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-database-outline</v-icon>
                    </template>
                    <v-list-item-title>Jumlah Data</v-list-item-title>
                    <v-list-item-subtitle>{{ curr_month_detail.total_data || '-' }}
                      titik</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-clock-time-four-outline</v-icon>
                    </template>
                    <v-list-item-title>Rentang Waktu</v-list-item-title>
                    <v-list-item-subtitle>
                      {{
                        FormatCustomDateTime(curr_month_detail.first_record_timestamp, {
                          weekday: true,
                          day: true,
                          month: true,
                          hour: true,
                          minute: true,
                          second: true
                        })
                      }}
                      -
                      {{
                        FormatCustomDateTime(curr_month_detail.last_record_timestamp, {
                          weekday: true,
                          day: true,
                          month: true,
                          hour: true,
                          minute: true,
                          second: true
                        })
                      }}
                    </v-list-item-subtitle>
                  </v-list-item>


                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-timer-sand</v-icon>
                    </template>
                    <v-list-item-title>Interval Rata-rata</v-list-item-title>
                    <v-list-item-subtitle>{{ curr_month_detail.data_interval || '-' }}
                      detik</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template #prepend>
                      <v-icon color="primary">mdi-harddisk</v-icon>
                    </template>
                    <v-list-item-title>Ukuran Data</v-list-item-title>
                    <v-list-item-subtitle>{{ FormatSize(curr_month_detail.total_size_bytes) || '-'
                    }}</v-list-item-subtitle>
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
                        <v-col cols="4">Maks: {{ curr_month_detail.power?.max?.toFixed(2) || '-'
                        }}</v-col>
                        <v-col cols="4">Min: {{ curr_month_detail.power?.min?.toFixed(2) || '-'
                        }}</v-col>
                        <v-col cols="4">Rata-rata: {{ curr_month_detail.power?.avg?.toFixed(2) ||
                          '-' }}</v-col>
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
                        <v-col cols="4">Maks: {{ curr_month_detail.voltage?.max?.toFixed(2) ||
                          '-'
                        }}</v-col>
                        <v-col cols="4">Min: {{ curr_month_detail.voltage?.min?.toFixed(2) || '-'
                        }}</v-col>
                        <v-col cols="4">Rata-rata: {{ curr_month_detail.voltage?.avg?.toFixed(2)
                          || '-' }}</v-col>
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
                        <v-col cols="4">Maks: {{ curr_month_detail.current?.max?.toFixed(2) ||
                          '-'
                        }}</v-col>
                        <v-col cols="4">Min: {{ curr_month_detail.current?.min?.toFixed(2) || '-'
                        }}</v-col>
                        <v-col cols="4">Rata-rata: {{ curr_month_detail.current?.avg?.toFixed(2)
                          || '-' }}</v-col>
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
                        <v-col cols="4">Maks: {{ curr_month_detail.frequency?.max?.toFixed(2) ||
                          '-' }}</v-col>
                        <v-col cols="4">Min: {{ curr_month_detail.frequency?.min?.toFixed(2) ||
                          '-' }}</v-col>
                        <v-col cols="4">Rata-rata: {{
                          curr_month_detail.frequency?.avg?.toFixed(2)
                          || '-' }}</v-col>
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
                        <v-col cols="4">Maks: {{ curr_month_detail.power_factor?.max?.toFixed(2)
                          || '-' }}</v-col>
                        <v-col cols="4">Min: {{ curr_month_detail.power_factor?.min?.toFixed(2)
                          ||
                          '-' }}</v-col>
                        <v-col cols="4">Rata-rata: {{
                          curr_month_detail.power_factor?.avg?.toFixed(2) || '-' }}</v-col>
                      </v-row>
                    </v-list-item-subtitle>
                  </v-list-item>

                </v-list>
              </v-col>

            </v-row>
          </v-card-text>
        </v-card>




        <v-card class="mb-6 pa-4" elevation="1">
          <v-row>
            <v-col cols="12" md="6">
              <div id="energyChart" style="height: 250px; width: 100%;"></div>
            </v-col>
            <v-col cols="12" md="6">
              <div id="energyDonutChart" style="height: 250px; width: 100%;"></div>
            </v-col>
          </v-row>



          <v-row>
            <v-col>
              <div id="powerChart" style="height: 140px; width: 100%;"></div>
              <div id="voltageChart" style="height: 140px; width: 100%; margin-top: 12px;"></div>
              <div id="currentChart" style="height: 140px; width: 100%; margin-top: 12px;"></div>
            </v-col>

            <v-col>
              <div id="frequencyChart" style="height: 140px; width: 100%;"></div>
              <div id="powerFactorChart" style="height: 140px; width: 100%; margin-top: 12px;"></div>
            </v-col>
          </v-row>
        </v-card>






        <!-- Tabel Laporan -->

        <v-card class="mb-6" elevation="2">
          <v-card-title color="primary" class="text-h6 font-weight-bold">Detail</v-card-title>
          <div class="table-container">

            <v-data-table-server :items="day_list" :items-length="day_list.length" :items-per-page="-1"
              :items-per-page-options="[]" hide-default-footer class="elevation-1 text-body-2" dense
              no-data-text="Tidak ada data bulan yang tersedia.">

              <!-- Custom header with sub-headers -->
              <template #headers>
                <tr>
                  <th rowspan="2">No</th>
                  <th rowspan="2">Hari/tanggal</th>
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
                <!-- {{ item }} -->
                <tr>
                  <td class="text-center">{{ index + 1 }}</td>
                  <td class="text-center">{{ GetDayNameLocal(item.day_num) }}/ {{ item.day_date_num }}</td>
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
                    <v-btn size="x-small" variant="text" color="primary" @click="selectDay(item.day_date_num)">
                      <v-icon start small>mdi-eye</v-icon> Detail
                    </v-btn>
                  </td>
                  <td class="text-center">
                    <v-btn size="x-small" color="success" variant="text" class="me-2"
                      @click.stop="downloadData('csv', item.day)">
                      <v-icon start>mdi-file-delimited</v-icon> CSV
                    </v-btn>
                  </td>
                  <td class="text-center">
                    <v-btn size="small" color="success" variant="text" @click.stop="downloadData('excel', item.day)">
                      <v-icon start>mdi-file-excel</v-icon> Excel
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </div>
        </v-card>




      </v-container>
      <v-container v-else>



      </v-container>


    </v-card>

    <!-- Pop-up Error -->
    <PopUpInfoBox v-if="popupVisible" :status="popUpProps.status" :errorMessage="popUpProps.errorMessage"
      :errorCode="popUpProps.errorCode" :visible="popupVisible" @close="closePopup" />
  </v-container>
</template>



<script setup>
import { onMounted, ref, watch, computed, nextTick } from 'vue'
import { BASE_API_URL } from '@/configs/config'
import { Process } from '@/utils/requestHelper'
import { FormatSize, FormatToLocal, GetMonthNameLocal, GetDayNameLocal, FormatCustomDateTime } from '@/utils/utils'
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

const curr_month_detail = ref({})
const day_list = ref([])










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
      throw new Error(response.error_message || 'Gagal mendapatkan data harian')
    }

    const responsePayload = response.payload;

    curr_month_detail.value = {
      device_id: responsePayload.device_id,
      device_name: curr_device.value?.name || '-',
      total_data: responsePayload.total_data,
      total_size_bytes: responsePayload.total_size_bytes,
      energy_consumed_count: responsePayload.energy_consumption, // <- dari BE
      data_interval: responsePayload.data_interval,
      first_record_timestamp: responsePayload.first_record_timestamp,
      last_record_timestamp: responsePayload.last_record_timestamp,
      voltage: {
        avg: responsePayload.voltage.max,
        min: responsePayload.voltage.min,
        max: responsePayload.voltage.avg,
      },
      current: {
        avg: responsePayload.current.max,
        min: responsePayload.current.min,
        max: responsePayload.current.avg,
      },
      power: {
        avg: responsePayload.power.max,
        min: responsePayload.power.min,
        max: responsePayload.power.avg,
      },
      frequency: {
        avg: responsePayload.frequency.max,
        min: responsePayload.frequency.min,
        max: responsePayload.frequency.avg,
      },
      power_factor: {
        avg: responsePayload.power_factor.max,
        min: responsePayload.power_factor.min,
        max: responsePayload.power_factor.avg,
      },
    }


    // Gunakan langsung month_name dari API tanpa mapping
    day_list.value = (response.payload.day_list || [])
      .map(day => ({
        day_num: day.day_num,
        day_date_num: day.day_date_num,
        first_record_timestamp: day.first_record_timestamp,
        last_record_timestamp: day.last_record_timestamp,
        data_interval: day.data_interval,
        energy_consumed_count: day.energy_consumed_count,
        total_size_bytes: day.total_size_bytes,
        total_data: day.total_data,
        power: day.power,
        voltage: day.voltage,
        current: day.current,
        frequency: day.frequency,
        power_factor: day.power_factor,
      }))
      .sort((a, b) => a.month_number - b.month_number);

  } catch (error) {
    console.error('Error fetching days:', error);
    // Set popupscript jika ada kesalahan
    popUpProps.value = {
      status: 'error',
      errorMessage: 'Gagal mendapatkan data bulan ',
      errorCode: error.errorCode || 'UNKNOWN_ERROR',
    };
    popupVisible.value = true;
  } finally {
    isLoading.value = false;
  }
}

///////////////// CHART //////////////////

const chartInstances = ref([])

watch(day_list, (val) => {
  if (val.length > 0) {
    nextTick(() => {
      renderCharts()
    })
  }
})
function getYRange(dayList, key) {
  let min = Infinity;
  let max = -Infinity;

  dayList.forEach(day => {
    if (day[key]) {
      if (typeof day[key].min === 'number') {
        min = Math.min(min, day[key].min);
      }
      if (typeof day[key].max === 'number') {
        max = Math.max(max, day[key].max);
      }
    }
  });

  if (min === Infinity || max === -Infinity) {
    return { yMin: 0, yMax: 100 };
  }

  const rawRange = max - min;
  let yMin, yMax;

  if (rawRange < 1) {
    // Sangat sempit: contoh frekuensi 49.9 - 50.1
    const padding = 0.2;
    yMin = Math.floor((min - padding) * 10) / 10;
    yMax = Math.ceil((max + padding) * 10) / 10;
  } else if (rawRange < 5) {
    // Agak sempit
    const padding = 1;
    yMin = Math.floor((min - padding) / 1) * 1;
    yMax = Math.ceil((max + padding) / 1) * 1;
  } else {
    // Normal atau besar
    yMin = Math.floor(min / 10) * 10;
    yMax = Math.ceil(max / 10) * 10;

    const range = yMax - yMin;
    const minRange = 10;
    if (range < minRange) {
      const padding = (minRange - range) / 2;
      yMin = Math.floor((yMin - padding) / 10) * 10;
      yMax = Math.ceil((yMax + padding) / 10) * 10;
    }
  }

  return { yMin, yMax };
}

function renderCharts() {
  destroyCharts();

  renderEnergyChart()

  const powerRange = getYRange(day_list?.value, "power");
  renderGeneralChart("powerChart", "Daya", "power", "Daya (Watt)", "line", powerRange);

  const voltageRange = getYRange(day_list?.value, "voltage");
  renderGeneralChart("voltageChart", "Tegangan", "voltage", "Tegangan (Volt)", "line", voltageRange);

  const currentRange = getYRange(day_list?.value, "current");
  renderGeneralChart("currentChart", "Arus", "current", "Arus (Ampere)", "line", currentRange);

  const frequencyRange = getYRange(day_list?.value, "frequency");
  renderGeneralChart("frequencyChart", "Frekuensi", "frequency", "Frekuensi (Hz)", "line", frequencyRange);

  renderGeneralChart("powerFactorChart", "Power Factor", "power_factor", "Power Factor", "line", {
    yMin: 0.0,
    yMax: 1.0
  });
}


function destroyCharts() {
  chartInstances.value.forEach(chart => {
    if (chart && chart.destroy) chart.destroy()
  })
  chartInstances.value = []
}




function renderEnergyChart() {
  if (typeof CanvasJS === 'undefined') {
    console.error('CanvasJS belum dimuat.');
    return;
  }

  const weekdayColors = {
    "Senin": "#4F81BD",
    "Selasa": "#C0504D",
    "Rabu": "#9BBB59",
    "Kamis": "#8064A2",
    "Jumat": "#00B050"
  };

  // === 🔷 1. Data untuk Bar Chart (semua hari) ===
  const barDataPoints = day_list.value.map((day) => ({
    y: day.energy_consumed_count,
    label: `${day.day_date_num}`, // bisa juga pakai `day.month_name`
    indexLabelFontColor: "#444",
    indexLabelPlacement: "outside"
  }));

  const barChart = new CanvasJS.Chart("energyChart", {
    animationEnabled: true,
    theme: "light2",
    title: { text: `Konsumsi Energi Harian Bulan ${GetMonthNameLocal(curr_month.value)} Tahun ${curr_year.value}` },
    axisY: {
      title: "Energi (kWh)",
      includeZero: true
    },
    data: [{
      type: "column",
      color: "#346285",
      dataPoints: barDataPoints
    }]
  });

  barChart.render();
  chartInstances.value.push(barChart);

  // === 🟢 2. Data untuk Donut Chart (khusus Senin–Jumat) ===
  const donutDataPoints = day_list.value
    .map((day) => {
      const dayName = GetDayNameLocal(day.day_date_num);
      if (["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].includes(dayName)) {
        return {
          y: day.energy_consumed_count,
          label: `${dayName}, ${day.day_date_num}`,
          color: weekdayColors[dayName] || "#cccccc"
        };
      }
      return null;
    })
    .filter(Boolean);

  const donutChart = new CanvasJS.Chart("energyDonutChart", {
    animationEnabled: true,
    theme: "light2",
    title: { text: `Proporsi Konsumsi Energi Hari Kerja Bulan ${GetMonthNameLocal(curr_month.value)}` },
    data: [{
      type: "doughnut",
      indexLabel: "{label}: {y} kWh",
      yValueFormatString: "#,##0.##\" kWh\"",
      showInLegend: true,
      legendText: "{label}",
      dataPoints: donutDataPoints
    }]
  });

  donutChart.render();
  chartInstances.value.push(donutChart);
}




function renderGeneralChart(containerId, titleText, key, label, type = "line", options = {}) {
  console.groupCollapsed("---renderGeneralChart---")
  if (typeof CanvasJS === 'undefined') {

    console.error('renderGeneralChart - CanvasJS belum dimuat.')
    return
  }

  const labels = day_list.value.map(day => day.month_name)
  console.log("renderGeneralChart - labels: ", labels, "key: ", key);

  const datasets = [
    {
      type,
      name: `${label} Maks`,
      showInLegend: true,
      dataPoints: labels.map((label, i) => ({
        y: day_list.value[i][key]?.max ?? null,
        label
      })),
      color: "rgba(255,99,132,0.9)"
    },
    {
      type,
      name: `${label} Min`,
      showInLegend: true,
      dataPoints: labels.map((label, i) => ({
        y: day_list.value[i][key]?.min ?? null,
        label
      })),
      color: "rgba(54,162,235,0.9)"
    },
    {
      type,
      name: `${label} Rata-rata`,
      showInLegend: true,
      dataPoints: labels.map((label, i) => ({
        y: day_list.value[i][key]?.avg ?? null,
        label
      })),
      color: "rgba(75,192,192,0.9)"
    }
  ]


  console.log("renderGeneralChart - datasets: ", datasets);

  const chart = new CanvasJS.Chart(containerId, {
    animationEnabled: true,
    theme: "light2",
    title: { text: `${titleText} Harian Bulan ${GetMonthNameLocal(curr_month.value)} Tahun ${curr_year.value}` },
    axisY: {
      title: label,
      minimum: options.yMin,
      maximum: options.yMax
    },
    toolTip: {
      shared: true
    },
    legend: {
      cursor: "pointer",
      itemclick: (e) => {
        e.dataSeries.visible = !(typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible)
        e.chart.render()
      }
    },
    data: datasets
  })

  chart.render()
  chartInstances.value.push(chart)

  console.groupEnd();
}








onMounted(() => {
  console.groupCollapsed("---onMounted---");

  // Cek apakah ada data device yang tersimpan di localStorage
  const savedDevice = localStorage.getItem('report');

  const yearFromUrl = route.params.year;
  const monthFromUrl = route.params.month;

  if (savedDevice && yearFromUrl && monthFromUrl) {
    const parsedDevice = JSON.parse(savedDevice);
    if (parsedDevice && parsedDevice.device && yearFromUrl) {
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
  console.log('Month fromURL:', monthFromUrl);

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
    params: { year: Number(curr_year.value), month: Number(curr_month.value), date_day: Number(dateDaySelected) }
  });

}


function backToMonthlyReport() {
  router.push({ name: 'report-month', params: { year: curr_year.value, month: curr_month.value } })
}
</script>