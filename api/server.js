import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

dotenv.config();
const app = express();

// 1. Configuración de CORS (Asegúrate de que no haya "/" al final)
const corsOptions = {
    origin: [
        'https://user-stories-studio-client-kecddi3aq-jjce77s-projects.vercel.app',
        'https://user-stories-studio-client-jy7zvc7w1-jjce77s-projects.vercel.app',
        'http://localhost:5173'
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 2. Inicialización de Google AI (Usa la variable de entorno de Vercel)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const STD_MARKDOWN = `# Estándar de Redacción de Historias de Usuario...`;
const SYSTEM_INSTRUCTION = `Eres un Product Owner experto...`;

// 3. Ruta POST para generación
app.post("/api/generate", async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !messages[0].content) {
            return res.status(400).json({ error: "Falta el contenido del mensaje" });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // Nota: Verifica si ya tienes acceso a 2.5, sino usa 1.5-flash
            systemInstruction: `${SYSTEM_INSTRUCTION}\n${STD_MARKDOWN}`
        });

        const result = await model.generateContent(messages[0].content);
        const responseText = result.response.text();

        res.json({
            content: [{ text: responseText }]
        });

    } catch (error) {
        console.error("Error en Gemini:", error);
        res.status(500).json({ error: "Error al generar contenido", details: error.message });
    }
});

// 4. Ruta de salud para verificar despliegue
app.get("/api/generate", (req, res) => {
    res.json({ message: "Servidor Express Online" });
});

export default app;