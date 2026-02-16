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
    
    
    CRÍTICO - REGLAS PARA HTML:
    - Si el texto contiene etiquetas HTML (como <p>, <strong>, <a>, <h1>, <span>, etc.), DEBES preservarlas EXACTAMENTE como están.
    - PRESERVA TODOS los atributos HTML (class, style, href, etc.) sin modificarlos.
    - PRESERVA TODOS los estilos inline (style="font-family: ...", style="color: ...", etc.) sin modificarlos.
    - SOLO traduce el CONTENIDO TEXTUAL dentro de las etiquetas, NO traduzcas ni modifiques las etiquetas HTML mismas.
    - Mantén la estructura HTML completamente intacta.
    - Ejemplos: 
      * "<p>Hola <strong>mundo</strong></p>" → {"en": "<p>Hello <strong>world</strong></p>", "ru": "<p>Привет <strong>мир</strong></p>"}
      * "<span style='font-family: Georgia'>Texto</span>" → {"en": "<span style='font-family: Georgia'>Text</span>", "ru": "<span style='font-family: Georgia'>Текст</span>"}
    
    
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
