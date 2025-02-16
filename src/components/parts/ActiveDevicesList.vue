<template>
    <div>
        <v-list bg-color="white">
            <template v-if="activeDevices && activeDevices.length">
                <template v-for="(activeDevice, index) in activeDevices" :key="activeDevice.device_id"
                    class="pa-0 ma-0">
                    <section v-if="isNewLetter(index)">
                        <div class="py-0 pr-4">
                            <!-- Align the span to the end -->
                            <v-row justify="end" class="pa-0 " no-gutters>
                                <span class="text-subtitle-2 font-weight-light" color="primary">
                                    {{ activeDevice.device_name }}
                                </span>
                            </v-row>
                        </div>
                    </section>
                    <section>
                        <v-list-item @click="selectActiveDevice(activeDevice)" class="py-0 ma-0"
                            :disabled="!activeDevice.device_id">

                            <v-row align="center" no-gutters>
                                <v-icon class="custom-icon mr-2" color="primary" size="28">mdi-account</v-icon>
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
const props = defineProps(['activeDevices', 'currActiveDeviceId'])
const emit = defineEmits(['select-activeDevice'])

// Method to handle click events on activeDevice list items
function selectActiveDevice(data) {
    console.log(`device ID clicked: ${data.device_id}`);
    emit('select-activeDevice', data);
}
</script>