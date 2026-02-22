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

// Maximum characters per chunk before splitting (roughly 2,000 tokens)
const CHUNK_CHAR_LIMIT = 8000;

/**
 * Splits HTML content into chunks at paragraph boundaries to avoid token limits.
 */
const splitIntoChunks = (html: string): string[] => {
    if (html.length <= CHUNK_CHAR_LIMIT) return [html];

    // Split after closing block tags (p, div, h1-h6, li, blockquote)
    const parts = html.split(/(?<=<\/(?:p|div|h[1-6]|li|blockquote|section)>)/i);
    const chunks: string[] = [];
    let current = '';

    for (const part of parts) {
        if (current.length + part.length > CHUNK_CHAR_LIMIT && current !== '') {
            chunks.push(current);
            current = part;
        } else {
            current += part;
        }
    }
    if (current) chunks.push(current);

    return chunks;
};

/**
 * Calls Gemini to translate a single piece of text (may contain HTML).
 */
const callGeminiSingle = async (text: string): Promise<{ en: string; ru: string }> => {
    const prompt = `
    Traduce el siguiente texto del español al inglés y al ruso.
    
    CRÍTICO - REGLAS PARA HTML:
    - Si el texto contiene etiquetas HTML, DEBES preservarlas EXACTAMENTE como están.
    - PRESERVA TODOS los atributos HTML (class, style, href, etc.) sin modificarlos.
    - SOLO traduce el CONTENIDO TEXTUAL dentro de las etiquetas.
    - Mantén la estructura HTML completamente intacta.
    
    IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido.
    Formato: {"en": "...", "ru": "..."}
    
    Contexto: Portafolio profesional de un Director de Orquesta. Tono formal.
    
    Texto:
    ${text}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Gemini single response");
    const parsed = JSON.parse(jsonMatch[0]);
    return { en: parsed.en || text, ru: parsed.ru || text };
};

/**
 * Translates a potentially long HTML text field using chunking if needed.
 */
const translateLongField = async (text: string): Promise<LocalizedString> => {
    const chunks = splitIntoChunks(text);

    if (chunks.length === 1) {
        const result = await callGeminiSingle(text);
        return { es: text, ...result };
    }

    console.log(`[TranslationService] Contenido largo (${text.length} chars) → ${chunks.length} fragmentos.`);
    const enParts: string[] = [];
    const ruParts: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
        console.log(`[TranslationService] Fragmento ${i + 1}/${chunks.length}...`);
        const result = await callGeminiSingle(chunks[i]);
        enParts.push(result.en);
        ruParts.push(result.ru);
        // Pause between chunks to respect rate limits
        if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 600));
    }

    return { es: text, en: enParts.join(''), ru: ruParts.join('') };
};

/**
 * Traduce múltiples campos de un objeto en una sola llamada a Gemini para ahorrar cuota (Rate Limit).
 * Los campos de contenido largo (> 8,000 chars) se traducen por fragmentos automáticamente.
 */
export const translateFields = async <T extends Record<string, any>>(
    data: T,
    fields: (keyof T)[]
): Promise<Record<string, LocalizedString>> => {
    const shortTexts: Record<string, string> = {};
    const longTexts: Record<string, string> = {};
    const results: Record<string, LocalizedString> = {};

    // 1. Classify fields: empty → fallback, long → chunk, short → batch
    fields.forEach(field => {
        const value = data[field];
        if (!value || typeof value !== 'string' || value.trim() === "") {
            results[field as string] = { es: String(value || ""), en: String(value || ""), ru: String(value || "") };
        } else if (value.length > CHUNK_CHAR_LIMIT) {
            longTexts[field as string] = value;
        } else {
            shortTexts[field as string] = value;
        }
    });

    // 2. Translate long fields with chunking (sequential)
    for (const key of Object.keys(longTexts)) {
        try {
            results[key] = await translateLongField(longTexts[key]);
        } catch (e) {
            console.error(`[TranslationService] Fallo en campo largo "${key}":`, e);
            results[key] = { es: longTexts[key], en: longTexts[key], ru: longTexts[key] };
        }
    }

    // 3. Translate short fields in a single batched Gemini call
    const pendingKeys = Object.keys(shortTexts);
    if (pendingKeys.length === 0) return results;

    const prompt = `
    Traduce los siguientes campos del español al inglés y ruso.
    
    CRÍTICO - REGLAS PARA HTML:
    - Si el texto contiene etiquetas HTML (como <p>, <strong>, <a>, <h1>, <span>, etc.), DEBES preservarlas EXACTAMENTE como están.
    - PRESERVA TODOS los atributos HTML (class, style, href, etc.) sin modificarlos.
    - PRESERVA TODOS los estilos inline (style="font-family: ...", style="color: ...", etc.) sin modificarlos.
    - SOLO traduce el CONTENIDO TEXTUAL dentro de las etiquetas, NO traduzcas ni modifiques las etiquetas HTML mismas.
    - Mantén la estructura HTML completamente intacta.
    
    IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido donde las llaves sean los identificadores proporcionados.
    
    Contexto: Portafolio profesional de un Director de Orquesta. Tono formal.
    
    Campos a traducir:
    ${JSON.stringify(shortTexts, null, 2)}
    
    Formato de respuesta esperado (JSON):
    {
      ${pendingKeys.map(k => `"${k}": {"en": "...", "ru": "..."}`).join(",\n      ")}
    }
    `;

    try {
        console.log(`[TranslationService] Traduciendo LOTE de ${pendingKeys.length} campos cortos...`);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No se pudo parsear el JSON de la respuesta por lotes");

        const batchTranslations = JSON.parse(jsonMatch[0]);
        pendingKeys.forEach(key => {
            const trans = batchTranslations[key] || {};
            results[key] = {
                es: shortTexts[key],
                en: trans.en || shortTexts[key],
                ru: trans.ru || shortTexts[key]
            };
        });
    } catch (error) {
        console.error("[TranslationService] Fallo en traducción por lotes:", error);
        pendingKeys.forEach(key => {
            if (!results[key]) {
                results[key] = { es: shortTexts[key], en: shortTexts[key], ru: shortTexts[key] };
            }
        });
    }

    return results;
};
/**
 * Genera un resumen inteligente y breve del contenido de un blog en tres idiomas.
 */
export const generateSmartSummary = async (htmlContent: string): Promise<LocalizedString> => {
    if (!htmlContent || htmlContent.trim() === "") return { es: "", en: "", ru: "" };

    const prompt = `
    Analiza el siguiente contenido HTML de un artículo de blog y genera un RESUMEN INTELIGENTE de 2 a 3 frases.
    
    REGLAS CRÍTICAS:
    1. El resumen debe ser profesional, cautivador y reflejar el tono del artículo.
    2. IGNORA ABSOLUTAMENTE cualquier artefacto de la interfaz de usuario, como "Eliminar Pie de foto", "Escribe aquí...", o placeholders del editor.
    3. Responde ÚNICAMENTE con un objeto JSON válido con el resumen en tres idiomas: español (es), inglés (en) y ruso (ru).
    4. No incluyas etiquetas HTML en el resumen generado.
    
    Formato de respuesta esperado (JSON):
    {
      "es": "resumen en español...",
      "en": "sumary in english...",
      "ru": "resumen en ruso..."
    }

    Contenido del artículo:
    ${htmlContent.substring(0, 5000)} // Limit to 5k chars to avoid token limits
    `;

    try {
        console.log("[TranslationService] Generando resumen inteligente con Gemini...");
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) throw new Error("No JSON found in summarization response");

        const summaryData = JSON.parse(jsonMatch[0]);
        console.log("[TranslationService] Resumen generado con éxito.");

        return {
            es: summaryData.es || "",
            en: summaryData.en || "",
            ru: summaryData.ru || ""
        };
    } catch (error) {
        console.error("[TranslationService] Error al generar resumen:", error);
        // Fallback: strip HTML and truncate
        const fallback = htmlContent.replace(/<[^>]*>/g, '').replace(/Eliminar Pie de foto\.\.\./g, '').replace(/\s+/g, ' ').trim().substring(0, 160) + '...';
        return { es: fallback, en: fallback, ru: fallback };
    }
};
