<template>
    <v-container fluid class="pa-4 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">


        <v-card color="base" elevation="0" style="height: 100%; width: 100%;" class="pa-2">


            <v-col cols="12">


                <v-btn @click="backToDeviceManagPage()" color="primary" elevation="2" class="ma-0">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-card flat class="px-4 py-2 mb-4">


                    <p class="text-h6 font-weight-medium text-center mb-0">EDIT DATA PERANGKAT</p>
                </v-card>
            </v-col>

            <v-col cols="12" class="pa-0">



                <div class="scrollable-content">
                    <!-- Informasi Dasar Perangkat -->
                    <v-card outlined class="mb-4">

                        <!-- original device{{ original_device_data }} <br>
                        curr {{ curr_device_data }} -->
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Nama Perangkat</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-access-point-network</v-icon>
                                        <v-text-field maxlength="50" v-model="curr_device_data.name"
                                            label="Nama Perangkat" outlined dense
                                            prepend-inner-icon="mdi-access-point-network" class="mb-4"
                                            :rules="device_name_rules" required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Password</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-lock</v-icon>
                                        <v-text-field v-model="curr_device_data.password" label="Password" outlined
                                            dense prepend-inner-icon="mdi-lock"
                                            :type="showPassword ? 'text' : 'device_password'"
                                            :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                            @click:append="showPassword = !showPassword" :rules="device_password_rules"
                                            required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Interval Pembacaan (Detik)</p>
                                    <v-card flat class="pa-3">
                                        <v-text-field v-model.number="curr_device_data.read_interval" type="number"
                                            outlined dense prepend-inner-icon="mdi-timer" :rules="read_interval_rules"
                                            required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Ditambahkan</p>
                                    <v-card flat class="pa-3">{{
                                        FormatTimestamp(curr_device_data?.create_timestamp) || '-' }}</v-card>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Waktu Terakhir</p>
                                    <v-card flat class="pa-3">{{
                                        FormatTimestamp(curr_device_data?.last_timestamp) || '-' }}</v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                    <v-card flat class="pa-3">



                                        <span v-if="curr_device_data?.status === 1"> Aktif</span>
                                        <span v-else-if="curr_device_data?.status === 0">Tidak Aktif</span>
                                        <span v-else>Tidak Diketahui</span>


                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>



                    <!-- original image {{ original_device_image.file_name }} file_id {{ original_device_image.file_id }}
                    <br>
                    curr image {{ curr_device_image.file_name }} file_id {{ curr_device_image.file_id }} <br>
                    new image {{ new_device_image.file_name }} file_id {{ new_device_image.file_id }} <br> -->
                    <!-- Gambar Perangkat -->
                    <v-card outlined class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon size="24" color="primary" class="mr-2">mdi-image</v-icon>
                            <span class="text-subtitle-1 font-weight-medium">Gambar Perangkat</span>
                        </v-card-title>

                        <v-card-text class="text-center">
                            <v-img v-if="displayedImage" :src="getDeviceImageSrc(displayedImage)" max-height="200"
                                contain class="mx-auto" />
                            <p v-else class="text-caption text-grey">Tidak ada gambar</p>

                            <v-file-input ref="fileInputRef" accept="image/*" label="Upload Gambar"
                                prepend-icon="mdi-camera" class="mt-4" @change="handleFileUpload" :model-value="null"
                                hide-input />


                            <!-- Tombol ikon -->
                            <div class="d-flex justify-center mt-2">
                                <v-tooltip text="Hapus Gambar">
                                    <template v-if="curr_device_image.file_data || new_device_image.file_data"
                                        #activator="{ props }">
                                        <v-btn v-bind="props" icon color="error" @click="handleImageDelete">
                                            <v-icon>mdi-trash-can</v-icon>
                                        </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Kembalikan Gambar Lama">
                                    <template v-if="curr_device_image.file_data != original_device_image.file_data"
                                        #activator="{ props }">
                                        <v-btn v-bind="props" icon color="primary" class="ml-2"
                                            @click="handleCurrImageBack">
                                            <v-icon>mdi-refresh</v-icon>
                                        </v-btn>
                                    </template>
                                </v-tooltip>
                            </div>
                        </v-card-text>
                    </v-card>



                    <!-- Data Perangkat -->





                    <!--       original {{ original_device_detail_data }} <br>
                    existing{{ existing_device_detail_data }} <br>
                    new {{ new_device_detail_data }} -->


                    <!-- Device Data -->
                    <v-card outlined class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                            <span class="text-subtitle-1 font-weight-medium">Data Perangkat</span>
                        </v-card-title>
                        <v-card-text style="max-height: 300px; overflow-y: auto;">
                            <div class="scrollable-container pa-0 border ma-0"
                                style="max-height: 300px; overflow-y: auto;">
                                <!-- Existing Data Fields -->
                                <v-container v-for="(currData, index) in existing_device_detail_data"
                                    :key="'existing-' + index">


                                    <v-row>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="currData.title" outlined label="Judul"
                                                :error-messages="existing_device_detail_errors[index]?.title || ''"
                                                @blur="validateDeviceDetailData(currData, index, false)"></v-text-field>
                                        </v-col>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="currData.data" outlined label="Isi Data"
                                                :error-messages="existing_device_detail_errors[index]?.data || ''"
                                                @blur="validateDeviceDetailData(currData, index, false)"></v-text-field>
                                        </v-col>
                                        <v-col cols="1" class="d-flex align-center px-0">
                                            <v-btn @click="removeExistingDataField(index)" color="error"
                                                style="max-height: 30px; width: 30px; min-width: 30px" size="small">
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-container>

                                <!-- New Data Fields -->
                                <v-container v-for="(newData, index) in new_device_detail_data" :key="'new-' + index">
                                    <v-row>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="newData.title" outlined label="Judul"
                                                :error-messages="new_device_detail_errors[index]?.title || ''"
                                                @blur="validateDeviceDetailData(newData, index, true)"></v-text-field>
                                        </v-col>
                                        <v-col cols="5.5" class="px-1 py-0">

                                            <v-text-field v-model="newData.data" outlined label="Isi Data"
                                                :error-messages="new_device_detail_errors[index]?.data || ''"
                                                @blur="validateDeviceDetailData(newData, index, true)"></v-text-field>
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

                            <!-- Add New Data Button -->


                        </v-card-text>
                        <v-col cols="auto" class="d-flex align-center">

                            <v-btn @click="addNewDataField" color="primary"
                                class="rounded-circle d-flex justify-center align-center"
                                style="max-height: 50px; width: 50px; min-width: 50px"
                                :disabled="isDisableAddContainer">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </v-col>
                    </v-card>
                </div>
            </v-col>


            <v-col>
                <div class="d-flex justify-center" style="max-width: 300px; width: 100%; margin: 0 auto;">
                    <v-btn type="submit" color="primary" block class="mt-2" size="large" elevation="2"
                        :disabled="isDisableSubmitBtn" @click="submitDeviceUpdate">
                        Perbarui Data Perangkat
                    </v-btn>
                </div>
            </v-col>




        </v-card>


        <PopUpInfoBox v-if="popUpInfoVisible" class="popup-container" :status="popUpInfoProps.status"
            :errorMessage="popUpInfoProps.errorMessage" :errorCode="popUpInfoProps.errorCode"
            :visible="popUpInfoVisible" @close="closePopUpInfo" />

        <PopUpConfirmationBox v-if="popUpConfirmVisible" class="popup-container" :title="popUpConfirmProps.title"
            :message="popUpConfirmProps.message" :status="popUpConfirmProps.status" :visible="popUpConfirmVisible"
            @confirm="handleConfirm" @cancel="handleCancel" />



    </v-container>


</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { FormatTimestamp } from '@/utils/utils'
import { useRouter } from 'vue-router';
import { BASE_API_URL } from '@/configs/config';
import { Process } from '@/utils/requestHelper';


const router = useRouter();

/////// STATE MANAGEEMNT /////////

const popUpConfirmVisible = ref(false);

const popUpConfirmProps = ref({
    title: "",
    message: "",
    status: "",
});

/////

const popUpInfoVisible = ref(false);

const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
};
const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);

const showPassword = ref(false);
const user_role = ref("user_guset");





// Inisialisasi awal
const curr_device_data = ref({
    name: "",
    password: "",
    read_interval: null,
    create_timestamp: null,
    last_timestamp: null,
    status: null
});



const original_device_data = ref({
    name: "",
    password: "",
    read_interval: null,
    create_timestamp: null,
    last_timestamp: null,
    status: null,
});





////////// IMAGE //////////
// Inisialisasi awal
const curr_device_image = ref({
    file_id: null,
    file_data: null,  // str
    file_name: null, // str
})

const new_device_image = ref({
    file_id: null,
    file_data: null,  // str
    file_name: null, // str
});

const original_device_image = ref({
    file_data: null,  // str
    file_name: null, // str
});

// Fungsi untuk menghasilkan data URL dari base64
function getDeviceImageSrc(base64Image) {
    if (!base64Image || typeof base64Image !== 'string') return null;

    let mime = '';
    if (base64Image.startsWith('/9j/')) {
        mime = 'image/jpeg';
    } else if (base64Image.startsWith('iVBORw0KGgo')) {
        mime = 'image/png';
    } else if (base64Image.startsWith('R0lGODdh') || base64Image.startsWith('R0lGODlh')) {
        mime = 'image/gif';
    } else if (base64Image.startsWith('UklGR')) {
        mime = 'image/webp';
    } else {
        mime = 'application/octet-stream';
    }

    return `data:${mime};base64,${base64Image}`;
}

// Ambil yang terbaru: jika ada gambar baru, tampilkan itu. Kalau tidak, ambil yang lama.
const displayedImage = computed(() => {
    return new_device_image.value.file_data || curr_device_image.value.file_data || "";
});


const resetFileInput = () => {
    if (fileInputRef.value) {
        fileInputRef.value.reset();
    }
};


const handleImageDelete = () => {
    // Instead of clearing both, just clear the current and new images
    new_device_image.value = {
        file_id: null,
        file_data: null,
        file_name: null
    };
    curr_device_image.value = {
        file_id: null,
        file_data: null,
        file_name: null
    };
    resetFileInput();
};

const handleCurrImageBack = () => {

    new_device_image.value = {};

    curr_device_image.value = original_device_image.value;

    resetFileInput();
};


const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
        new_device_image.value = {};
        return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {

        popUpInfoVisible.value = true;
        popUpInfoProps.value = {
            status: "warning",
            errorMessage: "Ukuran gambar maksimal 10MB",
            errorCode: "",
        };

        new_device_image.value = {};


        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const base64Full = reader.result; // contoh: "data:image/jpeg;base64,/9j/4AAQ..."
        const base64Clean = base64Full.split(",")[1]; // hanya ambil bagian setelah koma

        new_device_image.value.file_data = base64Clean;
        new_device_image.value.file_name = file.name;
        curr_device_image.value = {};

    };

    reader.readAsDataURL(file);
};


const fileInputRef = ref(null);


/////////// COMMON DEVICE DATA ///////////


// Validation rules
const device_name_rules = [
    (v) => !!v || "Nama perangkat harus diisi",
    (v) => v.length >= 2 || "Nama perangkat minimal 2 karakter",
    (v) => v.length <= 255 || "Nama perangkat maksimal 255 karakter",
];

const device_password_rules = [
    (v) => !!v || "Password harus diisi",
    (v) => v.length >= 8 || "Password minimal 8 karakter",
    (v) => v.length <= 255 || "Password maksimal 255 karakter",
];

const read_interval_rules = [
    (v) => !!v || "Interval harus diisi",
    (v) => (v >= 1 && v <= 120) || "Interval harus antara 1 hingga 120 detik",
];





/////////// DATA //////////////
// Device detail Data Management
const existing_device_detail_data = ref([]); // Existing data (can edit key and value)
const new_device_detail_data = ref([]);  // New data to be added
const original_device_detail_data = ref([]);


const updated_existing_device_detail_data = ref([]);
const deleted_existing_device_detail_data = ref([]);
const added_existing_device_detail_data = ref([]);



// Methods
const addNewDataField = () => {
    if (new_device_detail_data.value.length === 0 ||
        (new_device_detail_data.value[new_device_detail_data.value.length - 1].title &&
            new_device_detail_data.value[new_device_detail_data.value.length - 1].data)) {
        new_device_detail_data.value.push({ title: "", data: "" });
    }
};

const removeExistingDataField = (index) => {
    const deletedItem = existing_device_detail_data.value[index];
    deleted_existing_device_detail_data.value.push(deletedItem);
    existing_device_detail_data.value.splice(index, 1);
};

const removeNewDataField = (index) => {
    new_device_detail_data.value.splice(index, 1);
};

const isDisableAddContainer = computed(() => {
    if (new_device_detail_data.value.length === 0) return false;
    const lastItem = new_device_detail_data.value[new_device_detail_data.value.length - 1];
    return !lastItem.title.trim() || !lastItem.data.trim();
});

const existing_device_detail_errors = ref([]);
const new_device_detail_errors = ref([]);

const validateDeviceDetailData = (item, index, isNew = false) => {
    const title = item.title?.trim();
    const data = item.data?.trim();
    const allItems = [
        ...existing_device_detail_data.value,
        ...new_device_detail_data.value
    ];

    let titleError = "";
    let dataError = "";

    if (!title) titleError = "Judul tidak boleh kosong";
    if (!data) dataError = "Isi data tidak boleh kosong";

    const isDuplicate = allItems.some((otherItem, otherIndex) => {
        const isSameItem = isNew
            ? otherIndex === index + existing_device_detail_data.value.length
            : otherIndex === index;
        return !isSameItem && otherItem.title?.trim() === title;
    });

    if (title && isDuplicate) {
        titleError = "Judul tidak boleh duplikat";
    }

    // Update global error list
    if (isNew) {
        new_device_detail_errors.value[index] = { title: titleError, data: dataError };
    } else {
        existing_device_detail_errors.value[index] = { title: titleError, data: dataError };
    }

    return { title: titleError, data: dataError };
};



const isDeviceDetailDataEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((item, idx) => {
        const match = arr2.find(el => el.title === item.title);
        return match && match.data === item.data;
    });
};

const getEditedDeviceData = (originalDataParam, existingDataParam) => {
    const newDeleted = [];
    const newUpdated = [];
    const newAdded = [];

    const isDuplicate = (arr, title, data) => {
        return arr.some(item => item.title === title && item.data === data);
    };

    // Cek data yang dihapus
    for (const originalItem of originalDataParam) {
        const stillExists = existingDataParam.some(item => item.title === originalItem.title);
        if (!stillExists && !isDuplicate(newDeleted, originalItem.title, originalItem.data)) {
            newDeleted.push(originalItem);
        }
    }

    // Cek data yang ditambah / diubah
    for (const existingItem of existingDataParam) {
        const matchedOriginal = originalDataParam.find(item => item.title === existingItem.title);

        if (!matchedOriginal) {
            if (!isDuplicate(newAdded, existingItem.title, existingItem.data)) {
                newAdded.push(existingItem);
            }
        } else if (matchedOriginal.data !== existingItem.data) {
            if (!isDuplicate(newUpdated, existingItem.title, existingItem.data)) {
                newUpdated.push({
                    title: existingItem.title,
                    data: existingItem.data
                });
            }
        }
    }

    deleted_existing_device_detail_data.value = [...newDeleted];
    updated_existing_device_detail_data.value = [...newUpdated];
    added_existing_device_detail_data.value = [...newAdded];

    console.group("--- getEditedDeviceData ---");
    console.log("Deleted:", deleted_existing_device_detail_data.value);
    console.log("Updated:", updated_existing_device_detail_data.value);
    console.log("Added:", added_existing_device_detail_data.value);
    console.groupEnd();
};


/////////// SUBMIT ///////////


const isDisableSubmitBtn = computed(() => {
    //console.groupCollapsed("--- isDisableSubmitBtn ---");

    // 1. Validasi nama perangkat
    const isDeviceNameValid = curr_device_data.value?.name?.length >= 2 &&
        curr_device_data.value.name.length <= 255;
  //  console.log("isDeviceNameValid:", isDeviceNameValid, curr_device_data.value?.name);

    // 2. Validasi password perangkat
    const isPasswordValid = curr_device_data.value?.password?.length >= 8 &&
        curr_device_data.value.password.length <= 255;
  //  console.log("isPasswordValid:", isPasswordValid, curr_device_data.value?.password);

    // 3. Validasi interval pembacaan
    const isReadIntervalValid = typeof curr_device_data.value.read_interval === "number" &&
        curr_device_data.value.read_interval >= 1 &&
        curr_device_data.value.read_interval <= 120;
    //console.log("isReadIntervalValid:", isReadIntervalValid, curr_device_data.value?.read_interval);

    // 4. Validasi data device detail yang ada
    const isCurrDeviceDetailsDataValid = existing_device_detail_data.value.every(item =>
        item?.title?.trim() && item?.data?.trim());
   // console.log("isCurrDeviceDetailsDataValid:", isCurrDeviceDetailsDataValid);

    // 5. Validasi data device detail baru
    const isNewDeviceDetailsDataValid = new_device_detail_data.value.every(item =>
        item?.title?.trim() && item?.data?.trim());
   // console.log("isNewDeviceDetailsDataValid:", isNewDeviceDetailsDataValid);

    // 6. Apakah ada perubahan data?
    const isFieldChanged =
        curr_device_data.value?.name !== original_device_data.value?.name ||
        curr_device_data.value?.password !== original_device_data.value?.password ||
        curr_device_data.value?.read_interval !== original_device_data.value?.read_interval;

    const isDeviceDetailChanged = !isDeviceDetailDataEqual(
        existing_device_detail_data.value,
        original_device_detail_data.value
    );

    const isNewDeviceDetailFilled = new_device_detail_data.value.some(
        item => item.title?.trim() || item.data?.trim()
    );

    const isImageChanged = computed(() => {
        // Case 1: Had original image, now deleted (both new and current are empty)
        const hadImageNowDeleted = original_device_image.value.file_data &&
            !new_device_image.value.file_data &&
            !curr_device_image.value.file_data;

        // Case 2: New image uploaded
        const newImageUploaded = !!new_device_image.value.file_data;

        // Case 3: Had original image, current image is different
        const imageModified = original_device_image.value.file_data &&
            curr_device_image.value.file_data &&
            curr_device_image.value.file_data !== original_device_image.value.file_data;

        return hadImageNowDeleted || newImageUploaded || imageModified;
    });

    const isDataChanged = isFieldChanged ||
        isDeviceDetailChanged ||
        isNewDeviceDetailFilled ||
        isImageChanged.value; // Use the new computed property

    // console.log("isFieldChanged:", isFieldChanged);
    // console.log("isDeviceDetailChanged:", isDeviceDetailChanged);
    // console.log("isNewDeviceDetailFilled:", isNewDeviceDetailFilled);
    // console.log("isImageChanged:", isImageChanged);
    // console.log("isDataChanged:", isDataChanged);


    const result = !(
        isDeviceNameValid &&
        isPasswordValid &&
        isReadIntervalValid &&
        isCurrDeviceDetailsDataValid &&
        isNewDeviceDetailsDataValid &&
        isDataChanged
    );

    // console.log("FINAL isDisableSubmitBtn:", result);
    // console.groupEnd();
    return result;
});


const pending_submit_data = ref({});

const submitDeviceUpdate = () => {
    // === Initialize basic payload ===
    pending_submit_data.value = {
        data: {}
    };

    // === Compare simple fields (name, password, read_interval) ===
    const changedFields = ['name', 'password', 'read_interval'];
    changedFields.forEach(field => {
        if (curr_device_data.value[field] !== original_device_data.value[field]) {
            pending_submit_data.value[field] = curr_device_data.value[field];
        }
    });

    // === Compare Device Detail Data ===
    getEditedDeviceData(original_device_detail_data.value, existing_device_detail_data.value);

    if (updated_existing_device_detail_data.value.length > 0) {
        pending_submit_data.value.data.update = Object.fromEntries(
            updated_existing_device_detail_data.value.map(item => [item.title, item.data])
        );
    }

    if (added_existing_device_detail_data.value.length > 0) {
        pending_submit_data.value.data.insert = Object.fromEntries(
            added_existing_device_detail_data.value.map(item => [item.title, item.data])
        );
    }

    if (new_device_detail_data.value.length > 0) {
        pending_submit_data.value.data.insert = {
            ...pending_submit_data.value.data.insert,
            ...Object.fromEntries(new_device_detail_data.value.map(item => [item.title, item.data]))
        };
    }

    if (deleted_existing_device_detail_data.value.length > 0) {
        pending_submit_data.value.data.delete = deleted_existing_device_detail_data.value.map(item => item.title);
    }

    // === Handle Image ===
    const hasNewImage = new_device_image.value.file_data && new_device_image.value.file_name;
    const hasOriginalImage = original_device_image.value.file_id && original_device_image.value.file_data;

    if (hasNewImage) {
        if (hasOriginalImage) {
            // Update image
            pending_submit_data.value.image = {
                update: {
                    file_id: original_device_image.value.file_id,
                    file_name: new_device_image.value.file_name,
                    file_data: new_device_image.value.file_data
                }
            };
        } else {
            // Insert image
            pending_submit_data.value.image = {
                insert: {
                    file_name: new_device_image.value.file_name,
                    file_data: new_device_image.value.file_data
                }
            };
        }
    } else if (
        !new_device_image.value.file_data &&
        !curr_device_image.value.file_data &&
        hasOriginalImage
    ) {
        // Delete image
        pending_submit_data.value.image = {
            delete: {
                file_id: original_device_image.value.file_id
            }
        };
    }


    // Hapus "data" jika kosong agar payload bersih
    if (Object.keys(pending_submit_data.value.data).length === 0) {
        delete pending_submit_data.value.data;
    }

    // Hapus "image" jika tidak ada perubahan
    if (!pending_submit_data.value.image && Object.keys(pending_submit_data.value).length === 1) {
        delete pending_submit_data.value.image;
    }

    console.group(`---submitDeviceUpdate---`);
    console.log("submitDeviceUpdate - pending_submit_data.value:", pending_submit_data.value);
    console.groupEnd();

    popUpConfirmProps.value = {
        title: "Konfirmasi Edit Perangkat",
        message: "Apakah Anda yakin ingin mengubah perangkat ini?",
        status: "info",
    };

    popUpConfirmVisible.value = true;
};



// Confirmed by user
const handleConfirm = async () => {
    popUpConfirmVisible.value = false;

    if (!pending_submit_data.value) return;

    const isSuccess = await updateDeviceData(original_device_data.value.id, pending_submit_data.value);
    if (isSuccess) {
        pending_submit_data.value = null;
        router.push({ name: "device-management" });
    }
};


const handleCancel = () => {
    popUpConfirmVisible.value = false;
    pending_submit_data.value = null;
};







async function updateDeviceData(deviceIdparam, deviceChangeFieldsParam) {
    const baseUrl = BASE_API_URL;
    const operation = "update_device_data";

    console.group("-----updateDeviceData----");
    isLoading.value = true;

    console.log("updateDeviceData - deviceIdparam:", deviceIdparam);
    console.log("updateDeviceData - deviceChangeFieldsParam:", deviceChangeFieldsParam);

    const params = {
        device_id: deviceIdparam,
        change_fields: deviceChangeFieldsParam,
    };
    console.log("Final params:", params);

    try {
        const response_be = await Process(baseUrl, operation, params);

        if (!response_be || response_be.status !== "success") {
            // Explicitly throw with detailed error
            const message = response_be?.error_message || "Gagal memperbarui data perangkat";
            const code = response_be?.error_code || "UNKNOWN_ERROR";
            throw { message, code };
        }

        // Success handling
        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Data perangkat berhasil diperbaharui",
            errorCode: "DEVICE_UPDATED",
        };

        const newDeviceId = response_be.payload?.device_id;
        console.log("New device ID:", newDeviceId);

        return true;

    } catch (error) {
        console.error("Error updating device:", error);

        popUpInfoProps.value = {
            status: "error",
            errorMessage: error.message || "Terjadi kesalahan saat memperbarui data perangkat",
            errorCode: error.code || "UPDATE_DEVICE_ERROR",
        };

        return false;
    } finally {
        popUpInfoVisible.value = true;
        isLoading.value = false;
        console.groupEnd();
    }
};








//////////// 


/* exp : {"id":62,"name":"coba","password":"qwerqwer","create_timestamp":1747663685,"status":0,"last_timestamp":1747663685,"read_interval":5,"data":{"qwe":"qwer"},"image":{"file_id":26,"file_name":"coba_20250519210805","file_data":"/9j/4AAQSkZJRgABAQEBLAEsAAD/4QA...l0ZW0jIiJjRnRxN */
onMounted(() => {
    const user_data = JSON.parse(localStorage.getItem('user_data'));
    user_role.value = user_data?.role;

    console.group("---onMounted---")

    const allowedRoles = ["system master", "system_admin"];
    if (!allowedRoles.includes(user_role.value?.trim())) {
        router.push({ name: "device-management" });
    }

    const rawDeviceData = sessionStorage.getItem("device_management");

    try {
        const parsedData = JSON.parse(rawDeviceData);

        // Buang 'data' dan 'image' dari parsedData
        const { data, image, ...rest } = parsedData;

        // Assign hanya properti selain 'data' dan 'image'
        Object.assign(curr_device_data.value, rest);

        console.log("onMounted - parsedData: ", parsedData);

        // Simpan original device (shallow copy cukup, tergantung kebutuhan)
        original_device_data.value = { ...curr_device_data.value };

        // === Handle data field ===
        if (data) {
            const dataArray = Object.entries(data).map(([key, value]) => ({
                title: key,
                data: value
            }));


            if (original_device_detail_data.value.length === 0) {
                const deepCopy = JSON.parse(JSON.stringify(dataArray));
                original_device_detail_data.value = deepCopy;
                existing_device_detail_data.value = JSON.parse(JSON.stringify(deepCopy));
            }

        }

        // === Handle image field ===
        if (image) {
            console.log("onMounted - image: ", image)
            original_device_image.value = { ...image };
            curr_device_image.value = { ...image };
        }

    } catch (error) {
        console.error("Failed to parse device_management data:", error);
        router.push({ name: "device-management" });
    }

});


watch(
    () => curr_device_data.value,
    (newVal) => {
        if (!newVal) return;

        console.log("--- Watch Triggered ---", newVal);

        updated_existing_device_detail_data.value = [];
        deleted_existing_device_detail_data.value = [];
        added_existing_device_detail_data.value = [];

        // Handle image updates
        if (newVal.image?.file_id) {
            curr_device_image.value.image = {
                file_id: newVal.image.file_id,
                file_name: newVal.image.file_name || "",
            };
        }

        if (newVal.image?.file_data) {
            curr_device_image.value.image.file_data = newVal.image.file_data || "";
        }
    },
    { immediate: true, deep: true }
);







const backToDeviceManagPage = () => {
    router.push({ name: "device-management" });
};
</script>