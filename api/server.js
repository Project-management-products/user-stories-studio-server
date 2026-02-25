import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";


dotenv.config();
const app = express();

// 1. Configuración de CORS (Asegúrate de que no haya "/" al final)
const corsOptions = {
    origin: function (origin, callback) {
        // 1. Definimos el patrón que buscas:
        // ^https:\/\/  -> Empieza con https://
        // user-stories-studio-client- -> Tu proyecto
        // .* -> CUALQUIER COSA (el hash dinámico)
        // -jjce77s-projects\.vercel\.app -> Tu scope y dominio
        const allowedPattern = /^https:\/\/user-stories-studio-client-.*-jjce77s-projects\.vercel\.app$/;

        // 2. Permitimos si cumple el patrón O si es localhost (para tus pruebas locales)
        if (!origin || allowedPattern.test(origin) || origin.includes('localhost')) {
            callback(null, true);
        } else {
            console.log("Bloqueado por CORS:", origin); // Útil para ver en los logs de Vercel quién falló
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// 2. Inicialización de Google AI (Usa la variable de entorno de Vercel)
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const STD_MARKDOWN = ` # Estándar de Redacción de Historias de Usuario
    1. **Formato:** "Como [rol], quiero [acción] para [beneficio]".
    2. **Criterios de Aceptación:** Deben usar el formato BDD (Dado, Cuando, Entonces).
    3. **Tono:** Técnico, directo y sin ambigüedades.
    4. Consideraciones técnicas.
    `;
const FEW_SHOT_EXAMPLES = `
    Ejemplo 1:
    - Idea: Recuperar contraseña.
    - Resultado esperado: Como usuario no autenticado, quiero recuperar mi contraseña mediante mi correo para volver a acceder a mi cuenta.
    `;// Puedes quitar esta línea hasta que tengas ejemplos reales
const SYSTEM_INSTRUCTION = `
    Eres un Product Owner experto. Tu trabajo es transformar ideas en requerimientos técnicos. 
    Debes seguir ESTRICTAMENTE el siguiente estándar de la empresa:
    `;


app.post("/api/generate", async (req, res) => {

    var instruction = `${SYSTEM_INSTRUCTION} 
    ${STD_MARKDOWN}
    
    ${FEW_SHOT_EXAMPLES} 
    `;
    console.log("Body recibido:", req.body);

    if (false) {
        req.system = instruction;
        req.body.max_tokens = 1000;
        req.body.model = "claude-sonnet-4-20250514";
        req.body.messages[0].content = req.body.messages[0].content;
        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                },
                body: JSON.stringify(req.body),
            });
            const data = await response.json();
            console.log("Peticion: ", req.body);
            console.log("Respuesta de Claude:", data);
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: e.message });
            console.error("Error al generar el requerimiento:", error);
        }
    }
    else {
        try {
            console.log("Instruccion: ", instruction);
            console.log("Peticion: ", req.body.messages[0].content);
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash", // Usamos el modelo más rápido y eficiente
                contents: req.body.messages[0].content,
                config: {
                    // A. SYSTEM INSTRUCTIONS: Aquí le damos el rol y le inyectamos tu Markdown y (si tienes) tus ejemplos
                    systemInstruction: instruction,

                    // B. SAFETY SETTINGS: Evita que la IA bloquee respuestas por falsos positivos 
                    // (útil si tus historias hablan de "atacar" un sistema en contextos de ciberseguridad, o "matar" procesos)
                    safetySettings: [{
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                    }
                    ],

                    // Extra tip: Controlar la creatividad
                    temperature: 0.2, // Un valor bajo (0.0 a 0.3) hace que la IA sea más analítica y menos creativa/inventiva. Ideal para código y requerimientos.
                }
            });
            //fs.writeFileSync("generarRequerimientoOptimizado" + Date.now() + '.md', "Pregunta: " + ideaUsuario + "\n\n" + "Respuesta: " + response.text || "");
            console.log("--- Requerimiento Generado ---");
            console.log(response.text);
            res.json({
                content: [
                    { text: response.text }
                ]
            });

        } catch (error) {
            console.error("Error al generar el requerimiento: ", error);
        }
    }


});

// 4. Ruta de salud para verificar despliegue
app.get("/api/generate", (req, res) => {
    res.json({ message: "Servidor Express Online" });
});

export default app;