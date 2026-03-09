import express from "express";
import { PromptController } from "../controllers/prompt.controller.js";

const router = express.Router();
const promptController = new PromptController();

/**
 * @openapi
 * /api/{projectId}/generate:
 *   post:
 *     summary: Generar contenido de IA por proyecto
 *     description: Procesar prompts vinculados a un proyecto específico.
 *     tags: [AI Gateway]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto (e.g., user-stories-studio, vtt-reports-analysis)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, prompt]
 *             properties:
 *               email:
 *                 type: string
 *               prompt:
 *                 type: string
 *               context:
 *                 type: string
 *               modelId:
 *                 type: string
 *               provider:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contenido generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required: [story_text, metadata, content]
 *               properties:
 *                 story_text:
 *                   type: string
 *                   description: Texto principal generado por la IA.
 *                 metadata:
 *                   type: object
 *                   required: [provider, model, latency_ms]
 *                   properties:
 *                     provider:
 *                       type: string
 *                       example: google
 *                     model:
 *                       type: string
 *                       example: gemini-2.5-pro
 *                     latency_ms:
 *                       type: number
 *                       example: 1243
 *                 content:
 *                   type: array
 *                   description: Compatibilidad legacy para clientes existentes.
 *                   items:
 *                     type: object
 *                     required: [text]
 *                     properties:
 *                       text:
 *                         type: string
 *             example:
 *               story_text: "Como usuario quiero iniciar sesión para acceder a mi panel."
 *               metadata:
 *                 provider: "google"
 *                 model: "gemini-2.5-pro"
 *                 latency_ms: 1243
 *               content:
 *                 - text: "Como usuario quiero iniciar sesión para acceder a mi panel."
 *       400:
 *         description: Error de validación o parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *             example:
 *               error: "Validation Error"
 *               details:
 *                 - message: "Invalid email"
 *       500:
 *         description: Error interno del servidor o del proveedor de IA
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *             example:
 *               status: "error"
 *               message: "Internal Server Error"
 */
router.post("/:projectId/generate", (req, res, next) => {
    console.log(`DEBUG - Route reached: /api/${req.params.projectId}/generate`);
    return promptController.generate(req, res, next);
});

export default router;
