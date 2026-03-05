import express from "express";
import { PromptController } from "../controllers/prompt.controller.js";

const router = express.Router();
const promptController = new PromptController();

/**
 * @openapi
 * /api/generate-story:
 *   post:
 *     summary: Generar contenido de IA (User Stories, informes, etc.)
 *     description: Punto unificado para procesar prompts con diferentes proveedores de IA.
 *     tags: [AI Gateway]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, email, prompt]
 *             properties:
 *               projectId:
 *                 type: string
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
 *         description: Éxito
 *       400:
 *         description: Error de validación o parámetros inválidos
 *       500:
 *         description: Error interno del servidor o del proveedor de IA
 */
router.post("/generate-story", (req, res, next) => promptController.generate(req, res, next));

export default router;
