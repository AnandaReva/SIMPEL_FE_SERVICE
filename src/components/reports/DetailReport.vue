<template>


</template>


<script setup>

//===================== MONTH ======================//
const month_list = ref([])
const curr_month = ref(null)

const getReportMonthList = async (yearParam) => {
    if (isFetchingMonths.value) return

    isFetchingMonths.value = true
    isLoading.value = true

    try {
        const operation = 'get_month_list'
        const params = {
            year: yearParam,
            device_id: curr_device.value.id

        }

        console.log("getReportYearList -  params:", params);


        const response = await Process(BASE_API_URL, operation, params)

        if (response.status !== 'success') {
            throw new Error(response.error_message || 'Failed to fetch months')
        }

        month_list.value = (response.payload.months || []).map(month => ({
            month_number: month.month_number,
            month_name: month.month_name,
            text: `${month.month_name} (${month.total_data} data)`,
            total_data: month.total_data,
        }))
    } catch (error) {
        console.error('Error fetching months:', error)
        popUpProps.value = {
            status: 'error',
            errorMessage: 'Gagal mendapatkan data bulan tersedia',
            errorCode: error.errorCode || 'UNKNOWN_ERROR',
        }
        popupVisible.value = true
    } finally {
        isFetchingMonths.value = false
        isLoading.value = false
    }
}



</script>