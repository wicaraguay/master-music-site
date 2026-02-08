import { db } from "../firebase";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import {
    getInitialExperience,
    getInitialPerformances,
    getInitialPosts,
    getInitialResearch,
    getInitialResources,
    getInitialGallery
} from "../../translations";

// This function will perform a one-time migration of data to Firestore
export const seedDatabase = async () => {
    console.log("Starting seeding process...");

    try {
        const batch = writeBatch(db);

        // 1. Prepare Data
        // We need to merge the 3 languages into single documents for each item to link them.
        // We assume the IDs in translations.ts match across languages (which they seem to: '1', '2', etc.)

        const languages = ['es', 'en', 'ru'] as const;

        // Helper to merge
        const mergeData = (getDataFn: (l: any) => any[]) => {
            const merged: Record<string, any> = {};

            languages.forEach(lang => {
                const items = getDataFn(lang);
                items.forEach(item => {
                    if (!merged[item.id]) {
                        merged[item.id] = {};
                    }
                    merged[item.id][lang] = item;
                });
            });
            return Object.values(merged);
        };

        const collectionsData = {
            experience: mergeData(getInitialExperience),
            research: mergeData(getInitialResearch),
            performances: mergeData(getInitialPerformances),
            posts: mergeData(getInitialPosts),
            resources: mergeData(getInitialResources),
            gallery: mergeData(getInitialGallery),
        };

        // 2. Clear existing collections (Optional: for safety we usually don't, but for 'seed' we might check if empty)
        // For now, we will just add/overwrite based on ID if we can, or just add new docs.
        // Since we want to use Firestore generated IDs or keep the string IDs? 
        // Let's use the 'id' from the file as the Document ID for simplicity and idempotency.

        for (const [colName, items] of Object.entries(collectionsData)) {
            console.log(`Seeding ${colName}...`);
            const colRef = collection(db, colName);

            for (const item of items) {
                // Item is { es: {...}, en: {...}, ru: {...} }
                // Use the ID from one of the languages as the Doc ID
                const docId = item.es?.id || item.en?.id || item.ru?.id;

                if (docId) {
                    const docRef = doc(colRef, docId);
                    batch.set(docRef, item);
                }
            }
        }

        // 3. Commit
        await batch.commit();
        console.log("Seeding complete!");
        alert("Base de datos poblada exitosamente con los datos iniciales.");

    } catch (error) {
        console.error("Error seeing database:", error);
        alert("Error al poblar la base de datos. Revisa la consola.");
    }
};
