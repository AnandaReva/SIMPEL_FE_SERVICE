<template>
    <div class="px-4 py-2 bg-blue-lighten-5">
        <v-row align="center">
            <!-- Left side: Title -->
            <v-col cols="auto">
                <h1 class="text-h5 font-weight-medium">SIMPLE</h1>
            </v-col>

            <v-spacer></v-spacer>

            <!-- User Information (Right side) -->
            <v-col cols="auto">
                <v-row align="center">
                    <!-- Avatar -->
                    <v-avatar size="40" color="primary" class="mr-2">
                        <img v-if="user.avatar" :src="user.avatar" alt="Avatar" />
                        <span v-else>{{ user.full_name ? user.full_name.charAt(0) : '?' }}</span>
                    </v-avatar>

                    <!-- User Info -->
                    <div>
                        <p class="text-subtitle-1 font-weight-bold">{{ user.full_name }}</p>
                        <p class="text-subtitle-2 text-grey-darken-1">{{ user.role }}</p>
                    </div>
                </v-row>
            </v-col>

            <!-- Menu Icon -->
            <v-col cols="auto">
                <v-menu offset-y>
                    <template v-slot:activator="{ props }">
                        <v-icon v-bind="props">mdi-menu</v-icon>
                    </template>

                    <v-list>
                        <v-list-item @click="logOut">
                            <v-icon color="red">mdi-logout</v-icon>
                            <v-list-item-title class="text-red">Logout</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const user = ref({
    full_name: 'Guest',
    avatar: '',
    role: 'Guest',
});

onMounted(() => {
    const userData = localStorage.getItem('user_data');
    const roleData = localStorage.getItem('role');

    if (userData) {
        const parsedUser = JSON.parse(userData);
        user.value.full_name = parsedUser.full_name || 'Guest';
        user.value.avatar = parsedUser.avatar || '';
    }

    user.value.role = roleData || 'Guest';
});

function logOut() {
    // Clear localStorage
    localStorage.removeItem('user_data');
    localStorage.removeItem('role');
    // Implement logout functionality
}
</script>

<style scoped>
.text-h3 {
    font-weight: bold;
}

.text-subtitle-1 {
    font-size: 16px;
    margin: 0;
}

.text-subtitle-2 {
    font-size: 14px;
    margin: 0;
    color: gray;
}

.v-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.v-icon {
    cursor: pointer;
}
</style>
