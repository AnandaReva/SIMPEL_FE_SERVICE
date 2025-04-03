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

                <v-container class="pa-4 flex-grow-1 overflow-y-auto" style="max-height: 624px;">
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

                        <v-row class="d-flex justify-center mt-1 mb-3">
                            <v-img v-if="existingImageSrc" :src="existingImageSrc" class="mt-4 mb-5" max-height="200"
                                contain />

                        </v-row>
                        
                        

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



                            
                            <v-container v-for="(currData, index) in currDeviceDetailsData" :key="'existing-' + index">
                                {{ currDeviceDetailsData }}
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="currData.title" outlined hide-details
                                            label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" required :rules="[requiredifCurrData(currData),
                                            () => noDuplicateTitles(currData, index, false)
                                            ]"></v-text-field>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="currData.data" outlined hide-details label="Isi data"
                                            required :rules="[requiredifCurrTitle(currData)]"></v-text-field>
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
                            <v-container v-for="(newData, index) in newDeviceDetailsData" :key="'new-' + index">
                                {{ newDeviceDetailsData }}
                                <v-row>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="newData.title"
                                            label="Judul (Lokasi, Alamat IP, Spesifikasi dll)" outlined :rules="[requiredifNewData(newData),
                                            () => noDuplicateTitles(newData, index, newDeviceDetailsData)
                                            ]"></v-text-field>
                                    </v-col>
                                    <v-col cols="5.5" class="px-1 py-0">
                                        <v-text-field v-model="newData.data" label="Isi data" outlined
                                            :rules="[requiredifNewTitle(newData)]"></v-text-field>
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
                                style="max-height: 50px; width: 50px; min-width: 50px"
                                :disabled="isDisableAddContainer">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>

                        {{ isDisableSubmitBtn }}
                        <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                            :disabled="isDisableSubmitBtn">
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
const currDeviceDetailsData = ref([]); // Untuk data yang sudah ada (bisa diedit key dan value)
const newDeviceDetailsData = ref([]);      // Untuk data baru yang akan ditambahkan


const originalDeviceDetailsData = ref([])
const updatedCurrDeviceDetailsData = ref([])
const deletedCurrDeviceData = ref([])
const addedCurrDeviceData = ref([])
// Methods for device data management
const addNewDataField = () => {
    if (newDeviceDetailsData.value.length === 0 ||
        (newDeviceDetailsData.value[newDeviceDetailsData.value.length - 1].title &&
            newDeviceDetailsData.value[newDeviceDetailsData.value.length - 1].data)) {
        newDeviceDetailsData.value.push({ title: "", data: "" });
    }
};

const removeExistingDataField = (index) => {
    const deletedItem = currDeviceDetailsData.value[index];
    deletedCurrDeviceData.value.push(deletedItem);
    currDeviceDetailsData.value.splice(index, 1);
};

const removeNewDataField = (index) => {
    newDeviceDetailsData.value.splice(index, 1);
};

const requiredifNewData = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Judul data tidak kosong";
    }
    if (item.data.trim() && !item.title.trim()) {
        return "Judul data tidak kosong";
    }
    return true;
};

const requiredifNewTitle = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    if (item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    return true;
};

const requiredifCurrData = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Judul data tidak kosong";
    }
    if (item.data.trim() && !item.title.trim()) {
        return "Judul data tidak kosong";
    }
    return true;
};

const requiredifCurrTitle = (item) => {
    if (!item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    if (item.title.trim() && !item.data.trim()) {
        return "Isi data tidak kosong";
    }
    return true;
};

const noDuplicateTitles = (itemParam, index, isNewData) => {
    // Gabungkan semua data yang ada (baik existing maupun new)
    const allItems = [
        ...currDeviceDetailsData.value,
        ...newDeviceDetailsData.value
    ];

    // Cari apakah ada judul yang sama di container lain
    const duplicate = allItems.some((otherItem, otherIndex) => {
        // Skip item yang sedang dicek
        if (isNewData && otherIndex >= currDeviceDetailsData.value.length) {
            // Jika item baru, bandingkan hanya dengan index yang berbeda
            return (
                otherIndex !== (index + currDeviceDetailsData.value.length) &&
                otherItem.title &&
                otherItem.title.trim() === itemParam.title.trim()
            );
        } else if (!isNewData) {
            // Jika item existing, bandingkan dengan index yang berbeda
            return (
                otherIndex !== index &&
                otherItem.title &&
                otherItem.title.trim() === itemParam.title.trim()
            );
        }
        return false;
    });

    return !duplicate || "Judul tidak boleh sama dengan yang lain";
};

// Check if add button should be disabled
const isDisableAddContainer = computed(() => {
    if (newDeviceDetailsData.value.length === 0) return false;
    const lastItem = newDeviceDetailsData.value[newDeviceDetailsData.value.length - 1];
    return !lastItem.title.trim() || !lastItem.data.trim();
});

// Fungsi validasi untuk submit
// function validateDeviceData(deviceData) {
//     // Validasi tidak ada judul kosong dan tidak ada duplikat
//     const titles = new Set();
//     let isValid = true;

//     const filteredData = deviceData.filter(container => {
//         if (!container.title.trim() || !container.data.trim()) {
//             return false;
//         }

//         if (titles.has(container.title.trim())) {
//             isValid = false;
//             return false;
//         }

//         titles.add(container.title.trim());
//         return true;
//     });

//     return isValid ? filteredData : null;
// }



////////////////////

function validateDeviceData() {
    const allTitles = new Set();
    let isValid = true;

    // Validasi data existing
    currDeviceDetailsData.value.forEach(item => {
        if (!item.title.trim() || !item.data.trim()) {
            isValid = false;
            return;
        }

        if (allTitles.has(item.title.trim())) {
            isValid = false;
        } else {
            allTitles.add(item.title.trim());
        }
    });

    // Validasi data baru
    newDeviceDetailsData.value.forEach(item => {
        if (!item.title.trim() || !item.data.trim()) {
            isValid = false;
            return;
        }

        if (allTitles.has(item.title.trim())) {
            isValid = false;
        } else {
            allTitles.add(item.title.trim());
        }
    });

    return isValid;
}
const getEditedDeviceData = (originalDataParam, existingDataParam) => {
    const newDeleted = [];
    const newUpdated = [];
    const newAdded = [];

    const isDuplicate = (arr, title, data) => {
        return arr.some(item => item.title === title && item.data === data);
    };

    originalDataParam.forEach(originalItem => {
        const stillExists = existingDataParam.some(item => item.title === originalItem.title);
        if (!stillExists && !isDuplicate(newDeleted, originalItem.title, originalItem.data)) {
            newDeleted.push(originalItem);
        }
    });

    existingDataParam.forEach(existingItem => {
        const originalItem = originalDataParam.find(item => item.title === existingItem.title);

        if (!originalItem) {
            if (!isDuplicate(newAdded, existingItem.title, existingItem.data)) {
                newAdded.push(existingItem);
            }
        } else if (originalItem.data !== existingItem.data) {
            if (!isDuplicate(newUpdated, existingItem.title, existingItem.data)) {
                newUpdated.push({
                    title: existingItem.title,
                    data: existingItem.data
                });
            }
        } else {
            const originalItemWithSameData = originalDataParam.find(
                item => item.data === existingItem.data && item.title !== existingItem.title
            );

            if (originalItemWithSameData &&
                !isDuplicate(newDeleted, originalItemWithSameData.title, originalItemWithSameData.data) &&
                !isDuplicate(newAdded, existingItem.title, existingItem.data)) {
                newDeleted.push(originalItemWithSameData);
                newAdded.push(existingItem);
            }
        }
    });

    deletedCurrDeviceData.value = [...newDeleted];
    updatedCurrDeviceDetailsData.value = [...newUpdated];
    addedCurrDeviceData.value = [...newAdded];
};




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

            // Convert curr device_data to array format
            if (newVal.device_data) {
                const newData = Object.entries(newVal.device_data)
                    .map(([key, value]) => ({
                        title: key,    // Mengganti 'key' dengan 'title'
                        data: value    // Mengganti 'value' dengan 'data'
                    }));

                // Update currDeviceDetailsData tanpa memicu watcher tambahan
                currDeviceDetailsData.value = newData;

                // Simpan original data untuk komparasi nanti
                originalDeviceDetailsData.value = JSON.parse(JSON.stringify(newData));
            } else {
                currDeviceDetailsData.value = [];
                originalDeviceDetailsData.value = [];
            }



            // Reset new data dan deleted data

            deletedCurrDeviceData.value = [];
            updatedCurrDeviceDetailsData.value = [];

            // Handle image
            if (newVal.device_attachment?.attachment_data) {
                extractImageFromAttachment(newVal.device_attachment.attachment_data);
            }
        }
    },
    { immediate: true, deep: true }
);

onMounted(() => {
    originalDeviceDetailsData.value = JSON.parse(JSON.stringify(currDeviceDetailsData.value));
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


////////////////////

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


const isDisableSubmitBtn = computed(() => {
    // Cek apakah nama perangkat valid (6-50 karakter)
    const isDeviceNameValid = currDeviceDataLocal.device_name && currDeviceDataLocal.device_name.length >= 6 && currDeviceDataLocal.device_name.length <= 50;

    // Cek apakah password valid (8-30 karakter)
    const isPasswordValid = currDeviceDataLocal.device_password && currDeviceDataLocal.device_password.length >= 8 && currDeviceDataLocal.device_password.length <= 30;

    // Cek apakah interval pembacaan valid (1-60 detik)
    const isReadIntervalValid = currDeviceDataLocal.device_read_interval >= 1 && currDeviceDataLocal.device_read_interval <= 60;

    // Cek apakah semua data valid

    // check lenght curr atau new data , jika curr data kosong maka hanya 


    const isCurrDeviceDetailsDataValid = currDeviceDetailsData.value.every(item => {
        return (item.data.trim() && item.title.trim()); // Pastikan keduanya tidak kosong
    });

    const isNewDeviceDetailsDataValid = newDeviceDetailsData.value.every(item => {
        return (item.data.trim() && item.title.trim()); // Pastikan keduanya tidak kosong
    });

    console.log("ini 2 isCurrDeviceDetailsDataValid: ", isCurrDeviceDetailsDataValid)
    console.log("ini 2 isNewDeviceDetailsDataValid: ", isNewDeviceDetailsDataValid)
    // Jika salah satu tidak valid, maka tombol register harus disable
    return !(isDeviceNameValid && isPasswordValid && isReadIntervalValid && isCurrDeviceDetailsDataValid && isNewDeviceDetailsDataValid);
});


const submitDeviceUpdate = () => {
    console.group("Submit Update");

    if (!validateDeviceData()) {
        alert("Terdapat judul yang sama atau field yang kosong");
        return;
    }

    // Log informasi perangkat
    console.log("Device Name:", currDeviceDataLocal.device_name);
    console.log("Password:", currDeviceDataLocal.device_password);
    console.log("Read Interval:", currDeviceDataLocal.device_read_interval);

    // Log informasi gambar
    console.log("Existing Image:", existingImageSrc.value ? "Exists" : "None");
    console.log("New Image:", imageSrc.value ? "Uploaded" : "None");

    // Reset tracking arrays sebelum pemrosesan data
    deletedCurrDeviceData.value = [];
    updatedCurrDeviceDetailsData.value = [];
    addedCurrDeviceData.value = [];

    // Proses perubahan data perangkat
    getEditedDeviceData(originalDeviceDetailsData.value, currDeviceDetailsData.value);

    console.log("Original Data:", originalDeviceDetailsData.value);
    console.log("Existing Data:", currDeviceDetailsData.value);
    console.log("Updated Existing Data:", updatedCurrDeviceDetailsData.value);
    console.log("Added Existing Data:", addedCurrDeviceData.value);
    console.log("Deleted Data:", deletedCurrDeviceData.value);
    console.log("Truly New Data:", newDeviceDetailsData.value);

    // Menggabungkan data baru dan data yang ditambahkan tanpa duplikasi
    const combinedNewDeviceData = [...addedCurrDeviceData.value];

    newDeviceDetailsData.value.forEach(item => {
        const exists = combinedNewDeviceData.some(
            existingItem => existingItem.key === item.key && existingItem.value === item.value
        );
        if (!exists && item.key && item.value) {
            combinedNewDeviceData.push(item);
        }
    });

    console.log("Combined New Device Data:", combinedNewDeviceData);

    // Buat objek `data` hanya jika ada update, insert, atau delete
    let detaildDataPayload = {};
    if (updatedCurrDeviceDetailsData.value.length > 0) {
        detaildDataPayload.update = Object.fromEntries(updatedCurrDeviceDetailsData.value.map(item => [item.title, item.data]));
    }
    if (combinedNewDeviceData.length > 0) {
        detaildDataPayload.insert = Object.fromEntries(combinedNewDeviceData.map(item => [item.title, item.data]));
    }
    if (deletedCurrDeviceData.value.length > 0) {
        detaildDataPayload.delete = deletedCurrDeviceData.value.map(item => item.title);
    }

    detaildDataPayload = validateDeviceData(detaildDataPayload);





    // Pastikan `data` hanya ditambahkan jika ada isinya
    const changeFields = {
        name: currDeviceDataLocal.device_name,
        password: currDeviceDataLocal.device_password,
        read_interval: currDeviceDataLocal.device_read_interval,
    };

    if (Object.keys(detaildDataPayload).length > 0) {
        changeFields.data = detaildDataPayload;
    }

    // Pastikan `attachment` hanya ditambahkan jika ada perubahan gambar
    if (existingImageSrc.value) {
        changeFields.attachment = {
            attachement_id: currDeviceDataLocal.attachment_id,
            attachment_change_fields: {
                attachment_name: "new name", // Bisa diganti dengan nilai aktual
                attachment_data: "new data"  // Bisa diganti dengan nilai aktual
            }
        };
    }

    // Susun payload akhir
    const updatedData = {
        device_id: currDeviceDataLocal.device_id,
        change_fields: changeFields
    };

    console.log("Final Payload:", updatedData);

    console.groupEnd();


    // emit("update-device", updatedData);
};

const backToDeviceList = () => {
    emit("toogle-detail-device-state");
};





</script>
