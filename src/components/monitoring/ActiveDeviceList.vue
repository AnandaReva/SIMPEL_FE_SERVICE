<template>
    <v-container class="device-list px-0 ma-0">
        <p class="text-subtitle-2 font-weight-bold">
            Menampilkan: {{ availableDevices.length }}/{{ totalActiveDevices }}
        </p>

        <v-list bg-color="white" dense class="rounded-lg elevation-2">
            <template v-if="availableDevices.length > 0">
                <template v-for="(device, index) in availableDevices" :key="device.device_id">
                    <v-list-item @click="selectDeviceToMonitor(device)" class="device-item">
                        <v-row align="center" no-gutters class="w-100">
                            <!-- Icon -->
                            <v-col cols="1" class="d-flex justify-center">
                                <v-img :src="IoTIcon" class="device-icon" max-width="24" height="24" contain />
                            </v-col>

                            <!-- Nama Device -->
                            <v-col cols="5">
                                <v-list-item-title class="text-body-2 font-weight-medium">
                                    {{ device.device_name }}
                                </v-list-item-title>
                            </v-col>

                            <!-- Aktivitas Terakhir -->
                            <v-col cols="6" class="text-right text-caption text-grey-darken-1">
                                {{ FormatTimestamp(device.device_last_tstamp) || '-' }}
                            </v-col>
                        </v-row>
                    </v-list-item>

                    <v-divider v-if="index < availableDevices.length - 1" class="mx-4" />
                </template>
            </template>

            <template v-else>
                <v-list-item>
                    <v-list-item-title class="text-center text-grey">No availble device</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    </v-container>
</template>

<script setup>
import IoTIcon from "@/assets/images/IoTIcon.png";
import { FormatTimestamp } from "@/utils/utils";
import { computed } from "vue";

// Props
const props = defineProps(["activeDevices", "monitoredDevices", "totalActiveDevices"]);
// Emit
const emit = defineEmits(["select-device-to-monitor"]);

// Filter device yang belum dimonitor
const availableDevices = computed(() => {
    const monitoredIds = new Set(props.monitoredDevices.map(d => d.device_id));
    return props.activeDevices.filter(d => !monitoredIds.has(d.device_id));
});

// Fungsi pemilihan
function selectDeviceToMonitor(deviceData) {
    if (deviceData.device_st === 0) return;
    emit("select-device-to-monitor", deviceData.device_id, deviceData.device_name);
}
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

.device-icon {
    border-radius: 50%;
}
</style>