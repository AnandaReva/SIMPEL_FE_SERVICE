<!-- src/components/parts/Navigation.vue -->
<template>
    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'left' : undefined" temporary>
        <v-list>
            <v-list-item v-for="item in items" :key="item.value" :value="item.value" :active="isActive(item.value)"
                color="primary" @click="navigateTo(item.value)">
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

const drawer = ref(false);
const route = useRoute();
const router = useRouter();

// Ambil role dari localStorage
let userRole = null;
try {
  const userData = JSON.parse(localStorage.getItem('user_data'));
  userRole = userData?.role?.toLowerCase(); // misal "system master" -> "system master"
} catch (e) {
  console.error('Failed to parse user_data:', e);
}

// Definisi semua item menu
const allItems = [
  { title: 'Dashboard', value: 'dashboard', icon: 'mdi-view-dashboard' },
  { title: 'Monitoring', value: 'monitoring', icon: 'mdi-chart-line' },
  { title: 'Laporan', value: 'reports', icon: 'mdi-chart-bar', roleRestricted: true },
  { title: 'Perangkat', value: 'devices', icon: 'mdi-access-point', roleRestricted: true },
  { title: 'Pengguna', value: 'users', icon: 'mdi-account-group', roleRestricted: true },
  { title: 'Pengaturan', value: 'settings', icon: 'mdi-cog' },
];

// Items yang ditampilkan tergantung role
const items = computed(() => {
  return allItems.filter(item => {
    if (item.roleRestricted) {
      return userRole === 'system admin' || userRole === 'system master';
    }
    return true;
  });
});

// Cek aktif atau tidak
const isActive = (itemValue) => {
  if (route.meta.parent) {
    return route.meta.parent === itemValue;
  }
  return route.name === itemValue;
};

// Navigasi
const navigateTo = (routeName) => {
  router.push({ name: routeName });
};

// Watch route changes (opsional untuk mobile)
watch(route, () => {
  if (window.innerWidth < 960) {
    drawer.value = false;
  }
});

// Expose method to parent
defineExpose({
  toggleDrawer() {
    drawer.value = !drawer.value;
  },
});
</script>
