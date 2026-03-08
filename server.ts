import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const db = new Database("rayeva.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT,
    prompt TEXT,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    category TEXT,
    sub_category TEXT,
    tags TEXT,
    sustainability_filters TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT,
    budget REAL,
    product_mix TEXT,
    cost_breakdown TEXT,
    impact_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Helper for AI Logging
function logAI(module: string, prompt: string, response: string) {
  const stmt = db.prepare("INSERT INTO ai_logs (module, prompt, response) VALUES (?, ?, ?)");
  stmt.run(module, prompt, response);
}

// Module 1: AI Auto-Category & Tag Generator
app.post("/api/ai/categorize", async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "Name and description required" });
  }

  const prompt = `
    Analyze the following product for a sustainable commerce platform:
    Product Name: ${name}
    Product Description: ${description}

    Provide a structured JSON response with:
    1. primary_category: One from [Home & Kitchen, Personal Care, Fashion, Lifestyle, Packaging]
    2. sub_category: A specific sub-category
    3. seo_tags: Array of 5-10 SEO tags
    4. sustainability_filters: Array of filters like [plastic-free, compostable, vegan, recycled, organic, biodegradable]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primary_category: { type: Type.STRING },
            sub_category: { type: Type.STRING },
            seo_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            sustainability_filters: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["primary_category", "sub_category", "seo_tags", "sustainability_filters"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    logAI("Categorization", prompt, response.text || "");

    // Store in DB
    const stmt = db.prepare(`
      INSERT INTO products (name, description, category, sub_category, tags, sustainability_filters)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(name, description, result.primary_category, result.sub_category, JSON.stringify(result.seo_tags), JSON.stringify(result.sustainability_filters));

    res.json(result);
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to categorize product" });
  }
});

// Module 2: AI B2B Proposal Generator
app.post("/api/ai/proposal", async (req, res) => {
  const { client_name, budget, requirements } = req.body;
  if (!client_name || !budget) {
    return res.status(400).json({ error: "Client name and budget required" });
  }

  const prompt = `
    Generate a B2B sustainable product proposal for:
    Client: ${client_name}
    Budget: $${budget}
    Requirements: ${requirements || "General sustainable office/lifestyle products"}

    Provide a structured JSON response with:
    1. product_mix: Array of objects with { product_name, quantity, unit_price }
    2. budget_allocation: Object showing percentage split between categories
    3. cost_breakdown: Summary of total costs
    4. impact_summary: A concise statement on the environmental impact of this proposal
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product_mix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  product_name: { type: Type.STRING },
                  quantity: { type: Type.INTEGER },
                  unit_price: { type: Type.NUMBER }
                }
              }
            },
            budget_allocation: { type: Type.OBJECT },
            cost_breakdown: { type: Type.STRING },
            impact_summary: { type: Type.STRING }
          },
          required: ["product_mix", "budget_allocation", "cost_breakdown", "impact_summary"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    logAI("Proposal", prompt, response.text || "");

    // Store in DB
    const stmt = db.prepare(`
      INSERT INTO proposals (client_name, budget, product_mix, cost_breakdown, impact_summary)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(client_name, budget, JSON.stringify(result.product_mix), result.cost_breakdown, result.impact_summary);

    res.json(result);
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to generate proposal" });
  }
});

// Get Logs
app.get("/api/logs", (req, res) => {
  const logs = db.prepare("SELECT * FROM ai_logs ORDER BY timestamp DESC LIMIT 50").all();
  res.json(logs);
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
