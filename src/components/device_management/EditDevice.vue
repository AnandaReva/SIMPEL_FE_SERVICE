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
                    Edit Informasi Perangkat
                </p>



                <br>

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
                        <!-- Jika ada gambar   -->

                        <!--  existingImageSrc:  {{existingImageSrc}}  -->
                        <!-- {{  extractImageFromAttachment(originalDeviceData.device_attachment.attachment_data) }} -->

                       



                        <v-row class="d-flex justify-center mt-1 mb-3">
                            <v-img v-if="existingImageSrc || newDeviceImageSrc && newDeviceImage"
                                :src="existingImageSrc || newDeviceImageSrc" class="mt-4 mb-5" max-height="200"
                                contain />
                        </v-row>



                        <!-- Update Gambar -->
                        <v-file-input v-model="newDeviceImage" label="Ubah Gambar Perangkat (Opsional, max 5MB)"
                            outlined dense prepend-inner-icon="mdi-image" class="mb-4" accept="image/png, image/jpeg"
                            @change="handleFileUpload">
                        </v-file-input>


                        <v-row class="pa-4">

                            <v-icon>mdi-information</v-icon>
                            <p class="text-subtitle-1 font-weight-medium ma-0">Data Perangkat (Optional)</p>

                        </v-row>


                        <div class="scrollable-container pa-0 border ma-0">




                            <v-container v-for="(currData, index) in currDeviceDetailsData" :key="'existing-' + index">
                                <!-- {{ currDeviceDetailsData }} -->
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
                                <!-- {{ newDeviceDetailsData }} -->
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

                        <!-- {{ isDisableSubmitBtn }} -->
                        <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                            :disabled="isDisableSubmitBtn">
                            Perbarui Data Perangkat
                        </v-btn>

                    </v-form>

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

const emit = defineEmits(["update-device", "toogle-edit-device-state"]);
const props = defineProps(["currDeviceData"]);


////////////// DEVICE DATA //////////////
// Initialize local data with props
const currDeviceDataLocal = reactive({
    device_name: "",
    device_password: "",
    device_read_interval: 1,
    device_data: {},
    device_attachment: {},
});

// Initialize original device data
const originalDeviceData = reactive({
    device_id: 0,
    device_name: "",
    device_password: "",
    device_read_interval: 0,
    device_image_src: "",
    device_attachment_id: 0,
});

const currDeviceDetailsData = ref([]); // Untuk data yang sudah ada (bisa diedit key dan value)
const newDeviceDetailsData = ref([]);      // Untuk data baru yang akan ditambahkan


const originalDeviceDetailsData = ref([])
const updatedCurrDeviceDetailsData = ref([])
const deletedCurrDeviceDetailsData = ref([])
const addedCurrDeviceDetailsData = ref([])
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
    deletedCurrDeviceDetailsData.value.push(deletedItem);
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



    deletedCurrDeviceDetailsData.value = [...newDeleted];
    updatedCurrDeviceDetailsData.value = [...newUpdated];
    addedCurrDeviceDetailsData.value = [...newAdded];
    console.group("---getEditedDeviceData---");
    console.log("deletedCurrDeviceDetailsData.value: ", deletedCurrDeviceDetailsData.value);
    console.log("updatedCurrDeviceDetailsData.value: ", updatedCurrDeviceDetailsData.value);
    console.log("addedCurrDeviceDetailsData.value: ", addedCurrDeviceDetailsData.value);
    console.groupEnd();

};

////////////// DEVICE ATTACHMENT //////////////


const existingImageSrc = ref("");
const newDeviceImage = ref(null)
const newDeviceImageSrc = ref("");
const newDeviceImageBase64 = ref("");


// Function to handle new file upload
const handleFileUpload = async (event) => {
    const file = event.target?.files?.[0] || event;

    if (!file) {
        newDeviceImageBase64.value = "";
        newDeviceImageSrc.value = "";
        return;
    }

    if (!(file instanceof Blob)) {
        console.error("Invalid file type");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        popUpProps.value = {
            status: "error",
            errorMessage: "Ukuran gambar maksimal 5MB",
            errorCode: "FILE_SIZE_EXCEEDED",
        };
        popupVisible.value = true;
        newDeviceImage.value = null;
        return;
    }

    // Buat URL objek untuk preview gambar
    newDeviceImageSrc.value = URL.createObjectURL(file);
    console.log("Preview image URL:", newDeviceImageSrc.value);

    try {
        const compressedFile = await compressToZip(file, file.name);
        convertImageToBase64(compressedFile);


        existingImageSrc.value = null;

        console.log("existingImageSrc:", existingImageSrc.value);
        console.log("newDeviceImageSrc:", newDeviceImageSrc.value);



        console.group("Compressed file details");


        console.log("Compressed file:", compressedFile);
        console.log("Compressed file size:", compressedFile.size);
        console.log("Uncompressed file size:", file.size);

        console.groupEnd();

    } catch (error) {
        console.error("Compression error:", error);
    }
};

const convertImageToBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        newDeviceImageBase64.value = reader.result;

    };
    reader.onerror = (error) => {
        console.error("Error converting file to Base64:", error);
        popUpProps.value = {
            status: "error",
            errorMessage: "Gagal mengonversi gambar",
            errorCode: "BASE64_ERROR",
        };
        popupVisible.value = true;
    };
};

const compressToZip = async (file, fileName) => {
    const zip = new JSZip();
    zip.file(fileName, file);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
};

const extractImageFromAttachment = async (base64Data) => {
    try {
        const zip = new JSZip();
        const zipData = await zip.loadAsync(base64Data.split(",")[1], { base64: true });

        for (const fileName in zipData.files) {
            if (fileName.match(/\.(jpeg|jpg|png)$/i)) {
                const fileData = await zipData.files[fileName].async("base64");
                return `data:image/${fileName.split(".").pop()};base64,${fileData}`; // ✅ RETURN di sini
            }
        }

        return null; // jika tidak ada image ditemukan
    } catch (error) {
        console.error("Error extracting image from attachment:", error);
        return null;
    }
};


// Watch to ensure data is properly assigned
// Hanya pertahankan watcher utama untuk props.currDeviceData
watch(
    () => props.currDeviceData,
    async (newVal) => {
        if (newVal) {

            // console.log("New device data: ", newVal);
            // Handle attahcment 

            let originalDeviceAttachementId = null;
            if (newVal.device_attachment?.attachment_id) {
                originalDeviceAttachementId = newVal.device_attachment.attachment_id;
            }
            //    console.log("originalDeviceAttachementId: ", originalDeviceAttachementId);

            let originalDeviceAttachementDataSrc = null;

            if (newVal.device_attachment?.attachment_data) {

                // get image src
                originalDeviceAttachementDataSrc = await extractImageFromAttachment(newVal.device_attachment.attachment_data);
                /*  console.log("originalDeviceAttachement: ", originalDeviceAttachementData);
                 console.log("originalDeviceAttachementSrc: ", originalDeviceAttachementDataSrc); */

                existingImageSrc.value = originalDeviceAttachementDataSrc;
            }
            // assign to original device data

            Object.assign(originalDeviceData, {
                device_id: newVal.device_id,
                device_name: newVal.device_name || "",
                device_password: newVal.device_password || "",
                device_read_interval: newVal.device_read_interval || 1,
                device_image_src: originalDeviceAttachementDataSrc,
                device_attachment_id: originalDeviceAttachementId,
            });

            /*  console.log("existingImageSrc: ", existingImageSrc.value);
             console.log("originalDeviceData: ", originalDeviceData); */

            // Assign basic device info
            Object.assign(currDeviceDataLocal, {
                device_name: newVal.device_name || "",
                device_password: newVal.device_password || "",
                device_read_interval: newVal.device_read_interval || 1,
                device_attachment: newVal.device_attachment || {},
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

            deletedCurrDeviceDetailsData.value = [];
            updatedCurrDeviceDetailsData.value = [];


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
const beautifyKey = (key) => {
    const mapping = {
        name: 'Nama Perangkat',
        read_interval: 'Read Interval',
        attachment: 'Gambar'
    }
    // Replace underscore with space and capitalize
    const humanized = key.replace(/_/g, ' ')
    return mapping[key] || humanized.charAt(0).toUpperCase() + humanized.slice(1)
}

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
    // 1. Cek validasi form dasar
    const isDeviceNameValid = currDeviceDataLocal.device_name &&
        currDeviceDataLocal.device_name.length >= 6 &&
        currDeviceDataLocal.device_name.length <= 50;

    const isPasswordValid = currDeviceDataLocal.device_password &&
        currDeviceDataLocal.device_password.length >= 8 &&
        currDeviceDataLocal.device_password.length <= 30;

    const isReadIntervalValid = currDeviceDataLocal.device_read_interval >= 1 &&
        currDeviceDataLocal.device_read_interval <= 60;

    // 2. Cek validasi data tambahan
    const isCurrDeviceDetailsDataValid = currDeviceDetailsData.value.every(item =>
        item.data.trim() && item.title.trim());

    const isNewDeviceDetailsDataValid = newDeviceDetailsData.value.every(item =>
        item.data.trim() && item.title.trim());

    // 3. Cek apakah ada perubahan data
    const isDataChanged =
        // Cek field utama
        currDeviceDataLocal.device_name !== originalDeviceData.device_name ||
        currDeviceDataLocal.device_password !== originalDeviceData.device_password ||
        currDeviceDataLocal.device_read_interval !== originalDeviceData.device_read_interval ||
        // Cek gambar
        (newDeviceImage.value !== null) ||
        // Cek data tambahan
        JSON.stringify(currDeviceDetailsData.value) !== JSON.stringify(originalDeviceDetailsData.value) ||
        newDeviceDetailsData.value.length > 0;

    // Tombol disable jika:
    // - Validasi form tidak terpenuhi ATAU
    // - Tidak ada perubahan data
    return !(isDeviceNameValid &&
        isPasswordValid &&
        isReadIntervalValid &&
        isCurrDeviceDetailsDataValid &&
        isNewDeviceDetailsDataValid) ||
        !isDataChanged;
});


const submitDeviceUpdate = () => {
    console.group("Submit Update");

    if (!validateDeviceData()) {
        alert("Terdapat judul yang sama atau field yang kosong");
        return;
    }

    console.log("originalDeviceData.device_id:", props.currDeviceData.device_id);


    // Mulai menyusun payload perubahan
    let changeFields = {};

    // Perubahan data dasar
    if (currDeviceDataLocal.device_name !== originalDeviceData.device_name) {
        changeFields.name = currDeviceDataLocal.device_name;
    }
    if (currDeviceDataLocal.device_password !== originalDeviceData.device_password) {
        changeFields.password = currDeviceDataLocal.device_password;
    }
    if (currDeviceDataLocal.device_read_interval !== originalDeviceData.device_read_interval) {
        changeFields.read_interval = currDeviceDataLocal.device_read_interval;
    }

    // Perubahan attachment
    /*  exo:
   changeFields.attachment = {
    insert: {
        attachment_id: originalDeviceData.device_attachment_id,
        attachment_data: newDeviceImageBase64.value
    }
} atau
changeFields.attachment = {
    update: {
        attachment_id: originalDeviceData.device_attachment_id,
        attachment_data: newDeviceImageBase64.value
    }
} atau
changeFields.attachment = {
    delete: {
        attachment_id: originalDeviceData.device_attachment_id
    }
}
     */
    // Perubahan attachment

    console.group("Attachment Changes");
    console.log("newDeviceImage.value: ", newDeviceImage.value);
    console.log("newDeviceImageBase64.value: ", newDeviceImageBase64.value);
    console.log("existingImageSrc.value: ", existingImageSrc.value);
    console.log("originalDeviceData.device_image_src: ", originalDeviceData.device_image_src);

    const hasExistingImage = originalDeviceData.device_attachment_id !== null;
    const hasNewImageUploaded = newDeviceImageBase64.value !== "" && newDeviceImage.value;
    const hasImageRemoved = !newDeviceImage.value && hasExistingImage;

    console.log("hasExistingImage: ", hasExistingImage);
    console.log("hasNewImageUploaded: ", hasNewImageUploaded);
    console.log("hasImageRemoved: ", hasImageRemoved);
    console.groupEnd();

    if (hasImageRemoved) {
        // Gambar dihapus dan sebelumnya ada gambar → delete
        changeFields.attachment = {
            delete: {
                attachment_id: originalDeviceData.device_attachment_id,
            },
        };
    } else if (hasNewImageUploaded) {
        // Ada gambar baru yang valid (upload atau drag drop baru)
        if (hasExistingImage) {
            // Sudah ada attachment sebelumnya → update
            changeFields.attachment = {
                update: {
                    attachment_id: originalDeviceData.device_attachment_id,
                    attachment_data: newDeviceImageBase64.value,
                },
            };
        } else {
            // Tidak ada attachment sebelumnya → insert
            changeFields.attachment = {
                insert: {
                    attachment_data: newDeviceImageBase64.value,
                },
            };
        }
    }
    // Jika tidak memenuhi kondisi di atas, tidak ada perubahan pada attachment

    // Reset tracking arrays
    deletedCurrDeviceDetailsData.value = [];
    updatedCurrDeviceDetailsData.value = [];
    addedCurrDeviceDetailsData.value = [];


    // Proses perubahan data detail
    getEditedDeviceData(originalDeviceDetailsData.value, currDeviceDetailsData.value);


    console.log("addedCurrDeviceDetailsData.value: ", addedCurrDeviceDetailsData.value);
    console.log("newDeviceDetailsData.value: ", newDeviceDetailsData.value);
    // Gabungkan data baru (tanpa duplikasi)
    let combinedNewDeviceData = [];

    // Gabungkan addedCurrDeviceDetailsData
    addedCurrDeviceDetailsData.value.forEach(item => {
        const exists = combinedNewDeviceData.some(
            existingItem =>
                existingItem.title === item.title && existingItem.data === item.data
        );
        if (!exists && item.title && item.data) {
            combinedNewDeviceData.push(item);
        }
    });

    // Gabungkan newDeviceDetailsData
    newDeviceDetailsData.value.forEach(item => {
        const exists = combinedNewDeviceData.some(
            existingItem =>
                existingItem.title === item.title && existingItem.data === item.data
        );
        if (!exists && item.title && item.data) {
            combinedNewDeviceData.push(item);
        }
    });

    // Check and remove duplicates between combinedNewDeviceData and deletedCurrDeviceDetailsData
    for (let i = combinedNewDeviceData.length - 1; i >= 0; i--) {
        const newItem = combinedNewDeviceData[i];
        const deletedIndex = deletedCurrDeviceDetailsData.value.findIndex(
            deletedItem =>
                deletedItem.title === newItem.title && deletedItem.data === newItem.data
        );

        if (deletedIndex !== -1) {
            // Remove from both arrays
            combinedNewDeviceData.splice(i, 1);
            deletedCurrDeviceDetailsData.value.splice(deletedIndex, 1);
        }
    }

    // Perubahan detail
    let detaildDataPayload = {};
    if (updatedCurrDeviceDetailsData.value.length > 0) {
        detaildDataPayload.update = Object.fromEntries(
            updatedCurrDeviceDetailsData.value.map(item => [item.title, item.data])
        );
    }
    if (combinedNewDeviceData.length > 0) {
        detaildDataPayload.insert = Object.fromEntries(
            combinedNewDeviceData.map(item => [item.title, item.data])
        );
    }
    if (deletedCurrDeviceDetailsData.value.length > 0) {
        detaildDataPayload.delete = Object.fromEntries(
            deletedCurrDeviceDetailsData.value.map(item => [item.title, item.data])
        );
    }

    /* console.log("detaildDataPayload: ", detaildDataPayload);
    console.log("deletedCurrDeviceDetailsData.value: ", deletedCurrDeviceDetailsData.value);
    console.log("updatedCurrDeviceDetailsData.value: ", updatedCurrDeviceDetailsData.value);
    console.log("combinedNewDeviceData: ", combinedNewDeviceData); */

    // Masukkan jika ada perubahan detail
    if (Object.keys(detaildDataPayload).length > 0) {
        changeFields.data = detaildDataPayload;
        console.log("changeFields.data: ", changeFields.data);
    }

    // Payload akhir
    const updatedData = {
        device_id: originalDeviceData.device_id,
        change_fields: changeFields
    };

    console.log("Final Payload:", updatedData);
    console.groupEnd();



    // Kirim update
    emit("update-device", updatedData.device_id, updatedData.change_fields);
};

const backToDeviceList = () => {
    emit("toogle-edit-device-state");
};





</script>
