<template>
    <v-container fluid class="pa-2 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">

        <h2 class="text-h5 font-weight-bold px-2" style="color: var(--v-theme-primary);"> Pengaturan</h2>

        <v-card color="base" class="pa-4 ma-2 w-100 " style="border-radius: 20px; height: 90%;">



        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isLoading = ref(false);

</script>