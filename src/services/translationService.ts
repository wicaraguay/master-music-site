import { GoogleGenerativeAI } from "@google/generative-ai";
import { LocalizedString } from "../../types";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

/**
 * Traduce un texto del español al inglés y ruso usando Gemini.
 */
export const translateText = async (text: string): Promise<LocalizedString> => {
    if (!text || text.trim() === "") return { es: text, en: text, ru: text };

    const prompt = `
    Traduce el siguiente texto del español al inglés y al ruso.
    IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. No incluyas explicaciones ni bloques de código.
    Formato esperado: {"en": "translation in english", "ru": "translation in russian"}
    
    Contexto: Portafolio profesional de un Director de Orquesta y Musicólogo. Tono formal.
    
    Texto:
    ${text}
    `;

    try {
        console.log(`[TranslationService] Iniciando traducción. Key presente: ${!!API_KEY}`);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Limpiar la respuesta de posibles bloques de código markdown
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error("[TranslationService] JSON no encontrado en respuesta:", responseText);
            return { es: text, en: `[ERROR_JSON] ${text}`, ru: `[ERROR_JSON] ${text}` };
        }

        const translations = JSON.parse(jsonMatch[0]);
        console.log("[TranslationService] Éxito:", translations);

        return {
            es: text,
            en: translations.en || `[EMPTY_EN] ${text}`,
            ru: translations.ru || `[EMPTY_RU] ${text}`
        };
    } catch (error: any) {
        console.error("[TranslationService] Fallo crítico:", error);
        return { es: text, en: text, ru: text };
    }
};

/**
 * Traduce múltiples campos de un objeto en una sola llamada a Gemini para ahorrar cuota (Rate Limit).
 */
export const translateFields = async <T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[]
): Promise<Record<string, LocalizedString>> => {
    const textsToTranslate: Record<string, string> = {};
    const results: Record<string, LocalizedString> = {};

    // 1. Filtrar campos vacíos y preparar datos
    fields.forEach(field => {
        const value = data[field];
        if (value && typeof value === 'string' && value.trim() !== "") {
            textsToTranslate[field as string] = value;
        } else {
            // Si está vacío, devolvemos el valor original en todos los idiomas
            results[field as string] = { es: String(value || ""), en: String(value || ""), ru: String(value || "") };
        }
    });

    const pendingKeys = Object.keys(textsToTranslate);
    if (pendingKeys.length === 0) return results;

    // 2. Construir prompt único para todos los campos
    const prompt = `
    Traduce los siguientes campos del español al inglés y ruso.
    IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido donde las llaves sean los identificadores proporcionados.
    
    Contexto: Portafolio profesional de un Director de Orquesta. Tono formal.
    
    Campos a traducir:
    ${JSON.stringify(textsToTranslate, null, 2)}
    
    Formato de respuesta esperado (JSON):
    {
      ${pendingKeys.map(k => `"${k}": {"en": "...", "ru": "..."}`).join(",\n      ")}
    }
    `;

    try {
        console.log(`[TranslationService] Traduciendo LOTE de ${pendingKeys.length} campos...`);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error("No se pudo parsear el JSON de la respuesta por lotes");
        }

        const batchTranslations = JSON.parse(jsonMatch[0]);

        pendingKeys.forEach(key => {
            const trans = batchTranslations[key] || {};
            results[key] = {
                es: textsToTranslate[key],
                en: trans.en || textsToTranslate[key],
                ru: trans.ru || textsToTranslate[key]
            };
        });

        return results;
    } catch (error) {
        console.error("[TranslationService] Fallo en traducción por lotes:", error);
        // Fallback: devolver el texto original para lo que falta
        pendingKeys.forEach(key => {
            if (!results[key]) {
                results[key] = { es: textsToTranslate[key], en: textsToTranslate[key], ru: textsToTranslate[key] };
            }
        });
        return results;
    }
};
