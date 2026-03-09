import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import pino from "pino";

const logger = pino();

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error({
        message: err.message,
        stack: process.env.NODE_ENV === "dev" ? err.stack : undefined,
        url: req.url,
        method: req.method
    });

    if (err instanceof ZodError) {
        return res.status(400).json({
            error: "Validation Error",
            details: err.errors
        });
    }

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        status: "error",
        message: message
    });
};
