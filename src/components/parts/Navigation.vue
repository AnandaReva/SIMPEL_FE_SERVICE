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
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const drawer = ref(false);
const route = useRoute();
const router = useRouter();

const items = [
    { title: 'Dashboard', value: 'dashboard', icon: 'mdi-view-dashboard' },
    { title: 'Laporan', value: 'reports', icon: 'mdi-chart-bar' },
    { title: 'Pengguna', value: 'users', icon: 'mdi-account-group' },
    { title: 'Pengaturan', value: 'settings', icon: 'mdi-cog' },
];
// Fungsi untuk mengecek apakah item aktif berdasarkan route saat ini
const isActive = (itemValue) => {
    // Jika route memiliki parent, bandingkan dengan parent route
    if (route.meta.parent) {
        return route.meta.parent === itemValue;
    }
    // Default comparison
    return route.name === itemValue;
};

// Fungsi untuk navigasi
const navigateTo = (routeName) => {
    router.push({ name: routeName });
};

// Watch route changes (opsional untuk mobile)
watch(route, () => {
    if (window.innerWidth < 960) { // Sesuaikan dengan breakpoint mobile Anda
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