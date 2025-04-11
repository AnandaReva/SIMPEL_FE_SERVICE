<!-- src/components/parts/Navigation.vue -->
<template>
    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'left' : undefined" temporary>
        <v-list>
            <v-list-item v-for="item in items" :key="item.value" :value="item.value" color="primary">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const drawer = ref(false);
const route = useRoute();

const items = [
    { title: 'Dashboard', value: 'dashboard' },
    { title: 'Perangkat', value: 'devices' },
    { title: 'Pengguna', value: 'users' },
    { title: 'Laporan', value: 'reports' },
    { title: 'Pengaturan', value: 'settings' },
];

// Watch route changes and auto-close drawer (optional, good for mobile)
watch(route, () => {
    drawer.value = false;
});

// Expose method to parent
defineExpose({
    toggleDrawer() {
        drawer.value = !drawer.value;
    },
});
</script>
