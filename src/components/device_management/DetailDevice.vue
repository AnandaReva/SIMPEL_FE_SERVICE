<template>
    <v-row class="fill-height ma-0">





        <v-col cols="12">

            <v-btn @click="toEditPage(curr_device_detail_data)" color="info" icon rounded="circle" elevation="2"
                class="ma-0" style="width: 48px; height: 48px;">
                <v-icon size="24">mdi-pencil</v-icon>
            </v-btn>
        </v-col>

        <v-col cols="12" class="pa-0">
            <!-- Header Detail Perangkat -->
            <v-card flat class="px-4 py-2 mb-4">
                <p class="text-h6 font-weight-medium text-center mb-0">
                    Detail Perangkat
                </p>
            </v-card>




            <!-- Konten Scrollable -->
            <div class="scrollable-content">
                <!-- Informasi Dasar Perangkat -->
                <v-card outlined class="mb-4">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Nama Perangkat</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-access-point-network</v-icon>
                                    <span>{{ curr_device_detail_data?.name || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-lock</v-icon>
                                    <span>{{ curr_device_detail_data?.password || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Interval Pembacaan (Detik)</p>
                                <v-card flat class="pa-3">
                                    {{ curr_device_detail_data?.read_interval || '-' }}
                                </v-card>
                            </v-col>


                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Ditambahkan</p>
                                <v-card flat class="pa-3">
                                    {{ FormatTimestamp(curr_device_detail_data?.create_timestamp) || '-' }}
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Terakhir</p>
                                <v-card flat class="pa-3">
                                    {{ FormatTimestamp(curr_device_detail_data?.last_timestamp) || '-' }}
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                <v-card flat class="pa-3">



                                    <span v-if="curr_device_detail_data?.status === 1"> Aktif</span>
                                    <span v-else>Tidak Aktif</span>


                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Gambar Perangkat -->
                <v-card outlined class="mb-4">
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-image</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Gambar Perangkat</span>
                    </v-card-title>
                    <v-card-text class="text-center">
                        <v-img v-if="existingImageSrc" :src="existingImageSrc" max-height="200" contain
                            class="mx-auto" />
                        <p v-else class="text-caption text-grey">Tidak ada gambar</p>
                    </v-card-text>
                </v-card>

                <!-- Data Perangkat -->
                <v-card outlined class="mb-4">
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Data Perangkat</span>
                    </v-card-title>
                    <v-card-text style="max-height: 300px; overflow-y: auto;">
                        <v-row v-for="(value, key, index) in curr_device_detail_data?.data" :key="'data-entry-' + index"
                            class="mb-2">
                            <v-col cols="5" class="pa-0 pr-2">
                                <v-card outlined class="pa-2 text-truncate">
                                    {{ key }}
                                </v-card>
                            </v-col>
                            <v-col cols="7" class="pa-0">
                                <v-card outlined class="pa-2 text-truncate">
                                    {{ value || '-' }}
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>

                </v-card>
            </div>
        </v-col>
    </v-row>

</template>



<script setup>

import { ref, watch, onMounted } from 'vue';

import { FormatTimestamp } from '@/utils/utils';

import { useRouter } from 'vue-router';



const router = useRouter();

const props = defineProps(["curr_device_detail_data"])




watch(
    () => props.curr_device_detail_data,
    (newVal, oldVal) => {
        console.log('Data perangkat diperbarui di Detaildevice', newVal);
        // misalnya kamu ingin fetch ulang detail atau update tampilan
    },
    { deep: true, immediate: true }
);


function toEditPage(currDeviceDetailDataParam) {
    console.log("---toEditPage---")
    console.log("toEditPage - currDeviceDetailDataParam: ", currDeviceDetailDataParam)

    if (!currDeviceDetailDataParam.id || currDeviceDetailDataParam.id <= 0) {
        console.log("toEditPage - currDeviceDetailDataParam.id not valid: ", currDeviceDetailDataParam.id)
        return;
    }

    sessionStorage.setItem("curr_device_selected", JSON.stringify(currDeviceDetailDataParam))


    router.push({
        name: "device-edit",
        params: {
            device_name: currDeviceDetailDataParam.name,
        }
    })
}


onMounted(() => {

    console.log("detail perangkat - curr_device_detail_data", props.curr_device_detail_data)

});




</script>