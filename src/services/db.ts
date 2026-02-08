import { db } from "../firebase";
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    onSnapshot
} from "firebase/firestore";
import { ExperienceItem, ResearchPaper, Performance, BlogPost, Resource, GalleryItem, Language } from "../../types";

// Generic types
type CollectionName = 'experience' | 'research' | 'performances' | 'posts' | 'resources' | 'gallery';

// Helper to get collection reference
const getColRef = (colName: CollectionName) => collection(db, colName);

// -- GENERIC CRUD --

export const addItem = async (colName: CollectionName, item: any) => {
    return await addDoc(getColRef(colName), item);
};

export const updateItem = async (colName: CollectionName, id: string, data: any) => {
    const docRef = doc(db, colName, id);
    return await updateDoc(docRef, data);
};

export const deleteItem = async (colName: CollectionName, id: string) => {
    const docRef = doc(db, colName, id);
    return await deleteDoc(docRef);
};

// -- REAL-TIME LISTENERS --

/**
 * Subscribes to a collection and returns the data in real-time.
 * Data is expected to be stored with localization keys (es, en, ru) inside the document
 * or specific fields. For simplicity in this migration, we will assume
 * documents contain all languages or we filter client-side.
 * 
 * However, based on current types, items like 'ExperienceItem' are single-language objects.
 * STRATEGY: We will store the "superset" object in Firestore.
 * Each document will contain fields like:
 * {
 *   es: { role: "...", description: "..." },
 *   en: { role: "...", description: "..." },
 *   ru: { role: "...", description: "..." },
 *   year: "2023", // Common fields can be top-level if shared, or duplicated if they differ.
 *   ...
 * }
 * 
 * But to minimize refactoring impact on the UI components (which expect `ExperienceItem[]` for a specific lang),
 * this service will transform the data.
 */

// We'll define a format for our Firestore documents where localized fields are nested.
// For example, for Experience:
// {
//    common: { id: '...', year: '...' },    <-- ID and Year might be shared or not? Year seems text based so maybe localized.
//    es: { role: '...', institution: '...', description: '...', year: '...' },
//    en: { role: '...', institution: '...', description: '...', year: '...' },
//    ru: { role: '...', institution: '...', description: '...', year: '...' }
// }
//
// Actually, to make it easier to query and manage, let's just store the exact objects from translations.ts for each language 
// inside a parent document? Or just separate collections?
//
// OPTION A: One collection per entity. Each doc has `es`, `en`, `ru` objects inside.
// This is best for maintaining consistency across languages for the "same" item.
//
// Let's go with OPTION A.
// The listener will return the raw Firestore data, and a helper will extract the specific language.

export const subscribeToCollection = (colName: CollectionName, callback: (data: any[]) => void) => {
    const q = query(getColRef(colName));
    return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(data);
    });
};

// -- DATA TRANSFORMATION HELPERS --

export const transformDataForLang = (data: any[], lang: Language): any[] => {
    return data.map(item => {
        // If the item has the language key, return that + id.
        // If not, maybe it's a shared item (like an image gallery item might be shared except caption).

        if (item[lang]) {
            return {
                id: item.id, // Firestore ID
                ...item[lang],
                // Start with common fields if any exist and aren't overridden
                ...item.common
            };
        }
        // Fallback or returned as is if it doesn't follow the structure
        return { id: item.id, ...item };
    });
};
