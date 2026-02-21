import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



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
async function main() {
    let salir = false;
    let menu = 0;

    while (!salir) {
        console.log("\n\n");
        console.log("1. Listar modelos disponibles");
        console.log("2. Generar contenido");
        console.log("3. Generar requerimiento optimizado");
        console.log("0. Salir");
        console.log("\n");
        menu = parseInt(readlineSync.question("Seleccione una opcion: "));

        switch (menu) {
            case 1:
                await listAvailableModels();
                break;
            case 2:

                break;
            case 3:
                await generarRequerimientoOptimizado("Quiero que el sistema me deje exportar la tabla de usuarios a Excel");
                break;
            case 0:
                salir = true;
                break;
            default:
                console.log("Opcion no valida");
                break;
        }
    }
}


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});



async function generarRequerimientoOptimizado(ideaUsuario) {
    // 2. Tu estándar en Markdown (Esto reemplaza temporalmente la necesidad de ejemplos Few-Shot)


    // 3. (Opcional a futuro) Aquí es donde pondrías tu Few-Shot Prompting cuando tengas ejemplos
    const ejemplosFewShot = `
    Ejemplo 1:
    - Idea: Recuperar contraseña.
    - Resultado esperado: Como usuario no autenticado, quiero recuperar mi contraseña mediante mi correo para volver a acceder a mi cuenta.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Usamos el modelo más rápido y eficiente
            contents: ideaUsuario,
            config: {
                // A. SYSTEM INSTRUCTIONS: Aquí le damos el rol y le inyectamos tu Markdown y (si tienes) tus ejemplos
                systemInstruction: `Eres un Product Owner experto. Tu trabajo es transformar ideas en requerimientos técnicos. 
                Debes seguir ESTRICTAMENTE el siguiente estándar de la empresa:
                ${miEstandarMarkdown}
                
                ${ejemplosFewShot} // Puedes quitar esta línea hasta que tengas ejemplos reales
                `,

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
        fs.writeFileSync("generarRequerimientoOptimizado" + Date.now() + '.md', "Pregunta: " + ideaUsuario + "\n\n" + "Respuesta: " + response.text || "");
        console.log("--- Requerimiento Generado ---");
        console.log(response.text);

    } catch (error) {
        console.error("Error al generar el requerimiento:", error);
    }
}

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

app.get("/api/generate", async (req, res) => {

    res.json({
        message: "ok"
    });


});

app.listen(3001, () => console.log("Servidor corriendo en http://localhost:3001"));