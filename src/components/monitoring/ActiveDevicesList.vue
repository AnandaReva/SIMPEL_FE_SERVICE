<template>
    <div>



        <p class="text-subtitle-2"> total : {{ totalActiveDevices }}</p>
        <v-list bg-color="white">

            <template v-if="activeDevices && activeDevices.length > 0">

                <template v-for="(activeDevice, index) in activeDevices" :key="activeDevice.device_id"
                    class="pa-0 ma-0">
                    <section>
                        <v-list-item
            @click="selectActiveDevice(activeDevice)"
            class="py-0 ma-0"
            :disabled="!activeDevice.device_id"
            :class="{ 'bg-grey': activeDevice.device_id === currActiveDeviceId }"
        >

                            <v-row align="center" no-gutters>
                                <v-img :src="IoTIcon" class="custom-icon mr-2" max-width="15" height="28" contain />
                                <v-list-item-title class="text-body-2">{{ activeDevice.device_name
                                }}</v-list-item-title>
                            </v-row>
                        </v-list-item>
                    </section>
                    <v-divider class="my-2" />
                </template>
            </template>
            <template v-else>
                <v-list-item>
                    <div>
                        <v-list-item-title color="primary">No active device available</v-list-item-title>
                    </div>
                </v-list-item>
            </template>
        </v-list>


    </div>

</template>


<script setup>
import { ref } from 'vue';

import IoTIcon from '@/assets/images/IoTIcon.png';

const props = defineProps(['activeDevices', 'currActiveDeviceId', 'totalActiveDevices'])
const emit = defineEmits(['select-activeDevice'])

// Method to handle click events on activeDevice list items
function selectActiveDevice(data) {
    console.log(`device ID clicked: ${data.device_id}`);
    emit('select-activeDevice', data.device_id); // Kirim device_id ke parent
}

</script>

<style scoped>
.parent-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    /* Make sure it takes up available space */
    overflow-y: auto;
    /* Allows scrolling if content exceeds max height */
    background-color: aliceblue;
}
</style>



<!--  <v-list-item @click="selectActiveDevice(activeDevice)" class="py-0 ma-0"
                        :disabled="!activeDevice.device_id"
                        :class="{ 'bg-grey-darken-2': activeDevice.device_id === currActiveDeviceId }"
                        style="border-top: 1px solid black; border-bottom: 1px solid black;">
                        <v-row align="center" no-gutters>
                            <v-img :src="IoTIcon" class="custom-icon mr-2" max-width="15" height="28" contain />
                            <v-list-item-title class="text-body-2">
                                {{ activeDevice.device_name }}
                            </v-list-item-title>
                        </v-row>
                    </v-list-item> -->