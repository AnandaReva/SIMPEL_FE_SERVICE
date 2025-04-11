<template>
    <div class="activity-list pa-0 ma-0">

        <v-list bg-color="white" dense class="rounded-lg elevation-2 px-0">

            <v-row class="py-2 px-2 font-weight-bold text-caption text-grey-darken-1" no-gutters>
                <v-col cols="1">No.</v-col>
                <v-col cols="2">Aktivitas</v-col>
                <v-col cols="4">Aktor</v-col>
                <v-col>Tanggal</v-col>
                <v-col cols="1" class="text-right">Detail</v-col>
            </v-row>

            <v-divider class="my-1" />

            <template v-if="deviceActivities && deviceActivities.length > 0">
                <v-container fluid v-for="(activity, index) in deviceActivities" :key="activity.activity_id"
                    class="pa-0">
                    <v-row align="center" class="py-2 px-2" no-gutters>
                        <v-col cols="1" class="text-caption text-grey-darken-1">
                            {{ index + 1 }}
                        </v-col>
                        <v-col cols="2">
                            <v-list-item-title class="text-body-2 font-weight-medium">
                                {{ activity.activity_name }}
                            </v-list-item-title>
                        </v-col>
                        <v-col cols="4">
                            <v-list-item-title class="text-body-2">
                                {{ activity.actor?.actor_full_name || '-' }}
                            </v-list-item-title>
                        </v-col>
                        <v-col cols="" class="text-caption text-grey-darken-1">
                            {{ FormatTimestamp(activity.tstamp) || '-' }}
                        </v-col>
                        <v-col cols="1" class="text-right">
                            <v-btn icon size="small" variant="text" @click="toggleExpand(index)">
                                <v-icon>{{ expandedIndex === index ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>

                    <!-- Detail -->
                    <v-expand-transition>
                        <div v-if="expandedIndex === index" class="px-3 pb-3">
                            <v-row no-gutters>

                                <v-col cols="12">
                                    <v-list-item-subtitle class="text-caption">
                                        <p class="font-weight-bold">Perubahan: </p>

                                    </v-list-item-subtitle>
                                </v-col>
                                <v-col cols="6">
                                    <v-list-item-subtitle class="text-caption">
                                        <p class="font-weight-medium">Before:</p>
                                        <v-divider class="my-1" />
                                        <ul>
                                            <li v-for="(item, idx) in renderKeyValuePairs(activity.activity_before)"
                                                :key="idx">
                                                {{ item }}

                                                <v-divider class="my-1" />
                                            </li>
                                        </ul>


                                    </v-list-item-subtitle>
                                </v-col>
                                <v-col cols="6">
                                    <v-list-item-subtitle class="text-caption">
                                        <p class="font-weight-medium">After:</p>
                                        <v-divider class="my-1" />
                                        <ul>
                                            <li v-for="(item, idx) in renderKeyValuePairs(activity.activity_after)"
                                                :key="idx">
                                                {{ item }}
                                                <v-divider class="my-1" />
                                            </li>
                                        </ul>


                                    </v-list-item-subtitle>
                                </v-col>
                            </v-row>
                        </div>
                    </v-expand-transition>

                    <v-divider class="my-1" />
                </v-container>

            </template>


            <!-- Jika Tidak Ada Aktifitas -->
            <template v-else>
                <v-list-item>
                    <v-list-item-title class="text-center text-grey">No activity available</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { FormatTimestamp } from "@/utils/utils"
/* exp  : "deviceActivities" : [
    {
        "activity_id" : 1,
        "activity_name" : "",
        "actor" : {
            "actor_id" : 1,
            "actor_full_name" : ""
            },
            "tstamp" : epoch unix ,
        "before" ; {}, 
        after : {}
    ]
*/
const props = defineProps(["deviceActivities"]);



const expandedIndex = ref(null);

const toggleExpand = (index) => {
    expandedIndex.value = expandedIndex.value === index ? null : index;
};

function renderKeyValuePairs(jsonString, indent = 0) {
    try {
        const obj = JSON.parse(jsonString);
        return formatRecursive(obj, indent);
    } catch (e) {
        return ['Invalid JSON'];
    }
}

function formatRecursive(obj, indent = 0) {
    const result = [];
    const pad = ' '.repeat(indent); // gunakan unicode em space untuk indentasi
    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            result.push(`${pad}${key}:`);
            result.push(...formatRecursive(value, indent + 1));
        } else {
            result.push(`${pad}${key}: ${value}`);
        }
    }
    return result;
}



</script>



<style scoped>
.activity-list {
    padding: 12px;
}

.activity-item {
    transition: background-color 0.2s;
}

.activity-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    cursor: pointer;
}

/* Perangkat yang dipilih memiliki latar belakang biru */
.selected-activity {
    background-color: rgba(33, 150, 243, 0.25) !important;
}

/* Perangkat yang non-aktif tidak memiliki perubahan opacity */
.disabled-activity {
    pointer-events: none;
}

/* Pastikan tombol detail tidak terpengaruh oleh disabled-activity */
.detail-btn {
    pointer-events: auto !important;
    opacity: 1 !important;
    background-color: rgb(var(--v-theme-primary)) !important;
}

.detail-btn:hover {
    background-color: rgb(var(--v-theme-primary)) !important;
    opacity: 0.9 !important;
}

.detail-btn:active {
    background-color: rgb(var(--v-theme-primary)) !important;
}

.activity-icon {
    border-radius: 50%;
}

.text-green {
    color: green;
}

.text-grey {
    color: gray;
}

.v-list-item-title,
.v-list-item-subtitle {
    word-break: break-word;
}
</style>
