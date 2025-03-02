<!--parts/PopUpBox.vue  -->

<template>
    <div v-if="visible" class="popup-overlay">
        <v-card class="popup-card">
            <v-card-title class="text-h5 font-weight-bold text-center">
                {{ props.status ? props.status.charAt(0).toUpperCase() + props.status.slice(1) : "-" }}
            </v-card-title>





            <v-icon color="properties.status" class="popUp-icon .w-50">
                {{ properties[props.status]?.[1] }}
            </v-icon>





            <p class="text-subtitle"> <strong>{{ props.errorCode }}</strong> </p>
            <p class="text-body">{{ props.errorMessage }}</p>

            <v-btn @click="close" color="primary" class="mt-4">Close</v-btn>
        </v-card>
    </div>
</template>

<script setup>
import { stringifyQuery } from 'vue-router';

const properties = {
    info: ['info', 'mdi-information']
};


//console.log("properties from parent: " , properties);

// Props dari parent
const props = defineProps({
    status: String,
    message: String,
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
