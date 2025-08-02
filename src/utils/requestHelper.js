// src/utils/requestHelper.js

import axios from "axios";
import { HmacSHA256 } from "crypto-js";

/**
 * Mengembalikan base URL otentikasi.
 * @returns {string} - URL otentikasi.
 */
// export function getAuthUrl() {
//   return BASE_AUTH_URL;
// }

// export function getApiUrl() {
//   return BASE_API_URL;
// }

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
  console.group("---Auth_Process---")

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
      ? { error_code: "000", error_message: "", payload, status: "success" }
      : {
        error_code: errorCode,
        error_message: errorMessage,
        payload,
        status: "error",
      };
  } catch (error) {
    console.error("🚨 Request error:", error);

    const errorCode =
      error.response?.status?.toString() ||
      (error.message === "Network Error" ? "503" : "999999");

    const errorMessage =
      error.response?.data?.ErrorMessage || error.message || "";
    const payload = error.response?.data?.Payload || {};
    console.error("disini:", errorMessage);
    return {
      error_code: errorCode, // Sekarang tetap 401 jika backend mengirim 401
      error_message: errorMessage,
      payload: payload,
      status: "error",
    };
  } finally {
    console.groupEnd();
  }
}

////////////////////////////////////////////////////////////////

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


import { DeepSortObject } from "./utils.js";
import router from "@/router";

export async function Process(apiUrl, process_name, params = {}) {
  console.groupCollapsed("--- Process:", process_name, "---");

  try {
    const fullUrl = `${apiUrl}process`;
    console.log("📡 Request ke:", fullUrl);

    // Urutkan params berdasarkan huruf a-z
    params = DeepSortObject(params);
    console.log("🔄 Parameters (sorted):", params);

    // Ambil session_id dan session_hash dari localStorage
    const session_id = localStorage.getItem("session_id") || "";
    const session_hash = localStorage.getItem("session_hash") || "";

    // Stringify body untuk enkripsi
    const bodyString = JSON.stringify(params);
    console.log("🔏 HMAC message:", bodyString);
    console.log("🔑 HMAC key:", session_hash);

    // Generate HMAC-SHA256 hash
    const signature = HmacSHA256(bodyString, session_hash).toString();
    console.log("🧾 HMAC signature:", signature);

    // Konfigurasi headers
    const headers = {
      "Content-Type": "application/json",
      session_id,
      signature,
      process: process_name,
    };

    // Kirim request ke backend
    const { data } = await axios.post(fullUrl, params, { headers });
    console.log("✅ Response:", data);

    const errorCode = data?.error_code || "999999";
    const errorMessage = data?.error_message || "Unknown error";
    const payload = data?.payload || {};

    return {
      error_code: errorCode,
      error_message: errorCode === "000000" ? "" : errorMessage,
      payload,
      status: errorCode === "000000" ? "success" : "error",
    };
  } catch (error) {
    console.error("🚨 Request error:", error);

    const errorCode =
      error.response?.status?.toString() ||
      (error.message === "Network Error" ? "503" : "999999");

    const errorMessage = error.response?.data?.ErrorMessage || "";
    const payload = error.response?.data?.Payload || {};

    if (errorCode === "401") {
      console.warn("⚠️ Unauthorized (401) detected. Clearing session and redirecting...");
      localStorage.removeItem("session_id");
      localStorage.removeItem("session_hash");
      localStorage.removeItem("user_data");
      sessionStorage.removeItem("otp_data");
      sessionStorage.removeItem("otp_expire_tstamp");

      router.push({ name: "login" });
    }

    return {
      error_code: errorCode,
      error_message: errorMessage,
      payload,
      status: "error",
    };
  } finally {
    console.groupEnd();
  }
}