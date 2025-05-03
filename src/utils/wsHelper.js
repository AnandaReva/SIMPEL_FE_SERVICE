import CryptoJS from "crypto-js";





function generateToken(sessionIdParam, sessionHashParam) {


    if (!sessionIdParam || !sessionHashParam) {
        console.error("⚠️ Missing session credentials. Token generation aborted.");
        return "";
    }

    const message = sessionIdParam + sessionHashParam;
    const token = CryptoJS.HmacSHA256(message, sessionHashParam).toString();
    return token;
}


export async function CreateSocketConnection(base_url, process_name, params = {}) {
    try {
        const session_id = localStorage.getItem("session_id") || "";
        const session_hash = localStorage.getItem("session_hash") || "";

        if (!session_id || !session_hash) {
            console.error("⚠️ Missing session credentials. Token generation aborted.");
            return null;
        }

        const token = generateToken(session_id, session_hash);
        if (!token) {
            console.error("⚠️ Token generation failed.");
            return null;
        }

        const query = new URLSearchParams({
            token: token,
            session_id: session_id,
            ...params,
        }).toString();

        const socketUrl = `${base_url}${process_name}?${query}`;
        const socket = new WebSocket(socketUrl);

        socket.onopen = () => {
            console.log("✅ WebSocket connected:", socketUrl);
        };

        return socket;
    } catch (err) {
        console.error("🚨 WebSocket initialization error:", err.message);
        return null;
    }
}

