/* import { BASE_API_URL } from "@/configs/config";

export function getWsUrl(device_id, session_id, session_hash) {
    const  queryParams = new URLSearchParams({ 
        session_id: encodeURIComponent(session_id), 
        session_hash: encodeURIComponent(session_hash), 
        device_id: encodeURIComponent(device_id)
    }).toString();
    
    // Pastikan URL tidak memiliki double slash dan menggunakan protokol WebSocket
    return `${BASE_API_URL.replace(/\/$/, "").replace(/^http/, "ws")}/user-connect?${queryParams}`;
}

const createSocketConnection = (device_id) => {
    const session_id = localStorage.getItem("session_id") || "";
    const session_hash = localStorage.getItem("session_hash") || "";

    if (!session_id || !session_hash) {
        console.error("⚠️ Missing session credentials. WebSocket connection aborted.");
        return null;
    }

    const wsUrl = getWsUrl(device_id, session_id, session_hash);
    console.log("🌐 Connecting to WebSocket:", wsUrl);

    let socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log("✅ WebSocket connected:", wsUrl);
    };

    socket.onmessage = (event) => {
        console.log("📡 Data received:", event.data);
    };

    socket.onclose = (event) => {
        console.warn("❌ WebSocket disconnected:", event.reason);
        // Implementasi reconnect otomatis setelah 3 detik
        setTimeout(() => {
            console.log("🔄 Reconnecting WebSocket...");
            createSocketConnection(device_id);
        }, 3000);
    };

    socket.onerror = (error) => {
        console.error("⚠️ WebSocket error:", error);
    };

    return socket;
};

// Fungsi untuk memulai koneksi WebSocket dari komponen Vue
export const connectWebSocket = (device_id) => {
    return createSocketConnection(device_id);
};
 */



import CryptoJS from "crypto-js";

function generateToken(device_id) {
    const session_id = localStorage.getItem("session_id") || "";
    const session_hash = localStorage.getItem("session_hash") || "";

    if (!session_id || !session_hash) {
        console.error("⚠️ Missing session credentials. Token generation aborted.");
        return "";
    }

    const message = session_id + device_id;
    const token = CryptoJS.HmacSHA256(message, session_hash).toString();

    return token;
}

const WS_API_URL = "ws://localhost:5001/user-connect"; // Hardcode URL WebSocket

const createSocketConnection = (device_id) => {
    const session_id = localStorage.getItem("session_id") || "";
    if (!session_id) {
        console.error("⚠️ Missing session_id. WebSocket connection aborted.");
        return null;
    }

    const token = generateToken(device_id);
    if (!token) {
        console.error("⚠️ Invalid token. WebSocket connection aborted.");
        return null;
    }

    // Buat instance WebSocket dengan URL yang sesuai dengan BE
    const socket = new WebSocket(`${WS_API_URL}?token=${encodeURIComponent(token)}&session_id=${encodeURIComponent(session_id)}&device_id=${encodeURIComponent(device_id)}`);

    socket.onopen = () => {
        console.log("✅ WebSocket connected:", WS_API_URL);
    };

    socket.onmessage = (event) => {
        console.log("📡 Data received:", event.data);
    };

    socket.onclose = (event) => {
        console.warn("❌ WebSocket disconnected:", event.reason);
        // Implementasi reconnect otomatis setelah 3 detik
        setTimeout(() => {
            console.log("🔄 Reconnecting WebSocket...");
            createSocketConnection(device_id);
        }, 3000);
    };

    socket.onerror = (error) => {
        console.error("⚠️ WebSocket error:", error);
    };

    return socket;
};

// Fungsi untuk memulai koneksi WebSocket dari komponen Vue
export const connectWebSocket = (device_id) => {
    return createSocketConnection(device_id);
};
