/* ==========================================
   KisanMitraAI - Complete Offline Data System
   AI History + Weather + Mandi + Crop Diagnosis
========================================== */

const KISAN_DB = "KisanMitraAI_Offline";
const KISAN_DB_VERSION = 1;
const KISAN_STORE = "records";

let kisanDB = null;

// 1. Open IndexedDB
function openKisanDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error("IndexedDB unavailable"));
            return;
        }

        if (kisanDB) {
            resolve(kisanDB);
            return;
        }

        const request = indexedDB.open(
            KISAN_DB,
            KISAN_DB_VERSION
        );

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(KISAN_STORE)) {
                const store = db.createObjectStore(
                    KISAN_STORE,
                    { keyPath: "id", autoIncrement: true }
                );

                store.createIndex("type", "type", {
                    unique: false
                });

                store.createIndex("savedAt", "savedAt", {
                    unique: false
                });
            }
        };

        request.onsuccess = () => {
            kisanDB = request.result;
            resolve(kisanDB);
        };

        request.onerror = () => reject(request.error);
    });
}

// 2. Save information
async function saveOfflineRecord(type, title, content) {
    if (!content || !content.trim()) return;

    try {
        const db = await openKisanDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                KISAN_STORE,
                "readwrite"
            );

            transaction.objectStore(KISAN_STORE).add({
                type,
                title,
                content: content.trim(),
                savedAt: new Date().toISOString()
            });

            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });

    } catch (error) {
        console.error("Offline save error:", error);
    }
}

// 3. Read all saved records
async function getAllOfflineRecords() {
    try {
        const db = await openKisanDB();

        return new Promise((resolve, reject) => {
            const request = db.transaction(
                KISAN_STORE,
                "readonly"
            ).objectStore(KISAN_STORE).getAll();

            request.onsuccess = () => {
                const records = request.result || [];

                records.sort((a, b) =>
                    new Date(b.savedAt) - new Date(a.savedAt)
                );

                resolve(records);
            };

            request.onerror = () => reject(request.error);
        });

    } catch (error) {
        console.error("Offline read error:", error);
        return [];
    }
}

// 4. Delete a saved record
async function deleteOfflineRecord(id) {
    try {
        const db = await openKisanDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                KISAN_STORE,
                "readwrite"
            );

            transaction.objectStore(KISAN_STORE).delete(id);

            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });

    } catch (error) {
        console.error("Delete error:", error);
    }
}

// 5. Display saved information
async function showSavedOfflineData() {
    const panel = document.getElementById("offlineSavedData");

    if (!panel) return;

    const records = await getAllOfflineRecords();

    panel.replaceChildren();

    const categories = [
        { type: "ai", name: "🤖 Saved AI Answers" },
        { type: "weather", name: "🌦️ Saved Weather" },
        { type: "mandi", name: "🌾 Saved Mandi Prices" },
        { type: "disease", name: "🍃 Saved Crop Diagnosis" }
    ];

    categories.forEach(category => {
        const heading = document.createElement("h3");
        heading.textContent = category.name;
        panel.appendChild(heading);

        const matching = records.filter(
            record => record.type === category.type
        );

        if (!matching.length) {
            const empty = document.createElement("p");
            empty.textContent = "Abhi koi data save nahi hai.";
            panel.appendChild(empty);
            return;
        }

        matching.forEach(record => {
            const card = document.createElement("div");

            card.style.cssText =
                "background:#f0fdf4;padding:14px;margin:10px 0;" +
                "border-radius:10px;border:1px solid #bbf7d0;";

            const title = document.createElement("h4");
            title.textContent = record.title;

            const content = document.createElement("p");
            content.textContent = record.content;
            content.style.whiteSpace = "pre-wrap";

            const date = document.createElement("small");
            date.textContent =
                "Last saved: " +
                new Date(record.savedAt).toLocaleString();

            const remove = document.createElement("button");
            remove.textContent = "Delete";
            remove.type = "button";

            remove.addEventListener("click", async () => {
                await deleteOfflineRecord(record.id);
                await showSavedOfflineData();
            });

            card.append(title, content, date, document.createElement("br"), remove);
            panel.appendChild(card);
        });
    });

    const refresh = document.createElement("button");
    refresh.textContent = "Refresh Saved Information";
    refresh.type = "button";
    refresh.onclick = showSavedOfflineData;

    panel.appendChild(refresh);
}

// 6. Initialize offline data
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await openKisanDB();
        await showSavedOfflineData();

        console.log("KisanMitraAI offline database ready.");

    } catch (error) {
        console.error("Offline database initialization failed:", error);
    }
});