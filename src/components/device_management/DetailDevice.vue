<template>
    <v-col class="fill-height px-0">
        <v-col cols="auto" class="d-flex align-center">
            <v-btn @click="backToDeviceList" color="primary" class="d-flex justify-center align-center"
                style="max-height: 50px">
                <v-icon>mdi-arrow-left-bold</v-icon> <span>Kembali</span>
            </v-btn>
        </v-col>

        <v-row class="fill-height">
            <v-col class="mx-auto px-0">
                <p class="text-h6 font-weight-medium ma-0 text-center">
                    Detail Perangkat
                </p>

                <br>

                <v-container class="pa-4 flex-grow-1 overflow-y-auto" style="max-height: 624px;">
                    <v-col class="d-flex flex-column">
                        <!-- Nama Perangkat -->

                        
                        <v-col class="mb-4">
                            <p class="text-subtitle-1 font-weight-medium mb-1">Nama Perangkat</p>
                            <v-card outlined class="pa-3">
                                {{ currDeviceData.device_name }}
                            </v-card>
                        </v-col>

                        <!-- Password -->
                        <v-col class="mb-4">
                            <p class="text-subtitle-1 font-weight-medium mb-1">Password</p>
                            <v-card outlined class="pa-3">
                                {{ currDeviceDataLocal.device_password }}
                            </v-card>
                        </v-col>

                        <!-- Interval Pembacaan -->
                        <v-col class="mb-4">
                            <p class="text-subtitle-1 font-weight-medium mb-1">Interval Pembacaan Data Sensor (Detik)
                            </p>
                            <v-card outlined class="pa-3">
                                {{ currDeviceDataLocal.device_read_interval }}
                            </v-card>
                        </v-col>


                        <!-- Gambar Perangkat -->
                        <v-col class="mb-4">

                            <p class="text-subtitle-1 font-weight-medium mb-1">Gambar
                            </p>
                            <v-row class="d-flex justify-center mt-1 mb-3" v-if="existingImageSrc">
                                <v-img :src="existingImageSrc" class="mt-4 mb-5" max-height="200" contain />
                            </v-row>

                        </v-col>

                        <!-- Data Perangkat -->
                        <v-row class="pa-4">
                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat</p>
                        </v-row>

                        <div class="scrollable-container pa-0 border ma-0">
                            <v-container v-for="(currData, index) in currDeviceDetailsData" :key="'existing-' + index">
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-card outlined class="pa-2">
                                            
                                            {{ currData.title }}
                                        </v-card>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-card outlined class="pa-2">

                                            {{ currData.data }}
                                        </v-card>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </div>

                        <!-- Tabel Aktivitas -->
                        <div class="mt-4">
                            <p class="text-h6 font-weight-medium mt-5 mb-3 text-center">
                                Aktivitas Perangkat
                            </p>
                            <v-table>
                                <thead>
                                    <tr>
                                        <th>Tanggal/Waktu</th>
                                        <th>Deskripsi</th>
                                        <th>Aktor</th>
                                        <th>Perubahan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(activity, index) in currDeviceDataLocal.device_activities" :key="index">
                                        <td>{{ formatTimestamp(activity.activity_tstamp) }}</td>
                                        <td>{{ activity.activity_description }}</td>
                                        <td>{{ activity.actor_full_name }}</td>
                                        <td>
                                            <div v-if="activity.activity_before && activity.activity_after &&
                                                activity.activity_before !== '{}' && activity.activity_after !== '{}'">
                                                <v-table dense class="mt-2">
                                                    <thead>
                                                        <tr>
                                                            <th>Judul</th>
                                                            <th>Sebelum</th>
                                                            <th>Sesudah</th>
                                                        </tr>
                                                    </thead>
                                <tbody>
                                    <template v-if="typeof JSON.parse(activity.activity_before) === 'object'">
                                        <tr v-for="(value, key) in JSON.parse(activity.activity_before)" :key="key">
                                            <td class="font-weight-bold">{{ beautifyKey(key) }}</td>
                                            <td>{{ value || '-' }}</td>
                                            <td>{{ JSON.parse(activity.activity_after)[key] || '-' }}</td>
                                        </tr>
                                    </template>
                                    <template v-else>
                                        <tr>
                                            <td class="font-weight-bold">Data</td>
                                            <td>{{ activity.activity_before }}</td>
                                            <td>{{ activity.activity_after }}</td>
                                        </tr>
                                    </template>
                                </tbody>
                            </v-table>
                        </div>
                        <span v-else>-</span>
                        </td>
                        </tr>
                        </tbody>
                        </v-table>
                        </div>
                    </v-col>


                    <!-- Tombol Ke Edit Page -->
                    <v-col cols="auto" class="d-flex justify-end">
                        <v-btn @click="toEditPage(currDeviceDataLocal.device_id)" color="primary"
                            class="d-flex justify-center align-center" style="max-height: 50px">
                            <span class="pr-1">Ubah data </span>
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                    </v-col>

                </v-container>

            </v-col>




        </v-row>
    </v-col>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import JSZip from "jszip";

const emit = defineEmits(["toogle-detail-device-state", "handle-edit-device"]);
const props = defineProps(["currDeviceData"]);

////////////// DEVICE DATA //////////////
// Initialize local data with props
const currDeviceDataLocal = reactive({
    device_id: null, // <-- tambahkan
    device_name: "",
    device_password: "",
    device_read_interval: 0,
    device_data: {},
    device_attachment: {},
    device_activities: [],
});


const currDeviceDetailsData = ref([]);
const existingImageSrc = ref("");

const extractImageFromAttachment = async (base64Data) => {
    try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(base64Data.split(",")[1], { base64: true });

        for (const fileName in zipData.files) {
            if (fileName.match(/\.(jpeg|jpg|png)$/i)) {
                const fileData = await zipData.files[fileName].async("base64");
                return `data:image/${fileName.split(".").pop()};base64,${fileData}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Error extracting image from attachment:", error);
        return null;
    }
};

// Pindahkan watch di bawah fungsi ini
watch(
    () => props.currDeviceData,
    async (newVal) => {
        if (newVal) {
            Object.assign(currDeviceDataLocal, {
                device_id: newVal.device_id || null,
                device_name: newVal.device_name || "",
                device_password: newVal.device_password || "",
                device_read_interval: newVal.device_read_interval || 1,
                device_attachment: newVal.device_attachment || {},
                device_activities: newVal.device_activities || [],
            });

            if (newVal.device_data) {
                currDeviceDetailsData.value = Object.entries(newVal.device_data)
                    .map(([key, value]) => ({
                        title: key,
                        data: value
                    }));
            } else {
                currDeviceDetailsData.value = [];
            }

            if (newVal.device_attachment?.attachment_data) {
                existingImageSrc.value = await extractImageFromAttachment(newVal.device_attachment.attachment_data);
            }
        }
    },
    { immediate: true, deep: true }
);



const formatTimestamp = (epoch) => {
    if (!epoch) return "-";
    const date = new Date(epoch * 1000);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const beautifyKey = (key) => {
    const mapping = {
        name: 'Nama Perangkat',
        read_interval: 'Interval Pembacaan',
        attachment: 'Gambar'
    }
    const humanized = key.replace(/_/g, ' ')
    return mapping[key] || humanized.charAt(0).toUpperCase() + humanized.slice(1)
};

const backToDeviceList = () => {
    emit("toogle-detail-device-state");
};

const toEditPage = (deviceId) => {
    emit("handle-edit-device", deviceId);
}



</script>

<style scoped>
.scrollable-container {
    max-height: 300px;
    overflow-y: auto;
}

.border {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
}
</style>