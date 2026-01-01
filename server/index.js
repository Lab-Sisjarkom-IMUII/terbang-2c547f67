import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const result = dotenv.config({ path: path.resolve(__dirname, "../.env") });
console.log("✅ Dotenv loaded. Parsed:", result.parsed ? Object.keys(result.parsed) : "none");
console.log("SUPABASE_URL env:", process.env.SUPABASE_URL ? "✓ Set" : "✗ Not set");
console.log("SUPABASE_SERVICE_KEY env:", process.env.SUPABASE_SERVICE_KEY ? "✓ Set" : "✗ Not set");

import express from "express";
import multer from "multer";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
const openai = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

let supabase = null;

async function start() {
  // Import supabase after env vars are loaded
  const { supabase: supabaseClient } = await import("./supabaseClient.js");
  supabase = supabaseClient;
  
  if (supabase) {
    console.log("✅ Testing Supabase connection...");
    try {
      const { data, error } = await supabase.from('monthly_reports').select('count', { count: 'exact', head: true });
      if (error) {
        console.error("❌ Supabase query error:", error.message);
      } else {
        console.log("✅ Supabase connection successful!");
      }
    } catch (err) {
      console.error("❌ Supabase test error:", err.message);
    }
  } else {
    console.warn("⚠️ Supabase is null!");
  }

  // POST /api/scan - Image recognition endpoint
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

  // GET /api/monthly-reports - Fetch monthly reports from Supabase
  app.get("/api/monthly-reports", async (req, res) => {
    console.log("[HANDLER] Route called");
    try {
      console.log("[HANDLER] Supabase is:", supabase ? "NOT NULL" : "NULL");
      if (!supabase) {
        return res.status(500).json({ error: 'Supabase is null' });
      }

      const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        console.error('[HANDLER] Query error:', error);
        return res.status(400).json({ error: 'Database query failed', detail: error.message });
      }

      console.log('[HANDLER] Success, returning', data?.length || 0, 'rows');
      return res.json(data || []);
    } catch (err) {
      console.error('[HANDLER] Catch error:', err);
      return res.status(500).json({ error: 'Server error', detail: err.message });
    }
  });

  // USERS API
  app.post("/api/users", async (req, res) => {
    try {
      if (!supabase) return res.status(200).json({ ok: false });
      const { email, name, avatar, password } = req.body || {};
      if (!email) return res.status(400).json({ error: "Missing fields" });
      const { error } = await supabase.from("users").upsert(
        { email, name: name || null, avatar: avatar || null, password: password || null },
        { onConflict: "email" },
      );
      if (error) throw error;
      res.json({ ok: true });
    } catch (e) {
      res.json({ ok: false });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      if (!supabase) return res.status(200).json({ ok: false, user: null });
      const { email } = req.query || {};
      if (!email) return res.status(400).json({ error: "Missing email" });
      const { data, error } = await supabase.from("users").select("*").eq("email", email).limit(1);
      if (error) throw error;
      res.json({ ok: true, user: data?.[0] || null });
    } catch (e) {
      res.json({ ok: false, user: null });
    }
  });

  // SCANS API
  app.post("/api/scans", async (req, res) => {
    try {
      if (!supabase) return res.status(200).json({ ok: false });
      const { email, productName, identifiedName, status, confidence, image } = req.body || {};
      if (!email || !identifiedName) return res.status(400).json({ error: "Missing fields" });
      const payload = {
        email,
        product_name: productName || null,
        identified_name: identifiedName,
        status: status || "unknown",
        confidence: typeof confidence === "number" ? confidence : null,
        image: image || null,
        created_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("scans").insert(payload);
      if (error) throw error;
      res.json({ ok: true });
    } catch (e) {
      res.json({ ok: false });
    }
  });

  app.get("/api/scans", async (req, res) => {
    try {
      if (!supabase) return res.status(200).json({ ok: false, items: [] });
      const { email } = req.query || {};
      if (!email) return res.status(400).json({ error: "Missing email" });
      const { data, error } = await supabase
        .from("scans")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      res.json({ ok: true, items: data || [] });
    } catch (e) {
      res.json({ ok: false, items: [] });
    }
  });

  // PRODUCTS API
  // GET /api/products
  app.get("/api/products", async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ error: 'Supabase is null' });
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/products
  app.post("/api/products", async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ error: 'Supabase is null' });
      const { name, category, stock, price, image, description, salesTrend } = req.body;
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, category, stock, price, image, description, salesTrend }])
        .select();
      if (error) throw error;
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/products
  app.put("/api/products", async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ error: 'Supabase is null' });
      const { id, name, category, stock, price, image, description, salesTrend } = req.body;
      const { data, error } = await supabase
        .from('products')
        .update({ name, category, stock, price, image, description, salesTrend })
        .eq('id', id)
        .select();
      if (error) throw error;
      res.json(data[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /api/products
  app.delete("/api/products", async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ error: 'Supabase is null' });
      const { id } = req.query;
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`✅ AI Scan server running on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
