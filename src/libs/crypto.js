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
export function GeneratePBKDF2(text, salt, length, iterations) {
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


export function XorDecode(input, key) {
    let decoded = '';

    if (!input || !key) {

        return ["", "Missing input or key"];;

    }
    try {
        for (let i = 0; i < input.length; i++) {
            decoded += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(0));
        }
        return [decoded, ""];
    } catch (err) {
        return ["", err.message];
    }
}


/**
 * Encrypt AES-256-CBC (to hex)
 * @param {string} plainText - Text to encrypt
 * @param {string} keyHex - 32-byte (64 char) hex key
 * @returns {[string, string, string]} - [cipherTextHex, ivHex, errorMessage]
 */
export function EncryptAES256(plainText, keyHex) {
    if (!plainText) return ["", "", "Missing plainText input"];
    if (!keyHex) return ["", "", "Missing keyHex input"];

    try {
        const key = CryptoJS.enc.Hex.parse(keyHex);
        const iv = CryptoJS.lib.WordArray.random(16); // 16-byte IV for AES-CBC

        // PKCS7 padding & AES encryption
        const encrypted = CryptoJS.AES.encrypt(plainText, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const cipherTextHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
        const ivHex = iv.toString(CryptoJS.enc.Hex);

        return [cipherTextHex, ivHex, ""];
    } catch (err) {
        return ["", "", err.message];
    }
}

/**
 * Decrypt AES-256-CBC (from hex)
 * @param {string} cipherTextHex - Encrypted data in hex
 * @param {string} ivHex - Initialization vector in hex
 * @param {string} keyHex - 32-byte (64 char) hex key
 * @returns {[string, string]} - [plainText, errorMessage]
 */
export function DecryptAES256(cipherTextHex, ivHex, keyHex) {
    if (!cipherTextHex) return ["", "Missing cipherTextHex input"];
    if (!ivHex) return ["", "Missing ivHex input"];
    if (!keyHex) return ["", "Missing keyHex input"];

    try {
        const key = CryptoJS.enc.Hex.parse(keyHex);
        const iv = CryptoJS.enc.Hex.parse(ivHex);
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(cipherTextHex),
        });

        const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });

        const plainText = decrypted.toString(CryptoJS.enc.Utf8);
        if (!plainText) return ["", "Decryption failed or returned empty string"];
        return [plainText, ""];
    } catch (err) {
        return ["", err.message];
    }
}
