<template>
    <v-container class="user-list px-0 ma-0">
        <p class="text-subtitle-2 font-weight-bold">
            Menampilkan: {{ users?.length }}/{{ total_users }}
        </p>

        {{ users }}

        <v-list bg-color="white" dense class="rounded-lg elevation-2">
            <template v-if="users?.length > 0">


                <template v-for="(user, index) in users" :key="user.user_id">
                    <v-list-item @click="emitSelect(user)" class="user-item py-2 px-3">
                        <v-row align="center" no-gutters class="w-100">

                            <!-- Icon -->
                            <v-col cols="1" class="d-flex justify-center">
                                <v-img :src="IoTIcon" class="user-icon" max-width="24" height="24" contain />
                            </v-col>

                            <!-- Nama + Status -->
                            <v-col cols="6">
                                <v-list-item-title class="text-body-2 font-weight-medium">
                                    {{ user?.user_full_name || '-' }}
                                </v-list-item-title>
                                <v-list-item-subtitle class="text-caption d-flex align-center gap-2">
                                    <div v-if="user?.user_st === 1 || user?.user_st === 0" class="d-flex align-center">
                                        <div class="rounded-circle me-2" :style="{
                                            width: '10px',
                                            height: '10px',
                                            backgroundColor: user.user_st === 1 ? '#4CAF50' : '#9E9E9E'
                                        }"></div>
                                        <span class="text-caption">
                                            {{ user.user_st === 1 ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </div>
                                    <div v-else>-</div>

                                    <template v-else>
                                        -
                                    </template>
                                </v-list-item-subtitle>

                            </v-col>

                            <!-- Role + Last Seen -->
                            <v-col cols="5" class="text-right">
                                <div class="text-caption text-grey-darken-1">
                                    {{ user?.user_role || '-' }}
                                </div>
                                <div class="text-caption text-grey-darken-1">
                                    {{ FormatTimestamp(user.user_last_tstamp) || '-' }}
                                </div>
                            </v-col>

                        </v-row>
                    </v-list-item>

                    <v-divider v-if="index < users.length - 1" class="mx-4" />
                </template>

            </template>

            <template v-else>
                <v-list-item>
                    <v-list-item-title class="text-center text-grey">No availble user</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    </v-container>
</template>

<script setup>
import IoTIcon from "@/assets/images/IoTIcon.png";
import { FormatTimestamp } from "@/utils/utils";



// Props
const props = defineProps(["users", "total_users"]);
// Emit
const emit = defineEmits(["select-user"]);


const emitSelect = (user) => {
    try {
        emit('select-user', {
            id: user.user_id,
            name: user.user_name
        })
    } catch (err) {
        console.error("Gagal emit select-user:", err)
    }
}




</script>

<style scoped>
.user-list {
    padding: 12px;
}

.user-item {
    transition: background-color 0.2s;
}

.user-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
}

.user-icon {
    border-radius: 50%;
}
</style>