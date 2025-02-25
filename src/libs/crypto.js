import CryptoJS from "crypto-js";

/**
 * Generate HMAC-SHA256
 * @param {string} text - Text to hash
 * @param {string} key - Secret key
 * @returns {[string, string]} - [hashed value, error message]
 */
export function GenerateHMAC(text, key) {
    
    if (!text || !key) {
        return ["", "Missing Text or Key"];
    }

    try {
        const hash = CryptoJS.HmacSHA256(text, key).toString(CryptoJS.enc.Hex);
        return [hash, ""];
    } catch (err) {
        return ["", err.message];
    }
}

/**
 * Generate PBKDF2 Hash
 * @param {string} text - Text to hash
 * @param {string} salt - Salt
 * @param {number} length - Derived key length
 * @param {number} iterations - Iteration count
 * @returns {[string, string]} - [hashed value, error message]
 */
export function GeneratePBKDF2(text, salt, length, iterations ) {
    if (!text || !salt || !length || !iterations) {
        return ["", "Missing text or salt"];
    }

    try {
        const hash = CryptoJS.PBKDF2(text, salt, {
            keySize: length / 4, // CryptoJS menggunakan word array, jadi perlu dibagi 4
            iterations: iterations,
            hasher: CryptoJS.algo.SHA256,
        });

        return [hash.toString(CryptoJS.enc.Hex), ""];
    } catch (err) {
        return ["", err.message];
    }
}