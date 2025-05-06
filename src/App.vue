<!-- src/App.vue -->
<template>
  <v-app class="bg-app">
    <!-- Jika bukan halaman login, tampilkan header dan footer -->
    <AppHeader v-if="showHeaderFooter" @toggle-navigation-drawer="toggleDrawer" />

    <Navigation ref="navigationDrawer" />


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
import Navigation from './components/parts/Navigation.vue';

const navigationDrawer = ref(null)

const toggleDrawer = () => {
  if (navigationDrawer.value) {
    navigationDrawer.value.toggleDrawer();
  }
};

/////////////////

const showHeaderFooter = ref(true);
const route = useRoute();

const checkLocalStorage = () => {
  const userData = localStorage.getItem('user_data');
  const sessionId = localStorage.getItem('session_id');
  const sessionHash = localStorage.getItem('session_hash');

  return userData && sessionId && sessionHash;
};

const currRouteName = ref("")


// Watch perubahan route
watch(route, (newRoute) => {

  currRouteName.value = newRoute.name

  //console.log("Current route Name:", currRouteName.value);

  showHeaderFooter.value = newRoute.name !== 'login' && newRoute.name !== 'verify-otp' && newRoute.name !== 'reset-password' && checkLocalStorage()
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
