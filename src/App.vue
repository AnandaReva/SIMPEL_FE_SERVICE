<template>
  <v-app class="bg-app">
    <!-- Jika bukan halaman login, tampilkan header dan footer -->
    <AppHeader v-if="showHeaderFooter" />

    <!-- Menampilkan halaman berdasarkan route -->
    <router-view></router-view>

    <AppFooter v-if="showHeaderFooter" />
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from './components/parts/AppHeader.vue';
import AppFooter from './components/parts/AppFooter.vue';

const showHeaderFooter = ref(true);
const route = useRoute();

// Watch perubahan route
watch(route, (newRoute) => {
  console.log("Current route:", newRoute.path);
  showHeaderFooter.value = newRoute.name !== 'login' && newRoute.name !== 'verify-otp'; // Hanya sembunyikan di halaman login dan verify-otp
}, { immediate: true }); // immediate: true agar dijalankan saat pertama kali komponen dimuat

</script>

<style>
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.bg-app {
  background-color: white !important;
}
</style>
