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

                <v-container class="pa-4 elevation-1">
                    <v-form ref="registerDeviceForm" @submit.prevent="submitDeviceUpdate" class="d-flex flex-column">
                        <v-text-field maxlength="50" v-model="currDeviceDataLocal.device_name" label="Nama Perangkat"
                            outlined dense prepend-inner-icon="mdi-access-point-network" class="mb-4"
                            :rules="deviceNameRules" required></v-text-field>


                        <v-text-field maxlength="30" v-model="currDeviceDataLocal.device_password" label="Password"
                            outlined dense prepend-inner-icon="mdi-lock" class="mb-4" :rules="passwordRules" required>

                        </v-text-field>

                        <v-number-input v-model="currDeviceDataLocal.device_read_interval" control-variant="split"
                            label="Interval Pembacaan Data Sensor (Detik)" :min="1" :max="60" required
                            :rules="readIntervalRules">
                        </v-number-input>

                        <!-- Menampilkan gambar yang sudah ada -->
                        <v-img v-if="existingImageSrc" :src="existingImageSrc" class="mt-4 mb-5" max-height="200"
                            contain />

                        <!-- Update Gambar -->
                        <v-file-input v-model="device_image" label="Ubah Gambar Perangkat (Opsional, max 5MB)" outlined
                            dense prepend-inner-icon="mdi-image" class="mb-4" accept="image/png, image/jpeg"
                            @change="handleFileUpload">
                        </v-file-input>
                        <v-row class="pa-4">

                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat (Optional)</p>
                        </v-row>


                        <div class="scrollable-container pa-0 border ma-0">



                            <!-- ERROR DI KEY DEVICE_DATA -->
                            <v-container v-for="(item, index) in existingDeviceData" :key="'existing-' + index">
                                <!-- Existing
                                {{ existingDeviceData }} -->
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="item.key" outlined hide-details
                                            label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" required></v-text-field>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="item.value" outlined hide-details label="Isi data"
                                            required></v-text-field>
                                    </v-col>
                                    <v-col cols="1" class="d-flex align-center px-0">
                                        <v-btn @click="removeExistingDataField(index)" color="error"
                                            style="max-height: 30px; width: 30px; min-width: 30px" size="small">
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-container>

                            <!-- Form untuk menambahkan data baru -->
                            <v-container v-for="(item, index) in newDeviceData" :key="'new-' + index">
                                <!-- New

                                {{ newDeviceData }} -->
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="item.key"
                                            label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" outlined
                                            :rules="[requiredIfValue(item)]" hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="item.value" label="Isi data" outlined
                                            :rules="[requiredIfKey(item)]" hide-details></v-text-field>
                                    </v-col>
                                    <v-col cols="1" class="d-flex align-center px-0">
                                        <v-btn @click="removeNewDataField(index)" color="error"
                                            style="max-height: 30px; width: 30px; min-width: 30px" size="small">
                                            <v-icon>mdi-close</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </div>


                        <!-- Tombol tambah data baru -->
                        <v-col cols="auto" class="d-flex align-center">
                            <v-btn @click="addNewDataField" color="primary"
                                class="rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px" :disabled="isAddButtonDisabled">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>




                        <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2">
                            Perbarui Data Perangkat
                        </v-btn>

                    </v-form>




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

                                                        <th>Sebelum</th>
                                                        <th>Sesudah</th>
                                                    </tr>
                                                </thead>
                            <tbody>
                                <tr v-for="(value, key) in JSON.parse(activity.activity_before)" :key="key">

                                    <td> {{ key }} : {{ value }}</td>
                                    <td>{{ key }}: {{ JSON.parse(activity.activity_after)[key] || '-' }}</td>
                                </tr>
                            </tbody>
                        </v-table>
                    </div>
                    <span v-else> Tidak ada perubahan </span>
                    </td>
                    </tr>
                    </tbody>
                    </v-table>
                    </div>


                </v-container>
            </v-col>
        </v-row>
    </v-col>
</template>

<script setup>
/*
dont remove comments
{
  "device_id": 28,
  "change_fields": {
    "read_interval": 1,
    "name": "new device name",
    "password" : ""new device password,
    "data": {
      "update": {
        "updated_field1": "value1"
      },
      "insert": {
        "new_field1": "value1",
        "new_field2": "value2"
      },
      "delete": ["deleted_field1", "deleted_field2"]
    } ,
     "attachment": {
          "attachemnt_id": 1,
         "attachment_change_fields" : {
                 "attachemnt_name": "new name",
                 "attachment_data": "new data",
        }
     }
  }
}

*/

import { ref, reactive, onMounted, watch, computed } from "vue";
import JSZip from "jszip";

import { VNumberInput } from 'vuetify/labs/VNumberInput'

const emit = defineEmits(["update-device", "toogle-detail-device-state"]);
const props = defineProps(["currDeviceData"]);

const imageSrc = ref("");
const existingImageSrc = ref("");
const newDeviceImage = ref("")

////////////// DEVICE DATA //////////////
// Initialize local data with props
const currDeviceDataLocal = reactive({
    device_name: "",
    device_password: "",
    device_read_interval: 1,
    device_data: {},
    device_attachment: {},
    device_activities: [],
});
const existingDeviceData = ref([]); // Untuk data yang sudah ada (bisa diedit key dan value)
const newDeviceData = ref([]);      // Untuk data baru yang akan ditambahkan


const originalDeviceData = ref([])
const updatedExistingDeviceData = ref([])
const deletedExistingDeviceData = ref([])
const addedExistingDeviceData = ref([])
// Methods for device data management
const addNewDataField = () => {
    // Only add if last field is filled or it's the first field
    if (newDeviceData.value.length === 0 ||
        (newDeviceData.value[newDeviceData.value.length - 1].key &&
            newDeviceData.value[newDeviceData.value.length - 1].value)) {
        newDeviceData.value.push({ key: "", value: "" });
    }
};



// const removeExistingDataField = (index) => {
//     const deletedItem = existingDeviceData.value[index];

//     // Simpan data yang dihapus ke dalam daftar deleted
//     deletedExistingDeviceData.value.push(deletedItem);

//     // Hapus dari existingData
//     existingDeviceData.value.splice(index, 1);

//     // Cari dan hapus dari originalDeviceData agar jumlah data tetap sinkron
//     const originalIndex = originalDeviceData.value.findIndex(item => item.key === deletedItem.key);
//     if (originalIndex !== -1) {
//         originalDeviceData.value.splice(originalIndex, 1);
//     }

//     console.log("deletedExistingDeviceData:", deletedExistingDeviceData.value);
//     console.log("Updated originalDeviceData:", originalDeviceData.value);
// };
const removeExistingDataField = (index) => {
    const deletedItem = existingDeviceData.value[index];
    deletedExistingDeviceData.value.push(deletedItem);
    existingDeviceData.value.splice(index, 1);
};


const removeNewDataField = (index) => {
    newDeviceData.value.splice(index, 1);
};

// Validation rules
const requiredIfValue = (item) => {
    return () => !item.value || item.key.trim() || "Key harus diisi jika value ada";
};

const requiredIfKey = (item) => {
    return () => !item.key || item.value.trim() || "Value harus diisi jika key ada";
};

function getEditedDeviceData(originalDataParam, existingDataParam) {
    // Reset temporary arrays
    const newDeleted = [];
    const newUpdated = [];
    const newAdded = [];

    // Fungsi helper untuk mengecek duplikasi
    const isDuplicate = (arr, key, value) => {
        return arr.some(item => item.key === key && item.value === value);
    };

    // 1. Cari data yang dihapus (ada di original tapi tidak ada di existing)
    originalDataParam.forEach(originalItem => {
        const stillExists = existingDataParam.some(item => item.key === originalItem.key);
        if (!stillExists && !isDuplicate(newDeleted, originalItem.key, originalItem.value)) {
            newDeleted.push(originalItem);
        }
    });

    // 2. Proses existing data
    existingDataParam.forEach(existingItem => {
        const originalItem = originalDataParam.find(item => item.key === existingItem.key);

        // Case 1: Key tidak ada di original (data baru)
        if (!originalItem) {
            if (!isDuplicate(newAdded, existingItem.key, existingItem.value)) {
                newAdded.push(existingItem);
            }
        }
        // Case 2: Key sama tapi value berbeda (data diupdate)
        else if (originalItem.value !== existingItem.value) {
            if (!isDuplicate(newUpdated, existingItem.key, existingItem.value)) {
                newUpdated.push({
                    key: existingItem.key,
                    oldValue: originalItem.value,
                    newValue: existingItem.value
                });
            }
        }
        // Case 3: Value sama tapi key berbeda (key diubah)
        else {
            const originalItemWithSameValue = originalDataParam.find(
                item => item.value === existingItem.value && item.key !== existingItem.key
            );

            if (originalItemWithSameValue &&
                !isDuplicate(newDeleted, originalItemWithSameValue.key, originalItemWithSameValue.value) &&
                !isDuplicate(newAdded, existingItem.key, existingItem.value)) {
                newDeleted.push(originalItemWithSameValue);
                newAdded.push(existingItem);
            }
        }
    });

    // Update the refs
    deletedExistingDeviceData.value = [...newDeleted];
    updatedExistingDeviceData.value = [...newUpdated];
    addedExistingDeviceData.value = [...newAdded];
}

// Check if add button should be disabled
const isAddButtonDisabled = computed(() => {
    if (newDeviceData.value.length === 0) return false;
    const lastItem = newDeviceData.value[newDeviceData.value.length - 1];
    return !lastItem.key.trim() || !lastItem.value.trim();
});


////////////// DEVICE ATTACHMENT //////////////

// Function to extract image from base64 zip data
const extractImageFromAttachment = async (base64Data) => {
    try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(base64Data.split(",")[1], {
            base64: true,
        });

        for (const fileName in zipData.files) {
            if (fileName.match(/\.(jpeg|jpg|png)$/i)) {
                const fileData = await zipData.files[fileName].async("base64");
                existingImageSrc.value = `data:image/${fileName
                    .split(".")
                    .pop()};base64,${fileData}`;
                break;
            }
        }
    } catch (error) {
        console.error("Error extracting image from attachment:", error);
    }
};
const handleZipUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);

        for (const fileName in zipData.files) {
            if (fileName.match(/\.(jpeg|jpg|png)$/i)) {
                const fileData = await zipData.files[fileName].async("base64");
                imageSrc.value = `data:image/${fileName
                    .split(".")
                    .pop()};base64,${fileData}`;
                break;
            }
        }
    } catch (error) {
        console.error("Error processing zip file:", error);
    }
};


// Watch to ensure data is properly assigned
// Hanya pertahankan watcher utama untuk props.currDeviceData
watch(
    () => props.currDeviceData,
    (newVal) => {
        if (newVal) {
            // Assign basic device info
            Object.assign(currDeviceDataLocal, {
                device_name: newVal.device_name || "",
                device_password: newVal.device_password || "",
                device_read_interval: newVal.device_read_interval || 1,
                device_attachment: newVal.device_attachment || {},
                device_activities: newVal.device_activities || [],
            });

            // Convert existing device_data to array format
            if (newVal.device_data) {
                const newData = Object.entries(newVal.device_data)
                    .map(([key, value]) => ({ key, value }));

                // Update existingDeviceData tanpa memicu watcher tambahan
                existingDeviceData.value = newData;

                // Simpan original data untuk komparasi nanti
                originalDeviceData.value = JSON.parse(JSON.stringify(newData));
            } else {
                existingDeviceData.value = [];
                originalDeviceData.value = [];
            }

            // Reset new data dan deleted data

            deletedExistingDeviceData.value = [];
            updatedExistingDeviceData.value = [];

            // Handle image
            if (newVal.device_attachment?.attachment_data) {
                extractImageFromAttachment(newVal.device_attachment.attachment_data);
            }
        }
    },
    { immediate: true, deep: true }
);

onMounted(() => {
    originalDeviceData.value = JSON.parse(JSON.stringify(existingDeviceData.value));
});


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

////////////// INPUT RULES //////////////
const deviceNameRules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 6 || "Nama perangkat minimal 6 karakter",
    (v) => v.length <= 50 || "Nama perangkat maksimal 50 karakter",
];

const passwordRules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 30 || "Password maksimal 30 karakter",
];

const readIntervalRules = [
    (v) => !!v || "Interval harus diisi",
    (v) => (v >= 1 && v <= 60) || "Interval harus antara 1 hingga 60 detik",
];




const submitDeviceUpdate = () => {

    console.group("Submit Update");
    console.log("Device Name:", currDeviceDataLocal.device_name);
    console.log("Password:", currDeviceDataLocal.device_password);
    console.log("Read Interval:", currDeviceDataLocal.device_read_interval);

    // 4. Log informasi gambar
    console.log("Existing Image:", existingImageSrc.value ? "Exists" : "None");
    console.log("New Image:", imageSrc.value ? "Uploaded" : "None");


    // Reset tracking arrays
    deletedExistingDeviceData.value = [];
    updatedExistingDeviceData.value = [];
    addedExistingDeviceData.value = [];
    // newDeviceData.value = [];

    // Process changes
    getEditedDeviceData(originalDeviceData.value, existingDeviceData.value);

    console.log("Original Data:", originalDeviceData.value);
    console.log("Existing Data:", existingDeviceData.value);
    console.log("Updated Existing Data:", updatedExistingDeviceData.value);
    console.log("Added Existing Data:", addedExistingDeviceData.value);

    console.log("Deleted Data:", deletedExistingDeviceData.value);
    console.log("Truly New Data:", newDeviceData.value);

    // Combine both new and added data while avoiding duplicates
    const combinedNewDeviceData = [...addedExistingDeviceData.value];

    newDeviceData.value.forEach(item => {
        // Check if item with same key and value already exists
        const exists = combinedNewDeviceData.some(
            existingItem => existingItem.key === item.key && existingItem.value === item.value
        );
        if (!exists && item.key && item.value) {  // Also ensure key and value aren't empty
            combinedNewDeviceData.push(item);
        }
    });

    console.log("combinedNewDeviceData: ", combinedNewDeviceData);


    console.groupEnd();

    const updatedData = {
        device_id: currDeviceDataLocal.device_id,
        change_fields: {
            name: currDeviceDataLocal.device_name,
            password: currDeviceDataLocal.device_password,
            read_interval: currDeviceDataLocal.device_read_interval,
            data: {
                update: Object.fromEntries(updatedExistingDeviceData.value.map(item => [item.key, item.value])),
                insert: Object.fromEntries(combinedNewDeviceData.map(item => [item.key, item.value])),
                delete: deletedExistingDeviceData.value.map(item => item.key),
            },
            attachment: existingImageSrc.value ? {
                attachement_id: currDeviceDataLocal.attachment_id,
                attachment_change_fields: {
                    attachment_name: "new name", // Bisa diganti dengan nilai aktual
                    attachment_data: "new data"  // Bisa diganti dengan nilai aktual
                }
            } : null
        }
    };

    console.log("Final Payload:", updatedData);


    // emit("update-device", updatedData);
};

const backToDeviceList = () => {
    emit("toogle-detail-device-state");
};





</script>
