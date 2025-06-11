<!--parts/PopUpBox.vue  -->

<template>
    <div v-if="visible" class="popup-overlay">
        <v-card class="popup-card">
            <v-card-title class="text-h5 font-weight-bold text-center">
                {{ props.status ? props.status.toUpperCase() : "-" }}
            </v-card-title>




            <v-icon :color="properties[props.status]?.[0]" class="popUp-icon">
                {{ properties[props.status]?.[1] }}
            </v-icon>






            <p class="text-subtitle"> <strong>{{ props.errorMessage }}</strong> </p>


            <v-btn @click="close" color="primary" class="mt-4">Close</v-btn>
        </v-card>
    </div>
</template>

<script setup>

import { stringifyQuery } from 'vue-router';

const properties = {
    success: ['primary', 'mdi-check-circle'],
    error: ['error', 'mdi-alert-circle'],
    info: ['info', 'mdi-information'],
    warning: ['warning', 'mdi-alert']
};



//console.log("properties from parent: " , properties);

// Props dari parent
const props = defineProps({
    status: String,
    errorMessage: String,
    errorCode: String,
    visible: Boolean
});




console.log("Status received:", stringifyQuery(props.status));
console.log("Error message:", props.errorMessage);
console.log("Error code:", props.errorCode);
console.log("Icon class:", properties[props.status]?.[1]);


console.log("props received:", props);


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
</style>
