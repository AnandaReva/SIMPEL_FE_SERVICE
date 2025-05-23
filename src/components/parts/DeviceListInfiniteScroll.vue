<template>
    <v-container class="device-list px-0 ma-0">
        <p class="text-subtitle-2 font-weight-bold">
            Menampilkan: {{ devices?.length }}/{{ total_devices }}
        </p>

        <!--         {{devices  }} -->



        <v-list bg-color="white" dense class="rounded-lg elevation-2">
            <template v-if="devices?.length > 0">


                <template v-for="(device, index) in devices" :key="device.device_id">


                    <v-list-item @click="emitSelect(device)" class="device-item"
                        :class="{ 'bg-grey-lighten-1': device.device_id === curr_device?.id }">

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
                                <v-list-item-subtitle class="text-caption d-flex align-center gap-2">
                                    <div v-if="device?.device_st === 1 || device?.device_st === 0" class="d-flex align-center">
                                        <div class="rounded-circle me-2" :style="{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: device.device_st === 1 ? '#4CAF50' : '#9E9E9E'
                                        }"></div>
                                        <span class="text-caption">
                                            {{ device.device_st === 1 ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </div>
                                    <div v-else>-</div>

                                    <template v-else>
                                        -
                                    </template>
                                </v-list-item-subtitle>
                            </v-col>

                            <!-- Aktivitas Terakhir -->
                            <v-col cols="6" class="text-right text-caption text-grey-darken-1">
                                {{ FormatTimestamp(device.device_last_tstamp) || '-' }}
                            </v-col>
                        </v-row>
                    </v-list-item>

                    <v-divider v-if="index < devices.length - 1" class="mx-4" />
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



// Props
const props = defineProps(["devices", "total_devices", "curr_device"]);
// Emit
const emit = defineEmits(["select-device"]);



// // Fungsi pemilihan
// function selectDevice(deviceData) {
//     console.log("DeviceList.vue selectDevice id: : ", deviceData.device_id, " name: " , deviceData.device_name)
//     if (deviceData.device_st === 0) return;
//     emit("select-device", deviceData.device_id, deviceData.device_name);
// }


const emitSelect = (device) => {
    try {
        emit('select-device', {
            id: device.device_id,
            name: device.device_name
        })
    } catch (err) {
        console.error("Gagal emit select-device:", err)
    }
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