
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function verify() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (!keyMatch) {
            console.error("No se encontró VITE_GEMINI_API_KEY en .env");
            return;
        }
        const API_KEY = keyMatch[1].trim();
        console.log("Usando API Key (primeros 5):", API_KEY.substring(0, 5) + "...");

        const genAI = new GoogleGenerativeAI(API_KEY);

        try {
            console.log("\nProbando modelo FINAL: gemini-2.0-flash...");
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent("Di 'VERIFICADO'.");
            const response = await result.response;
            console.log("Respuesta de Gemini:", response.text());
            console.log("¡SISTEMA LISTO PARA USO!");
        } catch (err) {
            console.error("Fallo final:", err.message || err);
        }
    } catch (error) {
        console.error("¡ERROR DE VERIFICACIÓN!");
        console.error(error);
    }
}

verify();
