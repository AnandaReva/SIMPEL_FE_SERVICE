// src/utils/requestHelper.js

import axios from "axios";
import { BASE_AUTH_URL } from "@/configs/config";
import { BASE_API_URL } from "@/configs/config";



/**
 * Mengembalikan base URL otentikasi.
 * @returns {string} - URL otentikasi.
 */
export function getAuthUrl() {
    return BASE_AUTH_URL;
}


export function getApiUrl() {
    return BASE_API_URL;
}


/**
 * Template request handler untuk komunikasi dengan backend.
 * @param {string} baseUrl - Base URL API.
 * @param {string} process_name - Operasi atau action yang ingin dilakukan.
 * @param {Object} params - Parameter tambahan untuk request.
 * @returns {Promise<Object>} - Response dari server.
 */


/*
               return dengan format
               'response_be' : {
                   'error_code' : '401',
                   'error_message' : 'Unauthorized',
                   'payload' : {},
       
}  
exp error: {
    "ErrorCode": "401000",
    "ErrorMessage": "Unauthorized",
    "Payload": {}
} 
    
exp success:
{
    "ErrorCode": "000000",
    "ErrorMessage": "",
    "Payload": {
        "full_nonce": "12345678wAbk2Csd",
        "salt": "O07HoiEWKqelbTM8"
    }
}

*/
export async function Auth_Process(baseUrl, process_name, params = {}) {
    try {
        const fullUrl = `${baseUrl}${process_name}`;
        console.log("📡 Request ke:", fullUrl);
        console.log("🔄 Parameters:", params);

        const { data } = await axios.post(fullUrl, params);
        console.log("✅ Response:", data);

        const errorCode = data?.ErrorCode?.slice(0, 3) || "999999";
        const errorMessage = data?.ErrorMessage || "Unknown error";
        const payload = data?.Payload || {};

        return errorCode === "000"
            ? { error_code: "000", error_message: "", payload, status: 'success' }
            : { error_code: errorCode, error_message: errorMessage, payload, status: 'error' };
    } catch (error) {
        console.error("🚨 Request error:", error);
        return {
            error_code: "503",
            error_message: error.message || "Network error",
            payload: {},
            status: 'error'
        };
    }
}





////////////////////////////////////////////////////////////////


import { HmacSHA256 } from "crypto-js";
/* 
    send request  format
    header: session_id : localStorage.get('session_id')
    header: hash :  hmac-sha256(body + session_hash)

    body: params


    get response fromat:

    hmac-sha256





    body exp : 
{
    "ErrorCode": "000000",
    "ErrorMessage": "",
    "Payload": {
        "full_nonce": "12345678wAbk2Csd",
        "salt": "O07HoiEWKqelbTM8"
    }
}





*/

export async function Process(apiUrl, process_name, params = {}) {
    try {
        const fullUrl = `${apiUrl}/process`;
        console.log("📡 Request ke:", fullUrl);
        console.log("🔄 Parameters:", params);

        // Ambil session_id dari localStorage
        const session_id = localStorage.getItem('session_id') || "";
        const session_hash = localStorage.getItem('session_hash') || "";

        // Stringify body untuk enkripsi
        const bodyString = JSON.stringify(params);

        // Generate HMAC-SHA256 hash
        const hash = HmacSHA256(bodyString + session_hash, session_hash).toString();

        // Konfigurasi headers

        const headers = {
            'Content-Type': 'application/json',
            'session_id': session_id,
            'hash': hash,
            'process' : process_name
        };

        // Kirim request ke backend
        const { data } = await axios.post(fullUrl, params, { headers });

        console.log("✅ Response:", data);

        // Proses response
        const errorCode = data?.ErrorCode?.slice(0, 3) || "999999";
        const errorMessage = data?.ErrorMessage || "Unknown error";
        const payload = data?.Payload || {};

        // Fungsi untuk verifikasi hash dari server response
        const verifyServerResponse = (response) => {
            const { Payload, Hash } = response;
            const responseString = JSON.stringify(Payload);
            const calculatedHash = HmacSHA256(responseString + session_hash, session_hash).toString();

            if (calculatedHash !== Hash) {
                console.error("❌ Invalid response hash! Possible data tampering.");
                return false;
            }

            console.log("✅ Valid response hash!");
            return true;
        };

        // Verifikasi response dari server
        if (errorCode === "000" && !verifyServerResponse(data)) {
            return { error_code: "400", error_message: "Invalid response", payload: {}, status: 'error' };
        }

        return errorCode === "000"
            ? { error_code: "000", error_message: "", payload, status: 'success' }
            : { error_code: errorCode, error_message: errorMessage, payload, status: 'error' };
    } catch (error) {
        console.error("🚨 Request error:", error);
        return {
            error_code: "503",
            error_message: error.message || "Network error",
            payload: {},
            status: 'error'
        };
    }
}

// WEBSOCKET




