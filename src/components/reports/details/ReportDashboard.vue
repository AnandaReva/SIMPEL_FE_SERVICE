




/* const MonthlyData = async (device_id, firstDayOfYear, lastDayOfYear) => {

    const baseUrl = getApiUrl();
    const operation = "get_monthly_data";
    const params = {
        device_id: deviceId,
        upper_limit: upperlimitCurrYearEpoch,
        lower_limit: lowerlimitCurrYearEpoch,
    };

    console.log("params:", params);
    const response_be = await Process(baseUrl, operation, params);


    //  console.log("login response_be:", response_be);

    if (response_be.error_code != "000") {
        console.error(`${operation} FAILED!!: ${response_be.error_message}`);
        popUpProps.value = {
            status: response_be.status,
            errorMessage: response_be.error_message,
            errorCode: response_be.error_code,
        };
        popupVisible.value = true;
        return;
    }

    console.log(opreation, " SUCCESS!!:");
    console.log("data from response:" + response_be.payload.monthly_data);

    
    return;
};


// Fungsi untuk mengonversi Date ke epoch (milidetik)
function getEpoch(date) {
    return date.getTime();
}

// Mendapatkan tanggal pertama dan terakhir tahun ini
const now = new Date();
const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
const lastDayOfYear = new Date(now.getFullYear(), 11, 31);

// Set nilai epoch
upperLimitCurrYearEpoch.value = getEpoch(lastDayOfYear);
lowerLimitCurrYearEpoch.value = getEpoch(firstDayOfYear);

console.log("First Day of the Year (Epoch):", lowerLimitCurrYearEpoch.value);
console.log("Last Day of the Year (Epoch):", upperLimitCurrYearEpoch.value);
 */
