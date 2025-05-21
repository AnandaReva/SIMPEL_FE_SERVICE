<template>
    <v-row class="fill-height ma-0">

        <v-col cols="12" class="d-flex align-center">
            <v-tooltip text="Edit user" location="top">
                <template #activator="{ props }">
                    <v-btn v-bind="props" @click="toEditPage(curr_user)" color="info" icon rounded="circle"
                        elevation="2" class="mr-2" style="width: 48px; height: 48px;">
                        <v-icon size="24">mdi-pencil</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>

            <v-tooltip text="Hapus user" location="top">
                <template #activator="{ props }">
                    <v-btn v-bind="props" @click="handleDeleteUser(curr_user.user_id)" color="error" icon
                        rounded="circle" elevation="2" style="width: 48px; height: 48px;">
                        <v-icon size="24">mdi-trash-can</v-icon>
                    </v-btn>
                </template>
            </v-tooltip>
        </v-col>


        {{ curr_user }}


        <v-col cols="12" class="pa-0">
            <!-- Header Detail User -->
            <v-card flat class="px-4 py-2 mb-4">
                <p class="text-h6 font-weight-medium text-center mb-0">
                    Detail User
                </p>
            </v-card>

            <!-- Konten Scrollable -->
            <div class="scrollable-content">
                <!-- Informasi Dasar User -->
                <v-card outlined class="mb-4">
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Username</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-account</v-icon>
                                    <span>{{ curr_user?.username || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6" class="mb-4">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Email</p>
                                <v-card flat class="pa-3 d-flex align-center">
                                    <v-icon size="24" color="primary" class="mr-2">mdi-email</v-icon>
                                    <span>{{ curr_user?.email || '-' }}</span>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Nama Lengkap</p>
                                <v-card flat class="pa-3">
                                    {{ curr_user?.full_name || '-' }}
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Role</p>
                                <v-card flat class="pa-3">
                                    {{ curr_user?.role || '-' }}
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                <v-card flat class="pa-3">
                                    <span v-if="curr_user?.status === 1"> Aktif</span>
                                    <span v-else>Tidak Aktif</span>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- Data Perangkat -->
                <v-card outlined class="mb-4">
                    <v-card-title class="d-flex align-center">
                        <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                        <span class="text-subtitle-1 font-weight-medium">Data Pengguna</span>
                    </v-card-title>

                    <v-card-text v-if="curr_user?.data.length > 0" style="max-height: 300px; overflow-y: auto;">
                        <!-- Judul -->


                        <v-row class="mb-2">


                            <v-col cols="5" class="pa-0 pr-2">
                                <v-container outlined class="pa-2 text-truncate font-weight-bold">
                                    Judul
                                </v-container>
                            </v-col>
                            <v-col cols="7" class="pa-0">
                                <v-container outlined class="pa-2 text-truncate font-weight-bold">
                                    Isi
                                </v-container>
                            </v-col>
                        </v-row>

                        <!-- Data lainnya -->
                        <v-row v-for="(value, key, index) in curr_user?.data" :key="'data-entry-' + index"
                            class="mb-2">
                            <v-col cols="5" class="pa-0 pr-2" color="base">
                                <v-card outlined class="pa-2 text-truncate">
                                    {{ key }}
                                </v-card>
                            </v-col>
                            <v-col cols="7" class="pa-0">
                                <v-card outlined class="pa-2 text-truncate">
                                    {{ value || '-' }}
                                </v-card>
                            </v-col>
                        </v-row>


                    </v-card-text>


                    <v-card-text v-else class="text-center">

                        <p class="text-caption text-grey">Tidak ada data</p>

                    </v-card-text>
                </v-card>

            </div>
        </v-col>
    </v-row>
</template>

<script setup>
import { watch, onMounted, computed, ref } from 'vue';
import { FormatTimestamp } from '@/utils/utils';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps(["curr_user"]);
const emit = defineEmits(['delete-user']);

function handleDeleteUser(userId) {
    console.log("Emitting delete-user with ID:", userId);
    emit("delete-user", userId);
}

watch(
    () => props.curr_user,
    (newVal, oldVal) => {
        console.log('Data user diperbarui di DetailUser', newVal);
    },
    { deep: true, immediate: true }
);

function toEditPage(currUserDetailDataParam) {
    console.log("---toEditPage---")
    console.log("toEditPage - currUserDetailDataParam: ", currUserDetailDataParam)

    if (!currUserDetailDataParam.user_id || currUserDetailDataParam.user_id <= 0) {
        console.log("toEditPage - currUserDetailDataParam.user_id not valid: ", currUserDetailDataParam.user_id)
        return;
    }

    sessionStorage.setItem("user_management", JSON.stringify(currUserDetailDataParam))

    router.push({
        name: "user-edit",
        params: {
            username: currUserDetailDataParam.username,
        }
    })
}

onMounted(() => {
    console.log("detail user - curr_user", props.curr_user)
});
</script>