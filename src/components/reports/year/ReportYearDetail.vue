<template>
    <v-card elevation="2" rounded="xl" class="pa-6 text-white">
   
        <v-card flat color="base" class="pa-4 text-center  mb-4">
            <h3 class="text-center text-h6 font-weight-bold ">Laporan Tahun {{ props.year_selected_detail?.year }}
            </h3>
        </v-card>


        <v-row class="mb-1" dense>
            <v-col cols="6">
                <v-card flat color="base" class="pa-4 text-center">
                    <div class="text-caption">Total Kosumsi Energi</div>
                    <div class="text-h5 font-weight-bold">{{ props.year_selected_detail?.total_energy }} <span
                            class="text-caption">kWh</span></div>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card flat color="base" class="pa-4 text-center">
                    <div class="text-caption">Total Emisi Karbon</div>
                    <div class="text-h5 font-weight-bold">±{{ props.year_selected_detail?.total_emission }} <span
                            class="text-caption">Kg</span></div>
                </v-card>
            </v-col>
        </v-row>

        <v-divider class="mb-1" />

        <v-card color="base" class="pa-4 mb-1" elevation="2" rounded="xl">
            <v-row dense>
                <!-- Kolom Kiri: Info Timestamp -->
                <v-col cols="12" md="6">
                    <div class="text-caption mb-1">Waktu Data Pertama</div>
                    <div class="text-body-2 mb-3">{{ props.year_selected_detail?.first_timestamp }}</div>

                    <div class="text-caption mb-1">Waktu Data Terakhir</div>
                    <div class="text-body-2 mb-3">{{ props.year_selected_detail?.last_timestamp }}</div>

                    <div class="text-caption mb-1">Interval Rata-rata</div>
                    <div class="text-body-2 mb-3">{{ props.year_selected_detail?.avg_data_interval }} detik</div>

                    <div class="text-caption mb-1">Jumlah Data</div>
                    <div class="text-body-2">{{ props.year_selected_detail?.total_data }} data</div>
                </v-col>

                <!-- Kolom Kanan: Info Daya, Arus, Tegangan -->
                <v-col cols="12" md="6">
                    <div class="text-caption mb-1">Daya (W)</div>
                    <div class="text-body-2 mb-1">Rata-rata: {{ props.year_selected_detail?.power.avg }}</div>
                    <div class="text-body-2 mb-3">
                        Min: {{ props.year_selected_detail?.power.min }} |
                        Maks: {{ props.year_selected_detail?.power.max }}
                    </div>

                    <div class="text-caption mb-1">Arus (A)</div>
                    <div class="text-body-2 mb-1">Rata-rata: {{ props.year_selected_detail?.current.avg }}</div>
                    <div class="text-body-2 mb-3">
                        Min: {{ props.year_selected_detail?.current.min }} |
                        Maks: {{ props.year_selected_detail?.current.max }}
                    </div>

                    <div class="text-caption mb-1">Tegangan (V)</div>
                    <div class="text-body-2 mb-1">Rata-rata: {{ props.year_selected_detail?.voltage.avg }}</div>
                    <div class="text-body-2">
                        Min: {{ props.year_selected_detail?.voltage.min }} |
                        Maks: {{ props.year_selected_detail?.voltage.max }}
                    </div>
                </v-col>
            </v-row>
        </v-card>

    </v-card>
</template>



<script setup>
import { ref, onMounted, watch } from 'vue';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';

const props = defineProps(['year_selected_detail']);





</script>