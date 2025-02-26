<!--parts/PopUpBox.vue  -->

<template>
    <div v-if="visible" class="popup-overlay">
        <v-card class="popup-card">
            <v-card-title class="text-h5 font-weight-bold text-center">  {{ props.status.charAt(0).toUpperCase() + props.status.slice(1) }}</v-card-title>
            
            <!-- <v-icon :name="properties[props.status]?.[1]" class="status-icon"></v-icon> -->


            <v-icon color="properties.status" class="popUp-icon .w-50"  >{{ properties[props.status]?.[1] }}</v-icon>


            

            <p v-if="props.status === 'error'" class="text-subtitle">{{ props.errorCode }}</p>
            <p class="text-body">{{ props.errorMessage }}</p>

            <v-btn @click="close" color="primary" class="mt-4">Close</v-btn>
        </v-card>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const properties = {
    success: [ 'primary', 'mdi-check-circle'],
    error: ['error', 'mdi-alert-circle'],
    info: ['info', 'mdi-information']
};


//console.log("properties from parent: " , properties);

// Props dari parent
const props = defineProps({
    status: String,
    errorMessage: String,
    errorCode: String,
    visible: Boolean
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
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
    z-index: 1000;
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





</style>
