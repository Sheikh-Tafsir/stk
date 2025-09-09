import { arrayBufferToBase64, base64ToArrayBuffer } from "./utils";

export const generateAsymmetricKeys = async () => {
    return await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048, // Can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: "SHA-256",
        },
        true, // Whether the key is extractable (i.e., can be used in exportKey)
        ["encrypt", "decrypt"] // Can be any combination of "encrypt" and "decrypt"
    );
}

export const getPublicKey = async (publicKey) => await window.crypto.subtle.exportKey("spki", publicKey);

export const getPrivateKey = async (privateKey) => await window.crypto.subtle.exportKey("pkcs8", privateKey);

export const generateSymmetricKey = async (salt, secreteKey) => {
    const enc = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(secreteKey),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

export const encryptWithSymmetricKey = async (salt, iv, plainData, secreteKey) => {
    const derivedKey = await generateSymmetricKey(salt, secreteKey);

    return await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        derivedKey,
        plainData
    );
}

export const handleE2EEGenerate = async (password) => {
    const keyPair = await generateAsymmetricKeys();
    const exportedPublicKeyBase64 = arrayBufferToBase64(await getPublicKey(keyPair.publicKey));
    const exportedPrivateKey = await getPrivateKey(keyPair.privateKey);

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encryptedPrivateKey = await encryptWithSymmetricKey(salt, iv, exportedPrivateKey, password);

    const encryptedPrivateKeyBase64 = arrayBufferToBase64(encryptedPrivateKey);
    const saltBase64 = arrayBufferToBase64(salt);
    const ivBase64 = arrayBufferToBase64(iv);

    return { exportedPublicKeyBase64, exportedPrivateKey, encryptedPrivateKeyBase64, saltBase64, ivBase64 }
};

export const decryptWithSymmetricKey = async (salt, iv, encryptedData, secretKey) => {
    const key = await generateSymmetricKey(salt, secretKey);
    return await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encryptedData
    );
}