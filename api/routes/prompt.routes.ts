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
 *         description: Éxito
 *       400:
 *         description: Error de validación o parámetros inválidos
 *       500:
 *         description: Error interno del servidor o del proveedor de IA
 */
router.post("/:projectId/generate", (req, res, next) => promptController.generate(req, res, next));

export default router;
