import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";


dotenv.config();
const app = express();

// 1. Configuración de CORS (Asegúrate de que no haya "/" al final)
const localOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

const allowedOrigins = [
    'https://user-stories-studio-client.vercel.app',
    /^https:\/\/user-stories-studio-client-[\w]+-jjce77s-projects\.vercel\.app$/,
    ...localOrigins,
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(express.json());

// 2. Inicialización de Google AI (Usa la variable de entorno de Vercel)
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const STD_MARKDOWN = ` # Estándar de Redacción de Historias de Usuario
    **Historia de Usuario:**
    1. **Título:** Debe ser corto y descriptivo.
    2. **Descripción:** 
    "Como [rol], quiero [acción] para [beneficio]".
    3. **Criterios de Aceptación:** Deben usar el formato BDD (Dado, Cuando, Entonces).
    5. Consideraciones técnicas.
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
const SYSTEM_CONSTRAINTS = `
    Responde únicamente con el bloque de código/texto solicitado,  Elimina toda charla trivial, introducciones, conclusiones o confirmaciones de que entendiste la tarea. Si te pido un cambio en un texto, entrega solo el texto modificado
    1. Usar tono técnico, directo y sin ambigüedades.
    2. No debes generar código.
    3. No debes generar archivos.
    4. No debes generar imágenes.
    5. No debes generar audio.
    6. No debes generar video.
    7. Elimina toda charla trivial, introducciones, conclusiones o confirmaciones de que entendiste la tarea. 
    7. Si te pido un cambio en un texto, entrega solo el texto modificado
    `;

app.post("/api/generate", async (req, res) => {

    var instruction = `${SYSTEM_INSTRUCTION} 
    ${STD_MARKDOWN}
    
    ${FEW_SHOT_EXAMPLES} 

    ${SYSTEM_CONSTRAINTS}`;
    // console.log("Body recibido:", req.body);

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
            // console.log("Peticion: ", req.body);
            // console.log("Respuesta de Claude:", data);
            res.json(data);
        } catch (e) {
            res.status(500).json({ error: e.message });
            console.error("Error al generar el requerimiento:", error);
        }
    }
    else {
        try {
            // console.log("Instruccion: ", instruction);
            // console.log("Peticion: ", req.body.messages[0].content);
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

                    // Controlar la creatividad
                    temperature: 0.2, // Un valor bajo (0.0 a 0.3) hace que la IA sea más analítica y menos creativa/inventiva. Ideal para código y requerimientos.
                }
            });

            // console.log("--- Requerimiento Generado ---");
            // console.log(response.text);
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
app.get("/", (req, res) => res.send("Server OK"));
app.get("/api/generate", (req, res) => {
    res.json({ message: "Servidor Express Online - API path /api/generate" });
});
const port = process.env.PORT || 3000; // Intenta leer el puerto del entorno o usa 3000

if (process.env.NODE_ENV == 'dev') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Ejecución local en: http://localhost:${PORT}`);
    });
}

export default app;