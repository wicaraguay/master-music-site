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
type CollectionName = 'experience' | 'research' | 'performances' | 'posts' | 'resources' | 'gallery' | 'messages';

// Helper to get collection reference
const getColRef = (colName: CollectionName) => collection(db, colName);

// -- GENERIC CRUD --

export const addItem = async (colName: CollectionName, item: any) => {
    const dataWithTimestamp = {
        ...item,
        createdAt: item.createdAt || new Date().toISOString()
    };
    return await addDoc(getColRef(colName), dataWithTimestamp);
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

/**
 * Transforma los datos multilingües de la base de datos para mostrarlos en un idioma específico.
 * Extrae el valor correspondiente (es, en, ru) de cada campo que sea un objeto LocalizedString.
 */
export const transformDataForLang = (data: any[], lang: Language = 'es'): any[] => {
    if (!data) return [];
    return data.map(item => {
        if (!item) return item;
        const transformed: any = { id: item.id };

        // Recorrer todas las llaves del objeto
        Object.keys(item).forEach(key => {
            if (key === 'id') return;

            const value = item[key];

            // Si el valor es un objeto de localización { es, en, ru }
            if (value && typeof value === 'object' && 'es' in value && 'en' in value && 'ru' in value) {
                transformed[key] = value[lang] || value['es'] || "";
                // Si es un campo de fecha, preservar el valor 'es' para lógica de JS (new Date)
                if (key === 'date') {
                    transformed['date_raw'] = value['es'];
                }
            } else if (typeof value === 'string') {
                // Si es un string plano (posiblemente guardado antes de la migración o fallo de IA)
                transformed[key] = value;
            } else {
                transformed[key] = value;
            }
        });

        return transformed;
    });
};
