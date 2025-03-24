<template>
    <div class="device-list">
        <p class="text-subtitle-2 font-weight-bold">Total hasil: {{ totalDevices }}</p>

        <v-list bg-color="white" dense class="rounded-lg elevation-2">
            <template v-if="devices && devices.length > 0">
                <v-container v-for="(device, index) in devices" :key="device.device_id" class="pa-0 ma-0">
                    <v-col>
                        <v-row align="center" no-gutters class="d-flex justify-between align-center">
                            <!-- Konten List Item -->
                            <v-col cols="11">
                                <v-list-item @click="selectDevice(device)" class="device-item"
                                    :disabled="device.device_st === 0" :class="{
                                        'selected-device': device.device_id === currDeviceId,
                                        'disabled-device': device.device_st === 0,
                                    }">
                                    <v-row align="center" no-gutters>
                                        <!-- Icon -->
                                        <v-col cols="1" class="d-flex justify-center">
                                            <v-img :src="IoTIcon" class="device-icon" max-width="24" height="24"
                                                contain />
                                        </v-col>

                                        <!-- Nama Device -->
                                        <v-col cols="5">
                                            <v-list-item-title class="text-body-2 font-weight-medium">
                                                {{ device.device_name }}
                                            </v-list-item-title>
                                        </v-col>

                                        <!-- Status -->
                                        <v-col cols="3" class="d-flex align-center">
                                            <v-icon v-if="device.device_st === 1" color="green" class="mr-1" size="16">
                                                mdi-checkbox-blank-circle
                                            </v-icon>
                                            <span :class="device.device_st === 1 ? 'text-green' : 'text-grey'">
                                                {{ device.device_st === 1 ? 'Aktif' : 'Non-aktif' }}
                                            </span>
                                        </v-col>

                                        <!-- Aktivitas Terakhir -->
                                        <v-col cols="3" class="text-right text-caption text-grey-darken-1">
                                            {{ formatTimestamp(device.device_last_tstamp) || '-' }}
                                        </v-col>
                                    </v-row>
                                </v-list-item>
                            </v-col>

                            <!-- Tombol Detail -->
                            <v-col cols="1" class="d-flex align-center justify-center">
                                <v-btn @click.stop="viewDeviceDetail(device)" color="primary"
                                    class="rounded-circle detail-btn"
                                    style="max-height: 30px; width: 30px; min-width: 30px;" :disabled="false">
                                    <v-icon>mdi-eye</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-col>

                    <v-divider class="mx-4" />


                </v-container>
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
import IoTIcon from "@/assets/images/IoTIcon.png";

const props = defineProps(["devices", "currDeviceId", "totalDevices"]);
const emit = defineEmits(["select-device", "view-device-detail"]);

function selectDevice(deviceData) {
    if (deviceData.device_st === 0) return; // Cegah pemilihan jika non-aktif
    console.log(`Device Selected: ${deviceData.device_id} - ${deviceData.device_name}`);
    emit("select-device", deviceData.device_id, deviceData.device_name);
}

// Fungsi untuk navigasi ke halaman detail
function viewDeviceDetail(deviceDataDetail) {
    console.log(`Navigating to details for: ${deviceDataDetail.device_id} - ${deviceDataDetail.device_name}`);
    emit("view-device-detail", deviceDataDetail.device_id);
}

// Fungsi untuk mengonversi epoch timestamp ke format waktu lokal
const formatTimestamp = (epoch) => {
    if (!epoch) return "-";
    const date = new Date(epoch * 1000);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
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

/* Perangkat yang non-aktif tidak memiliki perubahan opacity */
.disabled-device {
    pointer-events: none;
}

/* Pastikan tombol detail tidak terpengaruh oleh disabled-device */
.detail-btn {
    pointer-events: auto !important;
    opacity: 1 !important;
    background-color: rgb(var(--v-theme-primary)) !important;
}

.detail-btn:hover {
    background-color: rgb(var(--v-theme-primary)) !important;
    opacity: 0.9 !important;
}

.detail-btn:active {
    background-color: rgb(var(--v-theme-primary)) !important;
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
