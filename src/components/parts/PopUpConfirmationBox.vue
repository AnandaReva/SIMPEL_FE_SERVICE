<template>
    <div v-if="visible" class="popup-overlay">
        <v-card class="popup-card">
            <v-card-title class="text-h5 font-weight-bold text-center">
                {{ title }}
            </v-card-title>

            <v-icon :color="iconColor" class="popUp-icon">
                {{ iconName }}
            </v-icon>

            <p class="text-body">{{ message }}</p>

            <div class="popup-actions">
                <v-btn color="primary" @click="confirm">Ya</v-btn>
                <v-btn color="error" @click="cancel">Batal</v-btn>
            </div>
        </v-card>
    </div>
</template>

<script setup>


import {  computed } from 'vue'

const props = defineProps({
    title: String,
    message: String,
    status: {
        type: String,
        default: 'info',
    },
    visible: Boolean,
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => emit('confirm');
const cancel = () => emit('cancel');

const statusProperties = {
    success: ['primary', 'mdi-check-circle'],
    error: ['error', 'mdi-alert-circle'],
    info: ['info', 'mdi-information'],
    warning: ['warning', 'mdi-alert'],
};

const iconColor = computed(() => statusProperties[props.status]?.[0] || 'info');
const iconName = computed(() => statusProperties[props.status]?.[1] || 'mdi-information');
</script>

<style scoped>
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.popup-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    min-width: 300px;
    max-width: 400px;
    text-align: center;
}

.popUp-icon {
    font-size: 100px;
    margin: 10px 20px;
}

.popup-actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-around;
}
</style>
