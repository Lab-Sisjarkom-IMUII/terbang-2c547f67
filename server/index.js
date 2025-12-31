import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

dotenv.config();

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

// Proxy endpoint to fetch monthly reports from Supabase REST API
app.get("/api/monthly-reports", async (req, res) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).json({ error: "Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_KEY)" });

    const apiUrl = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/monthly_reports?select=*&order=year.desc,month.desc`;
    const r = await fetch(apiUrl, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Supabase request failed', detail: text });
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Scan server running on http://localhost:${PORT}`);
});
