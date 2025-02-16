<template>
  <v-app class="bg-app">
    <!-- Jika path bukan login, tampilkan header dan footer -->
    <AppHeader v-if="showHeaderFooter" />
    
    <!-- Menampilkan halaman dinamis berdasarkan route -->
    <router-view></router-view>

    <AppFooter v-if="showHeaderFooter" />
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; // Hook untuk mendapatkan route aktif
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';

// State untuk menentukan apakah header/footer perlu ditampilkan
const showHeaderFooter = ref(true);

// Menggunakan hook useRoute untuk mengakses rute aktif
const route = useRoute();

// Memeriksa apakah rute saat ini adalah login
onMounted(() => {

  console.log("route.name: " , route.path );
  if (route.name === 'login') {
    showHeaderFooter.value = false; // Sembunyikan header dan footer pada halaman login
  } else {
    showHeaderFooter.value = true; // Tampilkan header dan footer pada halaman selain login
  }
});



</script>



<style>
body {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.bg-app {
  background-color: white !important;
}
</style>
