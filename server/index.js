import dotenv from "dotenv";
dotenv.config(); // Load .env at the very top before other imports

import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";
import { supabase } from "./supabaseClient.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.post("/api/scan", upload.single("image"), async (req, res) => {
  try {
    let dataUrl;
    const file = req.file;
    if (file) {
      const mime = file.mimetype || "image/png";
      const base64 = file.buffer.toString("base64");
      dataUrl = `data:${mime};base64,${base64}`;
    } else if (req.body && typeof req.body.dataUrl === "string") {
      dataUrl = req.body.dataUrl;
    } else {
      return res.status(400).json({ error: "Image is required (multipart 'image' or JSON 'dataUrl')" });
    }

    let parsed;
    if (hasApiKey && openai) {
      const prompt = `Anda adalah mesin pengenal produk retail untuk pasar Indonesia.
Kembalikan JSON dengan field: name, category, type, confidence (0..1), salesTrend (mis. "+15%"), insight.
Jangan keluarkan teks lain selain JSON valid.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: prompt },
          {
            role: "user",
            content: [
              { type: "text", text: "Identifikasi produk dari foto berikut dan berikan insight singkat." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });

      const content = completion.choices?.[0]?.message?.content || "{}";
      parsed = JSON.parse(content);
    } else {
      parsed = {
        name: "Produk Tidak Dikenal",
        category: "Tidak diketahui",
        type: "Tidak diketahui",
        confidence: 0.5,
        salesTrend: "+0%",
        insight: "Mode offline: set OPENAI_API_KEY untuk analisis AI.",
      };
    }

    const result = {
      name: parsed.name ?? "Produk Tidak Dikenal",
      category: parsed.category ?? "Tidak diketahui",
      type: parsed.type ?? "Tidak diketahui",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      stock: 20,
      status: "safe",
      salesTrend: parsed.salesTrend ?? "+0%",
      insight: parsed.insight ?? "Tidak ada insight.",
    };

    res.json(result);
  } catch (err) {
    console.error(err);
    const fallback = {
      name: "Produk Tidak Dikenal",
      category: "Tidak diketahui",
      type: "Tidak diketahui",
      confidence: 0.5,
      stock: 20,
      status: "safe",
      salesTrend: "+0%",
      insight: "Terjadi kesalahan analisis. Mode fallback digunakan.",
    };
    res.status(200).json(fallback);
  }
});

// Endpoint to fetch monthly reports using Supabase client (server-side)
app.get("/api/monthly-reports", async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured on server. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env' });

    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(502).json({ error: 'Supabase request failed', detail: error.message });
    }

    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Scan server running on http://localhost:${PORT}`);
});
