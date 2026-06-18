var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages,
        character,
        scenario,
        diceRoll,
        gmSettings,
        campaignId,
        campaignTitle,
        campaignDescription,
        apiKey
      } = req.body;
      const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1;
      if (!activeKey) {
        throw new Error("Brak klucza API Gemini. Wklej go w zak\u0142adce Ustawienia na stronie g\u0142\xF3wnej!");
      }
      const genAi = new import_genai.GoogleGenAI({ apiKey: activeKey });
      const model = "gemini-2.5-flash";
      const scenarioText = typeof scenario === "object" && scenario !== null ? `Tytu\u0142: ${scenario.title}. Opis/Cel: ${scenario.description}` : scenario;
      const defaultTone = campaignId === "warszawa" ? "Atmospheric, dark cyberpunk, futuristic Warsaw high-tech low-life, neon, rain, corporations." : campaignId === "dungeon" ? "Classic old-school dungeon crawl, dark corridors, damp cellars, torchlight shadows, monsters, traps." : "Epic classic high-fantasy, magic, medieval atmosphere, sword and sorcery, legends.";
      const toneMap = {
        cyberpunk: defaultTone,
        noir: "Noir detective story style. Cynical, slow-paced drama, dark shadows, heavy cigarettes, rain, and jazz.",
        brutal: "Extremely brutal, raw, and high-lethality. Desperate survival where actions have direct severe consequences.",
        slapstick: "Absurd, humorous, full of weird local specifics, bad luck, heavy sarcasm, and funny failures.",
        action: "Action-packed, high stakes, blockbuster-movie style. Epic action moves, direct combats, explosions."
      };
      const lengthMap = {
        short: "Keep your responses EXTREMELY short, punchy & concise. Maximum 1-2 ultra-brief, dynamic sentences per action. Focus on high impact narrative delivery.",
        medium: "Keep your responses balanced and atmosphere-rich. Limit yourself to a maximum of 3-4 concise, descriptive sentences.",
        long: "Provide fully detailed, atmospheric descriptions of the environment, smells, sounds, and NPC voices (around 5-6 sentences)."
      };
      const toneStyle = gmSettings && gmSettings.tone ? toneMap[gmSettings.tone] : toneMap.cyberpunk;
      const lengthStyle = gmSettings && gmSettings.length ? lengthMap[gmSettings.length] : lengthMap.short;
      const customDirectives = gmSettings && gmSettings.customDirectives ? gmSettings.customDirectives : "";
      const difficulty = gmSettings && gmSettings.difficultyLevel !== void 0 ? gmSettings.difficultyLevel : 5;
      let diceRollInstruction = "";
      if (diceRoll) {
        diceRollInstruction = `
--- OSTATNI RZUT KO\u015ACI\u0104 GRACZA ---
Wyrzucono: K${diceRoll.dice} z wynikiem bazowym ${diceRoll.result}.
U\u017Cyty modyfikator/cecha: ${diceRoll.statName} (+${diceRoll.modifier}).
Suma rzutu (Wynik ko\u0144cowy): ${diceRoll.total}.
We\u017A pod uwag\u0119 ten wynik, okre\u015Blaj\u0105c stopie\u0144 sukcesu lub pora\u017Cki obecnej akcji gracza (im trudno\u015B\u0107/difficulty Level wy\u017Csza, tym wi\u0119ksza suma jest potrzebna do sukcesu).
---------------------------`;
      }
      const statsString = Object.entries(character.stats || {}).map(([k, v]) => `${k.toUpperCase()}(${v}/10)`).join(", ");
      const systemInstruction = `You are an AI Game Master for a tabletop RPG campaign called "${campaignTitle || "Custom Campaign"}".
Setting description:
${campaignDescription || "Immersive roleplaying sandbox."}

You are narrating the game, determining the outcomes of the player actions based on their character stats, and driving the plot forward.
Respond in Polish. Use markdown for formatting.

--- GM BEHAVIOR AND STYLE REGULATION ---
- Narrative Tone: ${toneStyle}
- Response Length Limit: ${lengthStyle}
- Difficulty Level (Scale 1-10 where 10 is lethal and 1 is arcade/easy): ${difficulty}/10. High levels increase risk of failure and severe penalties.
- Extra Directives: ${customDirectives}
----------------------------------------
${diceRollInstruction}

Current Scenario Outline: ${scenarioText || "Wolna eksploracja."}
Character Name: ${character.name}
Class: ${character.class}
Stats: ${statsString}
Inventory: ${character.inventory}
Background: ${character.bio}`;
      const formattedMessages = messages.filter((msg) => msg.role !== "system").map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));
      const response = await genAi.models.generateContent({
        model,
        contents: formattedMessages,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          temperature: 0.7
        }
      });
      res.json({ text: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });
  app.use("/assets", import_express.default.static(import_path.default.join(process.cwd(), "assets")));
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
