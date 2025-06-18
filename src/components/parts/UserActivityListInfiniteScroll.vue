<template>
    <v-container class="activity-list px-0 ma-0">


        <!-- {{ user_activities}} -->
        <v-list bg-color="white" dense class="rounded-lg elevation-2">

            <!-- Header -->
            <v-row class="py-2 px-4 font-weight-bold text-caption text-grey-darken-1" no-gutters>
                <v-col cols="1">No.</v-col>
                <v-col cols="2">Aktivitas</v-col>
                <v-col cols="4">Aktor</v-col>
                <v-col>Waktu</v-col>
                <v-col cols="1" class="text-right">Detail</v-col>
            </v-row>

            <v-divider class="mx-4 my-1" />

            <!-- Aktivitas -->
            <template v-if="user_activities && user_activities.length > 0">
                <template v-for="(activity, index) in user_activities" :key="activity.activity_id">
                    <v-list-item class="activity-item">
                        <v-row align="center" class="py-2 px-4" no-gutters>
                            <v-col cols="1" class="text-caption text-grey-darken-1">{{ index + 1 }}</v-col>

                            <v-col cols="2">
                                <v-list-item-title color="primary" class="text-body-2 font-weight-medium">
                                    {{  activity.activity_name.toUpperCase() || '-' }}
                                </v-list-item-title>
                            </v-col>

                            <v-col cols="4">
                                <v-list-item-title class="text-body-2">
                                    {{ activity.actor?.actor_full_name || '-' }}
                                </v-list-item-title>
                            </v-col>

                            <v-col class="text-caption text-grey-darken-1">
                                {{ FormatTimestamp(activity.timestamp) || '-' }}
                            </v-col>

                            <v-col cols="1" class="text-right">
                                <v-btn icon size="small" variant="text" @click="toggleExpand(index)">
                                    <v-icon>{{ expand_index === index ? 'mdi-chevron-up' : 'mdi-chevron-down'
                                        }}</v-icon>
                                </v-btn>
                            </v-col>
                        </v-row>

                        <!-- Detail Expand -->
                        <v-expand-transition>
                            <div v-if="expand_index === index" class="px-4 pb-3">
                                <v-row no-gutters>
                                    <v-col cols="12">
                                        <p class="text-caption font-weight-bold mb-2">Perubahan:</p>
                                    </v-col>

                                    <v-col cols="6">
                                        <p class="text-caption font-weight-medium mb-1">Sebelum:</p>
                                        <ul class="text-caption"
                                            style="list-style-type: none; padding-left: 0; margin: 0;">
                                            <li v-for="(item, idx) in renderKeyValuePairs(activity.activity_before)"
                                                :key="'before-' + idx">
                                                {{ item }}
                                                <v-divider class="my-1" />
                                            </li>
                                        </ul>
                                    </v-col>

                                    <v-col cols="6">
                                        <p class="text-caption font-weight-medium mb-1">Setelah:</p>
                                        <ul class="text-caption"
                                            style="list-style-type: none; padding-left: 0; margin: 0;">
                                            <li v-for="(item, idx) in renderKeyValuePairs(activity.activity_after)"
                                                :key="'after-' + idx">
                                                {{ item }}
                                                <v-divider class="my-1" />
                                            </li>
                                        </ul>
                                    </v-col>
                                </v-row>
                            </div>
                        </v-expand-transition>

                    </v-list-item>

                    <v-divider v-if="index < user_activities.length - 1" class="mx-4" />
                </template>
            </template>

            <!-- Jika tidak ada aktivitas -->
            <template v-else>
                <v-list-item>
                    <v-list-item-title class="text-center text-grey">No activity available</v-list-item-title>
                </v-list-item>
            </template>
        </v-list>
    </v-container>
</template>


<script setup>
import { ref } from "vue";
import { FormatTimestamp } from "@/utils/utils"
/* exp  : "user_activities" : [
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
const props = defineProps(["user_activities"]);



const expand_index = ref(null);

const toggleExpand = (index) => {
    expand_index.value = expand_index.value === index ? null : index;
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

.v-list-item-title,
.v-list-item-subtitle {
    word-break: break-word;
}
</style>
