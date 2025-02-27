<template>
    <div class="device-list">
        <p class="text-subtitle-2 font-weight-bold">Total hasil: {{ totalDevices }}</p>

        <v-list bg-color="white" dense class="rounded-lg elevation-2">
            <template v-if="devices && devices.length > 0">
                <template v-for="(device, index) in devices" :key="device.device_id">
                    <v-list-item 
                        @click="selectDevice(device)" 
                        class="device-item"
                        :disabled="device.device_st === 0"
                        :class="{ 
                            'selected-device': device.device_id === currDeviceId,
                            'disabled-device': device.device_st === 0
                        }"
                    >
                        <v-row align="center" no-gutters>
                            <!-- Icon -->
                            <v-col cols="2" class="d-flex justify-center">
                                <v-img :src="IoTIcon" class="device-icon" max-width="24" height="24" contain />
                            </v-col>

                            <!-- Nama Device -->
                            <v-col cols="5">
                                <v-list-item-title class="text-body-2 font-weight-medium">
                                    {{ device.device_name }}
                                </v-list-item-title>
                            </v-col>

                            <!-- st -->
                            <v-col cols="3" class="d-flex align-center">
                                <v-icon v-if="device.device_st == 1" color="green" class="mr-1" size="16">
                                    mdi-checkbox-blank-circle
                                </v-icon>
                                <span :class="device.device_st == 1 ? 'text-green' : 'text-grey'">
                                    {{ device.device_st == 1 ? 'Aktif' : 'Non-aktif' }}
                                </span>
                            </v-col>

                            <!-- Aktivitas Terakhir -->
                            <v-col cols="2" class="text-right text-caption text-grey-darken-1">
                                {{ formatTimestamp(device.device_last_tstamp) || '-' }}
                            </v-col>
                        </v-row>
                    </v-list-item>
                    <v-divider class="mx-4" />
                </template>
            </template>

            <!-- Jika Tidak Ada Device -->
            <template v-else>
                <v-list-item>
                    <v-list-item-title class="text-center text-grey">No device available</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<script setup>
import IoTIcon from '@/assets/images/IoTIcon.png';

const props = defineProps(['devices', 'currDeviceId', 'totalDevices']);
const emit = defineEmits(['select-device']);

function selectDevice(data) {
    if (data.device_st === 0) return; // Cegah pemilihan jika non-aktif
    console.log(`Device Selected: ${data.device_id} - ${data.device_name}`);
    emit('select-device', data.device_id, data.device_name);
}

// Fungsi untuk mengonversi epoch timestamp ke format waktu lokal
const formatTimestamp = (epoch) => {
    if (!epoch) return '-';
    const date = new Date(epoch * 1000);
    return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
</script>

<style scoped>
.device-list {
    padding: 12px;
}

.device-item {
    transition: background-color 0.2s;
}

.device-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
}

/* Perangkat yang dipilih memiliki latar belakang biru */
.selected-device {
    background-color: rgba(33, 150, 243, 0.25) !important;
}

/* Perangkat yang non-aktif menjadi lebih gelap dan tidak bisa dipilih */
.disabled-device {
    opacity: 0.5;
    pointer-events: none;
}

.device-icon {
    border-radius: 50%;
}

.text-green {
    color: green;
}

.text-grey {
    color: gray;
}
</style>
