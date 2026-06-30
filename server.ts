import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini configuration doesn't crash on boot if missing
let ai: GoogleGenAI | null = null;
function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1;
    if (!key) {
      throw new Error("GEMINI_API_KEY or GEMINI_API_KEY1 must be set.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for chat
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
        systemInstruction: campaignSystemInstruction,
        rpgSystem,
        apiKey
      } = req.body;

      const activeKey = apiKey || process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY1;
      if (!activeKey) {
        throw new Error("Brak klucza API Gemini. Wklej go w zakładce Ustawienia na stronie głównej!");
      }

      const genAi = new GoogleGenAI({ apiKey: activeKey });
      const model = "gemini-2.5-flash";

      let scenarioText = typeof scenario === "object" && scenario !== null
        ? `Tytuł: ${scenario.title}. Opis/Cel: ${scenario.description}`
        : scenario;

      if (typeof scenario === "object" && scenario !== null && scenario.documents && scenario.documents.length > 0) {
        scenarioText += "\n\n--- DOKUMENTY SCENARIUSZA ---\n";
        scenario.documents.forEach((doc: any) => {
          scenarioText += `\n[Dokument: ${doc.title}]\n${doc.content}\n`;
        });
      }

      const defaultTone = campaignId === "warszawa"
        ? "Atmospheric, dark cyberpunk, futuristic Warsaw high-tech low-life, neon, rain, corporations."
        : campaignId === "dungeon"
          ? "Classic old-school dungeon crawl, dark corridors, damp cellars, torchlight shadows, monsters, traps."
          : "Epic classic high-fantasy, magic, medieval atmosphere, sword and sorcery, legends.";

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

      const toneStyle = (gmSettings && gmSettings.tone) ? toneMap[gmSettings.tone as keyof typeof toneMap] : toneMap.cyberpunk;
      const lengthStyle = (gmSettings && gmSettings.length) ? lengthMap[gmSettings.length as keyof typeof lengthMap] : lengthMap.short;
      const customDirectives = (gmSettings && gmSettings.customDirectives) ? gmSettings.customDirectives : "";
      const difficulty = (gmSettings && gmSettings.difficultyLevel !== undefined) ? gmSettings.difficultyLevel : 5;

      let diceRollInstruction = "";
      if (diceRoll) {
        diceRollInstruction = `
--- OSTATNI RZUT KOŚCIĄ GRACZA ---
Wyrzucono: K${diceRoll.dice} z wynikiem bazowym ${diceRoll.result}.
Użyty modyfikator/cecha: ${diceRoll.statName} (+${diceRoll.modifier}).
Suma rzutu (Wynik końcowy): ${diceRoll.total}.
Weź pod uwagę ten wynik, określając stopień sukcesu lub porażki obecnej akcji gracza (im trudność/difficulty Level wyższa, tym większa suma jest potrzebna do sukcesu).
---------------------------`;
      }

      // Format character stats — D&D 3.5 shows modifier, others show raw value
      const statsString = Object.entries(character.stats || {})
        .map(([k, v]) => {
          const val = v as number;
          if (rpgSystem === 'dd35' || rpgSystem === 'dd5' || rpgSystem === 'dnd5e' || rpgSystem === 'dnd5') {
            const mod = Math.floor((val - 10) / 2);
            return `${k.toUpperCase()}: ${val} (${mod >= 0 ? '+' : ''}${mod})`;
          }
          return `${k.toUpperCase()}: ${val}`;
        })
        .join(", ");

      // Load system rules from local text files if available
      let systemRulesBlock = "";
      if (rpgSystem === "dd35") {
        try {
          const filePath = path.join(process.cwd(), "assets", "dokumenty", "DD", "zasady_dd35.txt");
          if (fs.existsSync(filePath)) {
            systemRulesBlock = `\n\n--- BEZWZGLĘDNE ZASADY I MECHANIKI SYSTEMU (D&D 3.5) ---\n${fs.readFileSync(filePath, "utf-8")}\n---------------------------------------------------------`;
          }
        } catch (e) {
          console.error("Error loading D&D 3.5 rules:", e);
        }
      } else if (rpgSystem === "dd5" || rpgSystem === "dnd5e" || rpgSystem === "dnd5") {
        try {
          const filePath = path.join(process.cwd(), "assets", "dokumenty", "DD", "zasady", "5e-SRD_v1.0.txt");
          if (fs.existsSync(filePath)) {
            systemRulesBlock = `\n\n--- BEZWZGLĘDNE ZASADY I MECHANIKI SYSTEMU (D&D 5e) ---\n${fs.readFileSync(filePath, "utf-8")}\n---------------------------------------------------------`;
          }
        } catch (e) {
          console.error("Error loading D&D 5e rules:", e);
        }
      } else if (rpgSystem === "cyberpunk") {
        try {
          const filePath = path.join(process.cwd(), "assets", "dokumenty", "cyberpunk", "CRED-zasady-pigulka.txt");
          if (fs.existsSync(filePath)) {
            systemRulesBlock = `\n\n--- BEZWZGLĘDNE ZASADY I MECHANIKI SYSTEMU (Cyberpunk RED) ---\n${fs.readFileSync(filePath, "utf-8")}\n--------------------------------------------------------------`;
          }
        } catch (e) {
          console.error("Error loading Cyberpunk RED rules:", e);
        }
      }

      // Use campaign-specific systemInstruction if provided, otherwise build generic one
      let systemInstruction = "";

      if (rpgSystem.startsWith("dd") || rpgSystem.startsWith("dnd")) {
        systemInstruction = `[Role:DM|System:D&D|Lang:PL]
Campaign:"${campaignTitle || 'Custom'}"|Scenario:"${scenarioText || 'Sandbox'}"
User:{Name:"${character.name}"|Class:"${character.class}"|Stats:"${statsString}"|Inv:"${character.inventory}"|Bio:"${character.bio}"}

[SYSTEM_RULES]
- Logic:D20+Mod vs DC(10/Easy|15/Med|20/Hard)|RAW
- Combat:TurnBased|Action/Bonus/React|Damage-Mod
- CombatFlow: ALWAYS strictly track Initiative. Execute and fully narrate the actions of ALL enemies whose initiative is higher than the player's BEFORE stopping and waiting for the player's input.
- RefLink(Inv/Stats/Class)→ProactivelySuggestActions
- NO_AutoPilot|No_GodModding|Only_Polish|Markdown_Format

[BEHAVIOR]
- Tone:${toneStyle}|Length:${lengthStyle}|Diff:${difficulty}/10
- Format_Out: Narr:[Descriptive]|Act:[DM_Action]|Sys:[HP|AC|Inv|Dice]
${customDirectives ? `Extra:${customDirectives}` : ""}
${diceRollInstruction}`;
      } else {
        systemInstruction = campaignSystemInstruction
          ? `${campaignSystemInstruction}

--- AKTUALNE DANE SESJI ---
Scenariusz: ${scenarioText || "Wolna eksploracja."}
Postać - Imię: ${character.name} | Klasa: ${character.class}
Atrybuty: ${statsString}
Ekwipunek: ${character.inventory}
Biogram: ${character.bio}

--- PARAMETRY MG ---
Ton Narracji: ${toneStyle}
Długość Odpowiedzi: ${lengthStyle}
Poziom Trudności: ${difficulty}/10
${customDirectives ? `Dyrektywy Dodatkowe: ${customDirectives}` : ""}
${diceRollInstruction}`
          : `You are an AI Game Master for a tabletop RPG campaign called "${campaignTitle || 'Custom Campaign'}".
Setting description:
${campaignDescription || 'Immersive roleplaying sandbox.'}

You are narrating the game, determining the outcomes of the player actions based on their character stats, and driving the plot forward.
Respond in Polish. Use markdown.

--- GM BEHAVIOR AND STYLE REGULATION ---
- Narrative Tone: ${toneStyle}
- Response Length Limit: ${lengthStyle}
- Difficulty Level (Scale 1-10 where 10 is lethal and 1 is arcade/easy): ${difficulty}/10.
- Extra Directives: ${customDirectives}
----------------------------------------
${diceRollInstruction}

Current Scenario Outline: ${scenarioText || "Wolna eksploracja."}
Character Name: ${character.name}
Class: ${character.class}
Stats: ${statsString}
Inventory: ${character.inventory}
Background: ${character.bio}`;

        if (systemRulesBlock) {
          systemInstruction += systemRulesBlock;
        }

        systemInstruction += `\n\n--- ZACHOWANIE MISTRZA GRY (EKWIPUNEK I KLASA) ---
Pamiętaj, że masz pełny wgląd w ekwipunek postaci (${character.inventory}). 
Na podstawie klasy/archetypu postaci (${character.class}) oraz posiadanych przez nią przedmiotów, w swoich opisach i odpowiedziach proaktywnie sugeruj graczowi możliwe do wykonania, odpowiednie dla jego postaci zagrania. Jeśli postać gracza natrafi na przeszkodę, podpowiedz (subtelnie lub wprost), jak może wykorzystać swój sprzęt lub atrybuty klasowe.`;
      }

      // Convert messages to Gemini format, filtering out system messages to avoid model contamination
      const formattedMessages = messages
        .filter((msg: any) => msg.role !== "system")
        .map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        }));

      const response = await genAi.models.generateContent({
        model,
        contents: formattedMessages,
        config: {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Static assets route for RPG rulebooks, supplements and maps
  app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
