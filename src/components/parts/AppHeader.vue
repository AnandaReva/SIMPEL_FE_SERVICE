<!-- src/components/parts/AppHeader.vue -->
<template>
  <v-row class="d-flex justify-space-between align-center bg-blue-lighten-4" style="height:10vh; max-height:10vh; overflow:hidden;">
    <!-- Drawer toggle button -->
    <v-app-bar-nav-icon variant="text" @click.stop="$emit('toggle-navigation-drawer')" />

    <!-- Left side: Title -->
    <v-col cols="auto">
      <h1 class="text-h5 font-weight-medium text-[2.5vh]">SIMPLE</h1>
    </v-col>

    <v-spacer />

    <!-- User Information (Right side) -->
    <div class="pa-3">
      <v-col cols="auto">
        <v-row align="center">
          <!-- Avatar -->
          <v-avatar size="40" color="primary" class="mr-2" style="height:4vh; width:4vh; font-size:2vh;">
            <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" />
            <span v-else>{{ user?.full_name?.charAt(0) || "?" }}</span>
          </v-avatar>

          <!-- User Info -->
          <div>
            <p class="text-subtitle-1 font-weight-bold text-[1.8vh] m-0">
              {{ user?.full_name || "Guest" }}
            </p>
            <p class="text-subtitle-2 text-grey-darken-1 text-[1.5vh] m-0">
              {{ user?.role || "Guest" }}
            </p>
          </div>
        </v-row>
      </v-col>
    </div>

    <!-- Menu Icon -->
    <v-col cols="auto">
      <v-menu offset-y>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon class="ma-0 pa-0">
            <v-icon size="28" class="text-grey-darken-2">mdi-menu</v-icon>
          </v-btn>
        </template>

        <v-list class="pa-2" style="min-width: 220px">
          <v-list-item class="py-1">
            <div>
              <p class="text-caption text-grey-darken-1 mb-1">Email</p>
              <p class="text-body-2 font-weight-medium">{{ user?.email || "Guest" }}</p>
            </div>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item class="py-1">
            <div>
              <p class="text-caption text-grey-darken-1 mb-1">Username</p>
              <p class="text-body-2 font-weight-medium">{{ user?.username || "Guest" }}</p>
            </div>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item class="py-1">
            <div>
              <p class="text-caption text-grey-darken-1 mb-1">Nama Lengkap</p>
              <p class="text-body-2 font-weight-medium">{{ user?.full_name || "Guest" }}</p>
            </div>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item class="py-1">
            <div>
              <p class="text-caption text-grey-darken-1 mb-1">Peran</p>
              <p class="text-body-2 font-weight-medium">{{ user?.role || "Guest" }}</p>
            </div>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item class="py-1">
            <div class="d-flex justify-end w-100">
              <v-btn @click="logOut" variant="text" class="bg-red-lighten-4 text-red-darken-1 rounded px-3 py-2">
                <v-icon start size="20" color="red">mdi-logout</v-icon>
                Keluar
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-col>

  </v-row>
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
<!-- 
<style scoped>
.app-header {
  height: 10vh;
  max-height: 10vh;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.v-avatar {
  height: 4vh;
  width: 4vh;
  font-size: 2vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.text-h5 {
  font-size: 2.5vh;
}

.text-subtitle-1 {
  font-size: 1.8vh;
  margin: 0;
}

.text-subtitle-2 {
  font-size: 1.5vh;
  margin: 0;
  color: gray;
}

.v-icon {
  font-size: 2vh;
  cursor: pointer;
}
</style>
 -->