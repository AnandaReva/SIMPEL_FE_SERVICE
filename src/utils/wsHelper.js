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


export async function createSocketConnection(base_url, process_name, params = {}) {
    try {
        const session_id = localStorage.getItem("session_id") || "";
        if (!session_id) throw new Error("Missing session_id. WebSocket connection aborted.");

        const device_id = params.device_id;
        if (!device_id) throw new Error("Missing device_id. WebSocket connection aborted.");

        const token = generateToken(device_id);
        if (!token) throw new Error("Invalid token. WebSocket connection aborted.");

        const socketUrl = `${base_url}/${process_name}?token=${encodeURIComponent(token)}&session_id=${encodeURIComponent(session_id)}&device_id=${encodeURIComponent(device_id)}`;
        const socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("✅ WebSocket connected:", socketUrl);
        };

        socket.onmessage = (event) => {
            console.log("📡 Data received:", event.data);
        };

        socket.onclose = (event) => {
            console.warn("❌ WebSocket disconnected:", event.reason);
            // Reconnect setelah 3 detik
            setTimeout(() => {
                console.log("🔄 Reconnecting WebSocket...");
                createSocketConnection(base_url, process_name, params);
            }, 3000);
        };

        socket.onerror = (error) => {
            console.error("⚠️ WebSocket error:", error);
        };

        return socket;
    } catch (err) {
        console.error("🚨 WebSocket initialization error:", err.message);
        return { error: err.message };
    }
}
