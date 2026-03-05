import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "test" });
console.log("ai.models:", !!ai.models);
console.log("ai members:", Object.keys(ai));
console.log("ai proto members:", Object.getOwnPropertyNames(Object.getPrototypeOf(ai)));
