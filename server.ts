import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API route for chat
  app.post("/api/chat", async (req, res) => {
    const { messages, scenario, character, complexQuery } = req.body;

    const modelName = complexQuery ? "models/gemini-3.1-pro-preview" : "models/gemini-3.5-flash";
    const config = {
      systemInstruction: `You are playing the role of ${character.name}, described as: ${character.description}. The setting is: ${scenario.content}. Maintain this persona during the chat.`,
      ...(complexQuery && {
        thinkingConfig: {
          includeThoughts: true,
          thinkingLevel: ThinkingLevel.HIGH,
        },
      }),
    };

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: messages.map((m: any) => ({ role: m.role, parts: [{ text: m.content }] })),
        config: config,
      });

      res.json({ reply: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
