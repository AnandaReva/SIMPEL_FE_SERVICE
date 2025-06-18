<template>
    <v-container fluid class="pa-4 elevation-0 fill-height" :class="{ 'disable-interactions': isLoading }">
        <v-card color="base" elevation="0" style="height: 100%; width: 100%;" class="pa-2">
            <v-col cols="12">
                <v-btn @click="backToUserManagPage()" color="primary" elevation="2" class="ma-0">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-card flat class="px-4 py-2 mb-4">
                    <p class="text-h6 font-weight-medium text-center mb-0">EDIT DATA PENGGUNA</p>
                </v-card>
            </v-col>

            <v-col cols="12" class="pa-0">
                <div class="scrollable-content">
                    <!-- Informasi Dasar Pengguna -->
                    <v-card outlined class="mb-4">
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Nama Lengkap</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-file-account</v-icon>
                                        <v-text-field maxlength="255" v-model="curr_user_data.full_name" label="Nama Lengkap" outlined
                                            dense :rules="full_name_rules" required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Username</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-account</v-icon>
                                        <v-text-field maxlength="255" v-model="curr_user_data.username" label="Nama Pengguna" outlined
                                            dense :rules="username_rules" required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6" class="mb-4">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Email</p>
                                    <v-card flat class="pa-3 d-flex align-center">
                                        <v-icon size="24" color="primary" class="mr-2">mdi-email</v-icon>
                                        <v-text-field maxlength="255" v-model="curr_user_data.email" label="Email Pengguna" outlined
                                            dense :rules="emailRules" required></v-text-field>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Peran</p>
                                    <v-card flat class="pa-3">
                                        <v-select v-model="curr_user_data.role" :items="availableRoles"
                                            label="Peran Pengguna" outlined dense :rules="role_rules"
                                            required></v-select>
                                    </v-card>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <p class="text-subtitle-1 font-weight-medium mb-2">Status</p>
                                    <v-card flat class="pa-3">
                                        <v-switch v-model="curr_user_data.status"
                                            :label="curr_user_data.status === 1 ? 'Aktif' : 'Tidak Aktif'" :value="1"
                                            :false-value="0" color="primary" hide-details />
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <!-- Data Pengguna -->
                    <v-card outlined class="mb-4">
                        <v-card-title class="d-flex align-center">
                            <v-icon size="24" color="primary" class="mr-2">mdi-information</v-icon>
                            <span class="text-subtitle-1 font-weight-medium">Data Tambahan Pengguna</span>
                        </v-card-title>
                        <v-card-text style="max-height: 300px; overflow-y: auto;">
                            <div class="scrollable-container pa-0 border ma-0"
                                style="max-height: 300px; overflow-y: auto;">
                                <!-- Existing Data Fields -->
                                <v-container v-for="(currData, index) in existing_user_detail_data"
                                    :key="'existing-' + index">
                                    <v-row>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="currData.title" outlined label="Judul"
                                                :error-messages="existing_user_detail_errors[index]?.title || ''"
                                                @blur="validateUserDetailData(currData, index, false)"></v-text-field>
                                        </v-col>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="currData.data" outlined label="Isi Data"
                                                :error-messages="existing_user_detail_errors[index]?.data || ''"
                                                @blur="validateUserDetailData(currData, index, false)"></v-text-field>
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
                                <v-container v-for="(newData, index) in new_user_detail_data" :key="'new-' + index">
                                    <v-row>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="newData.title" outlined label="Judul"
                                                :error-messages="new_user_detail_errors[index]?.title || ''"
                                                @blur="validateUserDetailData(newData, index, true)"></v-text-field>
                                        </v-col>
                                        <v-col cols="5.5" class="px-1 py-0">
                                            <v-text-field v-model="newData.data" outlined label="Isi Data"
                                                :error-messages="new_user_detail_errors[index]?.data || ''"
                                                @blur="validateUserDetailData(newData, index, true)"></v-text-field>
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
                        :disabled="isDisableSubmitBtn" @click="submitUserUpdate">
                        Perbarui Data Pengguna
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

// Role Management
const availableRoles = ref([]);

const roleHierarchy = {
    "system master": ["system admin", "system user"],
    "system admin": ["system user"],
    "system user": []
};

// Validation rules
const emailRegrex = ref(/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i);
const usernameRegrex = ref(/^[A-Za-z0-9~!@#$%^&*()_+<>?/':=.,-]+$/);

// Rules
const username_rules = [
    (v) => !!v || "Username harus diisi",
    (v) => v.length >= 2 || "Username minimal 2 karakter",
    (v) => v.length <= 255 || "Username maksimal 255 karakter",
    (v) => usernameRegrex.value.test(v) || "Username hanya boleh mengandung huruf, angka, dan simbol '~!@#$%^&*()_+<>?/':=.,-'"
];

const emailRules = [
    (v) => !!v || "Email harus diisi",
    (v) => emailRegrex.value.test(v) || "Format email tidak valid",
];

const full_name_rules = [
    (v) => !!v || "Nama lengkap harus diisi",
    (v) => v.length >= 3 || "Nama minimal 3 karakter",
    (v) => v.length <= 255 || "Nama maksimal 255 karakter"
];

const role_rules = [
    (v) => !!v || "Peran harus dipilih",
    (v) => availableRoles.value.includes(v) || "Peran tidak valid"
];

// State Management
const popUpConfirmVisible = ref(false);
const popUpConfirmProps = ref({
    title: "",
    message: "",
    status: "",
});

const popUpInfoVisible = ref(false);
const popUpInfoProps = ref({
    status: "",
    errorMessage: "",
    errorCode: "",
});
const isLoading = ref(false);
const closePopUpInfo = () => {
    popUpInfoVisible.value = false;
};

// User Data
const curr_user_data = ref({
    full_name: "",
    username: "",
    email: "",
    role: "",
    status: null
});

const original_user_data = ref({
    full_name: "",
    username: "",
    email: "",
    role: "",
    status: null
});

// User Detail Data
const existing_user_detail_data = ref([]);
const new_user_detail_data = ref([]);
const original_user_detail_data = ref([]);
const updated_existing_user_detail_data = ref([]);
const deleted_existing_user_detail_data = ref([]);
const added_existing_user_detail_data = ref([]);

// Methods
const addNewDataField = () => {
    if (new_user_detail_data.value.length === 0 ||
        (new_user_detail_data.value[new_user_detail_data.value.length - 1].title &&
            new_user_detail_data.value[new_user_detail_data.value.length - 1].data)) {
        new_user_detail_data.value.push({ title: "", data: "" });
    }
};

const removeExistingDataField = (index) => {
    const deletedItem = existing_user_detail_data.value[index];
    deleted_existing_user_detail_data.value.push(deletedItem);
    existing_user_detail_data.value.splice(index, 1);
};

const removeNewDataField = (index) => {
    new_user_detail_data.value.splice(index, 1);
};

const isDisableAddContainer = computed(() => {
    if (new_user_detail_data.value.length === 0) return false;
    const lastItem = new_user_detail_data.value[new_user_detail_data.value.length - 1];
    return !lastItem.title.trim() || !lastItem.data.trim();
});

const existing_user_detail_errors = ref([]);
const new_user_detail_errors = ref([]);

const validateUserDetailData = (item, index, isNew = false) => {
    const title = item.title?.trim();
    const data = item.data?.trim();
    const allItems = [
        ...existing_user_detail_data.value,
        ...new_user_detail_data.value
    ];

    let titleError = "";
    let dataError = "";

    if (!title) titleError = "Judul tidak boleh kosong";
    if (!data) dataError = "Isi data tidak boleh kosong";

    const isDuplicate = allItems.some((otherItem, otherIndex) => {
        const isSameItem = isNew
            ? otherIndex === index + existing_user_detail_data.value.length
            : otherIndex === index;
        return !isSameItem && otherItem.title?.trim() === title;
    });

    if (title && isDuplicate) {
        titleError = "Judul tidak boleh duplikat";
    }

    if (isNew) {
        new_user_detail_errors.value[index] = { title: titleError, data: dataError };
    } else {
        existing_user_detail_errors.value[index] = { title: titleError, data: dataError };
    }

    return { title: titleError, data: dataError };
};

const isUserDetailDataEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((item, idx) => {
        const match = arr2.find(el => el.title === item.title);
        return match && match.data === item.data;
    });
};

const getEditedUserData = (originalDataParam, existingDataParam) => {
    const newDeleted = [];
    const newUpdated = [];
    const newAdded = [];

    const isDuplicate = (arr, title, data) => {
        return arr.some(item => item.title === title && item.data === data);
    };

    // Check deleted data
    for (const originalItem of originalDataParam) {
        const stillExists = existingDataParam.some(item => item.title === originalItem.title);
        if (!stillExists && !isDuplicate(newDeleted, originalItem.title, originalItem.data)) {
            newDeleted.push(originalItem);
        }
    }

    // Check added/modified data
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

    deleted_existing_user_detail_data.value = [...newDeleted];
    updated_existing_user_detail_data.value = [...newUpdated];
    added_existing_user_detail_data.value = [...newAdded];
};

// Submit Logic
const isDisableSubmitBtn = computed(() => {
    // Validate basic fields
    const isFullNameValid = full_name_rules.every(rule => rule(curr_user_data.value.full_name) === true);
    const isUsernameValid = username_rules.every(rule => rule(curr_user_data.value.username) === true);
    const isEmailValid = emailRules.every(rule => rule(curr_user_data.value.email) === true);
    const isRoleValid = role_rules.every(rule => rule(curr_user_data.value.role) === true);

    // Validate existing data
    const isCurrUserDetailsDataValid = existing_user_detail_data.value.every(item =>
        item?.title?.trim() && item?.data?.trim());

    // Validate new data
    const isNewUserDetailsDataValid = new_user_detail_data.value.every(item =>
        item?.title?.trim() && item?.data?.trim());

    // Check for changes
    const isBasicDataChanged = 
        curr_user_data.value.full_name !== original_user_data.value.full_name ||
        curr_user_data.value.username !== original_user_data.value.username ||
        curr_user_data.value.email !== original_user_data.value.email ||
        curr_user_data.value.role !== original_user_data.value.role ||
        curr_user_data.value.status !== original_user_data.value.status;

    const isUserDetailChanged = !isUserDetailDataEqual(
        existing_user_detail_data.value,
        original_user_detail_data.value
    );
    const isNewUserDetailFilled = new_user_detail_data.value.some(
        item => item.title?.trim() || item.data?.trim()
    );

    const isDataChanged = isBasicDataChanged || isUserDetailChanged || isNewUserDetailFilled;

    return !(
        isFullNameValid &&
        isUsernameValid &&
        isEmailValid &&
        isRoleValid &&
        isCurrUserDetailsDataValid &&
        isNewUserDetailsDataValid &&
        isDataChanged
    );
});

const pending_submit_data = ref({});

const submitUserUpdate = () => {
    pending_submit_data.value = {};

    // Check for basic data changes
    if (curr_user_data.value.full_name !== original_user_data.value.full_name) {
        pending_submit_data.value.full_name = curr_user_data.value.full_name;
    }
    if (curr_user_data.value.username !== original_user_data.value.username) {
        pending_submit_data.value.username = curr_user_data.value.username;
    }
    if (curr_user_data.value.email !== original_user_data.value.email) {
        pending_submit_data.value.email = curr_user_data.value.email;
    }
    if (curr_user_data.value.role !== original_user_data.value.role) {
        pending_submit_data.value.role = curr_user_data.value.role;
    }
    if (curr_user_data.value.status !== original_user_data.value.status) {
        pending_submit_data.value.status = curr_user_data.value.status;
    }

    // Handle user detail data changes
    getEditedUserData(original_user_detail_data.value, existing_user_detail_data.value);

    if (updated_existing_user_detail_data.value.length > 0) {
        pending_submit_data.value.data = pending_submit_data.value.data || {};
        pending_submit_data.value.data.update = Object.fromEntries(
            updated_existing_user_detail_data.value.map(item => [item.title, item.data])
        );
    }

    if (added_existing_user_detail_data.value.length > 0) {
        pending_submit_data.value.data = pending_submit_data.value.data || {};
        pending_submit_data.value.data.insert = Object.fromEntries(
            added_existing_user_detail_data.value.map(item => [item.title, item.data])
        );
    }

    if (new_user_detail_data.value.length > 0) {
        pending_submit_data.value.data = pending_submit_data.value.data || {};
        pending_submit_data.value.data.insert = {
            ...(pending_submit_data.value.data.insert || {}),
            ...Object.fromEntries(new_user_detail_data.value.map(item => [item.title, item.data]))
        };
    }

    if (deleted_existing_user_detail_data.value.length > 0) {
        pending_submit_data.value.data = pending_submit_data.value.data || {};
        pending_submit_data.value.data.delete = deleted_existing_user_detail_data.value.map(item => item.title);
    }

    popUpConfirmProps.value = {
        title: "Konfirmasi Edit Pengguna",
        message: "Apakah Anda yakin ingin mengubah data pengguna ini?",
        status: "info",
    };

    popUpConfirmVisible.value = true;
};

const handleConfirm = async () => {
    popUpConfirmVisible.value = false;

    if (!pending_submit_data.value) return;

    const isSuccess = await updateUserData(original_user_data.value.id, pending_submit_data.value);
    if (isSuccess) {
        pending_submit_data.value = null;
        router.push({ name: "user-management" });
    }
};

const handleCancel = () => {
    popUpConfirmVisible.value = false;
    pending_submit_data.value = null;
};

async function updateUserData(userIdparam, userChangeFieldsParam) {
    const baseUrl = BASE_API_URL;
    const operation = "update_user_data";

    isLoading.value = true;

    const params = {
        user_id: userIdparam,
        change_fields: userChangeFieldsParam,
    };

    try {
        const response_be = await Process(baseUrl, operation, params);

        if (!response_be || response_be.status !== "success") {
            const message = response_be?.error_message || "Gagal memperbarui data Pengguna";
            const code = response_be?.error_code || "UNKNOWN_ERROR";
            throw { message, code };
        }

        popUpInfoProps.value = {
            status: "success",
            errorMessage: "Data Pengguna berhasil diperbaharui",
            errorCode: "USER_UPDATED",
        };

        return true;

    } catch (error) {
        console.error("Error updating user:", error);
        popUpInfoProps.value = {
            status: "error",
            errorMessage: error.message || "Terjadi kesalahan saat memperbarui data Pengguna",
            errorCode: error.code || "UPDATE_USER_ERROR",
        };
        return false;
    } finally {
        popUpInfoVisible.value = true;
        isLoading.value = false;
    }
};

onMounted(() => {
    const editor_user_data = JSON.parse(localStorage.getItem('user_data'));
    const editor_role = editor_user_data?.role?.trim();

    let rawUserData = sessionStorage.getItem("user_management") || sessionStorage.getItem("user_role");

    if (!editor_user_data || !rawUserData) {
        router.push({ name: "user-management" });
        return;
    }

    try {
        const parsedData = JSON.parse(rawUserData);
        const edited_user_role = parsedData?.role?.trim();

        // Tentukan allowedRoles dari roleHierarchy
        const allowedRolesToEdit = roleHierarchy[editor_role] || [];

        if (!allowedRolesToEdit.includes(edited_user_role)) {
            console.warn("Editor tidak memiliki izin untuk mengedit user ini");
            router.push({ name: "user-management" });
            return;
        }

        // Atur role yang tersedia pada dropdown sesuai hierarki
        availableRoles.value = [...allowedRolesToEdit];

        // Proses data
        const { data, image, ...rest } = parsedData;
        Object.assign(curr_user_data.value, rest);
        original_user_data.value = { ...rest };

        if (data && typeof data === "object") {
            const dataArray = Object.entries(data).map(([key, value]) => ({
                title: key,
                data: value
            }));
            if (original_user_detail_data.value.length === 0) {
                const deepCopy = JSON.parse(JSON.stringify(dataArray));
                original_user_detail_data.value = deepCopy;
                existing_user_detail_data.value = JSON.parse(JSON.stringify(deepCopy));
            }
        }

    } catch (error) {
        console.error("Gagal parse data user:", error);
        router.push({ name: "user-management" });
    }
});

const backToUserManagPage = () => {
    router.push({ name: "user-management" });
};
</script>