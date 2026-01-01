import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { dataUrl } = req.body || {};
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
      return res.status(400).json({ error: "Invalid or missing 'dataUrl'" });
    }

    const hasApiKey = Boolean(process.env.OPENAI_API_KEY);
    let parsed;
    if (hasApiKey) {
      const prompt = `Anda adalah mesin pengenal produk retail untuk pasar Indonesia.
Kembalikan JSON dengan field: name, category, type, confidence (0..1), salesTrend (mis. "+15%"), insight.
Jangan keluarkan teks lain selain JSON valid.`;

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

    return res.status(200).json(result);
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
    return res.status(200).json(fallback);
  }
}
