import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function verify() {
    try {
        const API_KEY = process.env.VITE_GEMINI_API_KEY;
        if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY no encontrada");

        console.log("Probando modelo: gemini-flash-latest...");
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const result = await model.generateContent("Di 'LISTO PARA TRADUCIR'.");
        const response = await result.response;
        console.log("Respuesta:", response.text());
        console.log("¡ÉXITO TOTAL!");
    } catch (err) {
        console.error("Fallo:", err.message || err);
    }
}

verify();
