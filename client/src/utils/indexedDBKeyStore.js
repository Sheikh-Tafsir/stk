import { openDB } from 'idb';

const DB_NAME = 'E2EE_DB';
const STORE_NAME = 'keys';
const PRIVATE_KEY_ID = 'privateKey';

// Open or create the database
async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        }
    });
}

// Save private key
export async function savePrivateKey(keyData) {
    const db = await getDB();
    await db.put(STORE_NAME, keyData, PRIVATE_KEY_ID);
}

// Retrieve private key
export async function getPrivateKey() {
    const db = await getDB();
    return await db.get(STORE_NAME, PRIVATE_KEY_ID);
}

// Delete private key
export async function deletePrivateKey() {
    const db = await getDB();
    await db.delete(STORE_NAME, PRIVATE_KEY_ID);
}