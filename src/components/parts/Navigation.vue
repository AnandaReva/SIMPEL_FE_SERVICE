<!-- src/components/parts/Navigation.vue -->
<template>
  <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'left' : undefined" temporary>
    <v-list>
      <v-list-item v-for="item in items" :key="item.name" :value="item.name" :active="isActive(item.name)"
        color="primary" @click="navigateTo(item)">
        <template v-slot:prepend>
          <v-icon :icon="item.icon"></v-icon>
        </template>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Drawer state
const drawer = ref(false);
const route = useRoute();
const router = useRouter();

// Ambil role dari localStorage
let userRole = null;
try {
  const userData = JSON.parse(localStorage.getItem('user_data'));
  userRole = userData?.role?.toLowerCase();
} catch (e) {
  console.error('Failed to parse user_data:', e);
}

// Ambil tahun dan bulan saat ini
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

// Daftar route
const routeList = [
  { title: 'Monitoring', name: 'monitoring', icon: 'mdi-chart-line' },
  {
    title: 'Laporan',
    name: 'report-daily',
    params: { year: currentYear, month: currentMonth },
    icon: 'mdi-chart-bar',
    roleRestricted: true,
  },
  { title: 'Perangkat', name: 'device-management', icon: 'mdi-access-point', roleRestricted: true },
  { title: 'Pengguna', name: 'users', icon: 'mdi-account-group', roleRestricted: true },
  { title: 'Pengaturan', name: 'settings', icon: 'mdi-cog' },
];

// Filter menu berdasarkan role
const items = computed(() => {
  return routeList.filter(item => {
    if (item.roleRestricted) {
      return userRole === 'system admin' || userRole === 'system master';
    }
    return true;
  });
});

// Cek apakah menu aktif
const isActive = (itemName) => {
  if (route.meta.parent) {
    return route.meta.parent === itemName;
  }
  return route.name === itemName;
};


// Navigasi ke route
const navigateTo = (item) => {
  if (item.params) {
    router.push({ name: item.name, params: item.params });
  } else {
    router.push({ name: item.name });
  }
};

// Auto-close drawer saat route berubah di perangkat kecil
watch(route, () => {
  if (window.innerWidth < 960) {
    drawer.value = false;
  }
});

// Fungsi yang bisa dipanggil parent
defineExpose({
  toggleDrawer() {
    drawer.value = !drawer.value;
  },
});
</script>
