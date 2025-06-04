<!-- src/components/parts/AppHeader.vue -->
<template>
  <v-container fluid class="pa-0 ma-0 d-flex align-center justify-space-between bg-base"
    style="height:7vh; max-height:10vh; overflow:hidden;" rounded="0">




    <!-- Drawer Toggle Button -->
    <v-app-bar-nav-icon variant="text" @click.stop="$emit('toggle-navigation-drawer')" />

    <!-- Title -->
    <h1 class="text-h5 font-weight-medium text-[2.5vh] ml-3">SIMPLE</h1>

    <v-spacer />
    <!-- User Info and Menu -->
    <div class="d-flex align-center">
      <!-- Menu -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <!-- Gunakan seluruh blok avatar + user info sebagai pemicu menu -->
          <div v-bind="props" class="d-flex align-center mr-4 cursor-pointer hover:bg-grey-lighten-4 px-2 py-1 rounded"
            style="transition: background-color 0.2s;">
            <v-avatar size="40" color="primary" class="mr-2" style="height: 4vh; width: 4vh; font-size: 2vh;">
              <template v-if="user?.avatar">
                <img :src="user.avatar" alt="Avatar" />
              </template>
              <template v-else>
                {{ user?.full_name?.charAt(0) || "?" }}
              </template>
            </v-avatar>

            <div>
              <p class="text-subtitle-1 font-weight-bold text-[1.8vh] m-0">
                {{ user?.full_name || "Guest" }}
              </p>
              <p class="text-subtitle-2 text-grey-darken-1 text-[1.5vh] m-0">
                {{ user?.role || "Guest" }}
              </p>
            </div>
          </div>
        </template>

        <!-- Isi Menu -->
        <v-list class="pa-2"
          style="min-width: 250px; background-color: #f7f7f7; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">

          <!-- Header: Username -->
          <v-list-item class="py-2">
            <v-container class="d-flex align-center pa-0 ma-0">
              <v-icon class="mr-2" color="primary">mdi-account-circle</v-icon>
              <p class="text-caption text-grey-darken-1 mb-1">
                {{ user?.full_name || 'Guest User' }}
              </p>
            </v-container>
            <span class="text-caption text-grey-darken-2 mt-1 pl-8">
              {{ user?.username || 'system guest' }}
            </span>
            <v-divider class="my-2" />
          </v-list-item>

          <!-- Email -->
          <v-list-item class="py-2">
            <v-container class="d-flex align-center pa-0 ma-0">
              <v-icon class="mr-2" color="primary">mdi-email</v-icon>
              <p class="text-caption text-grey-darken-1 mb-1">Email</p>
            </v-container>
            <span class="text-caption text-grey-darken-2 mt-1 pl-8">
              {{ user?.email || 'Guest' }}
            </span>
            <v-divider class="my-2" />
          </v-list-item>

          <!-- Role -->
          <v-list-item class="py-2">
            <v-container class="d-flex align-center pa-0 ma-0">
              <v-icon class="mr-2" color="primary">mdi-shield-account</v-icon>
              <p class="text-caption text-grey-darken-1 mb-1">Peran</p>
            </v-container>
            <span class="text-caption text-grey-darken-2 mt-1 pl-8">
              {{ user?.role || 'system guest' }}
            </span>
            <v-divider class="my-2" />
          </v-list-item>

          <!-- Logout Button -->
          <v-list-item class="py-2">
            <div class="d-flex justify-end w-100">
              <v-btn @click="logOut" class="bg-red-lighten-4 text-red-darken-1 rounded px-4 py-2" variant="text">
                <v-icon start size="20" color="red">mdi-logout</v-icon>
                Keluar
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

  </v-container>
</template>


<script setup>
import { ref, onMounted } from "vue";
import { Auth_Process } from "@/utils/requestHelper"; // Sesuaikan path import jika perlu
import { BASE_AUTH_URL } from "@/configs/config"

defineEmits(['toggle-navigation-drawer'])

const user = ref({
  full_name: "Guest User",
  role: "guest",
  avatar: "",
});

const currSessionId = ref("");
const currSessionHash = ref("");

onMounted(() => {
  try {
    const userData = localStorage.getItem("user_data");
    const sessionId = localStorage.getItem("session_id");
    const sessionHash = localStorage.getItem("session_hash");

    if (userData) {
      const parsedUser = JSON.parse(userData);
      user.value = {
        full_name: parsedUser.full_name || "Guest User",
        username: parsedUser.username || "guset",
        role: parsedUser.role || "guest",
        email: parsedUser.email || "",
        avatar: parsedUser.avatar || "",
      };
    }

    currSessionId.value = sessionId || "";
    currSessionHash.value = sessionHash || "";
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
});

async function logOut() {
  await logout(currSessionId.value, currSessionHash.value);

  // Hapus sesi dari localStorage
  localStorage.removeItem("user_data");
  localStorage.removeItem("session_id");
  localStorage.removeItem("session_hash");

  // Redirect ke halaman login jika menggunakan Vue Router
  window.location.href = "/login";
}

async function logout(sessionId, sessionHash) {
  if (!sessionId || !sessionHash) {
    console.error("LOGOUT FAILED!!: Missing session credentials");
    return;
  }

  const baseUrl = BASE_AUTH_URL;
  const operation = "logout";
  const params = {
    session_id: sessionId,
    session_hash: sessionHash,
  };

  console.log("Logout params:", params);
  try {
    const response_be = await Auth_Process(baseUrl, operation, params);

    if (response_be.status !== "success") {
      console.error("LOGOUT FAILED!!:", response_be.error_message);
      return;
    }

    console.log("LOGOUT SUCCESS!!");
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
  }
}
</script>
