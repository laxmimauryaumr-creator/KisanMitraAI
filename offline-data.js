/* =====================================
   KisanMitraAI - Offline Data Manager
   Saves previous AI, weather and mandi data
===================================== */

const DB_NAME = "KisanMitraOfflineDB";
const DB_VERSION = 1;
const STORE_NAME = "savedData";

let offlineDB = null;

function openOfflineDB() {
    return new Promise((resolve, reject) => {
        if (!("indexedDB" in window)) {
            reject(new Error("IndexedDB is not supported"));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, {
                    keyPath: "key"
                });
            }
        };

        request.onsuccess = () => {
            offlineDB = request.result;
            resolve(offlineDB);
        };

        request.onerror = () => reject(request.error);
    });
}

// Save data in browser permanently until cleared
async function saveOfflineData(key, title, content) {
    if (!content || !content.trim()) return;

    try {
        const db = offlineDB || await openOfflineDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(
                STORE_NAME, "readwrite"
            );

            transaction.objectStore(STORE_NAME).put({
                key,
                title,
                content: content.trim(),
                updatedAt: new Date().toISOString()
            });

            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error("Offline save failed:", error);
    }
}

// Read saved information
async function getOfflineData(key) {
    try {
        const db = offlineDB || await openOfflineDB();

        return new Promise((resolve, reject) => {
            const request = db.transaction(
                STORE_NAME, "readonly"
            ).objectStore(STORE_NAME).get(key);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Offline read failed:", error);
        return null;
    }
}

// Show saved information in a separate section
async function showSavedOfflineData() {
    const panel = document.getElementById("offlineSavedData");
    if (!panel) return;

    const keys = [
        ["ai", "🤖 Previously Saved AI Advice"],
        ["weather", "🌦️ Last Saved Weather"],
        ["mandi", "🌾 Last Saved Mandi Prices"]
    ];

    let html = "";

    for (const [key, title] of keys) {
        const item = await getOfflineData(key);

        if (item) {
            const safeContent = document.createElement("div");
            safeContent.textContent = item.content;

            const safeDate = new Date(item.updatedAt);
            const dateText = safeDate.toLocaleString();

            html += `
                <div class="offline-saved-card"
                     style="background:#f0fdf4;padding:15px;
                     margin:12px 0;border-radius:10px;
                     border:1px solid #bbf7d0;">
                    <h3>${title}</h3>
                    <div class="saved-content"></div>
                    <small>Last saved: ${dateText}</small>
                </div>
            `;

            // Content is inserted safely below
            panel.insertAdjacentHTML(
                "beforeend",
                html.substring(0, html.lastIndexOf("</div>") + 6)
            );

            const cards = panel.querySelectorAll(".offline-saved-card");
            cards[cards.length - 1]
                .querySelector(".saved-content")
                .textContent = item.content;

            html = "";
        }
    }

    if (!panel.children.length) {
        panel.textContent = "Abhi tak koi information save nahi hui hai. Internet ON karke website use karein.";
    }
}

// Automatically save changes from existing website
function observeOfflineOutput(elementId, key, title) {
    const element = document.getElementById(elementId);

    if (!element) return;

    let previousText = "";
    let saveTimer;

    const saveCurrentContent = () => {
        const text = element.innerText || element.textContent || "";
        const cleanText = text.trim();

        if (
            cleanText.length < 10 ||
            cleanText === previousText ||
            !navigator.onLine
        ) return;

        // Ignore common loading messages
        if (/taiyar kar raha hai|analyzing|loading|please wait/i.test(cleanText)) {
            return;
        }

        previousText = cleanText;

        clearTimeout(saveTimer);

        saveTimer = setTimeout(() => {
            saveOfflineData(key, title, cleanText);
        }, 1500);
    };

    const observer = new MutationObserver(saveCurrentContent);

    observer.observe(element, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Also check existing content
    saveCurrentContent();
}

// Start offline manager
async function initializeOfflineManager() {
    try {
        await openOfflineDB();

        // Save outputs from existing script.js
        observeOfflineOutput(
            "answer", "ai", "AI Advice"
        );

        observeOfflineOutput(
            "weatherResult", "weather", "Weather"
        );

        observeOfflineOutput(
            "mandiResults", "mandi", "Mandi Prices"
        );

        // Show previously saved information
        await showSavedOfflineData();

    } catch (error) {
        console.error("Offline manager error:", error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    initializeOfflineManager();
});