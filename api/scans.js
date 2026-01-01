import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!serviceKey || !url) {
    return res.status(200).json({ ok: false, items: [] });
  }
  const client = createClient(url, serviceKey);
  if (req.method === "POST") {
    try {
      const { email, productName, identifiedName, status, confidence, image } = req.body || {};
      if (!email || !identifiedName) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const payload = {
        email,
        product_name: productName || null,
        identified_name: identifiedName,
        status: status || "unknown",
        confidence: typeof confidence === "number" ? confidence : null,
        image: image || null,
        created_at: new Date().toISOString(),
      };
      const { error } = await client.from("scans").insert(payload);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(200).json({ ok: false });
    }
  }
  if (req.method === "GET") {
    try {
      const { email } = req.query || {};
      if (!email) {
        return res.status(400).json({ error: "Missing email" });
      }
      const { data, error } = await client
        .from("scans")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return res.status(200).json({ ok: true, items: data || [] });
    } catch (e) {
      return res.status(200).json({ ok: false, items: [] });
    }
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
