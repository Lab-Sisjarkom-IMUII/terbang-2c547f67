import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!serviceKey || !url) {
    return res.status(200).json({ ok: false });
  }
  const client = createClient(url, serviceKey);
  if (req.method === "POST") {
    try {
      const { email, name, avatar, password } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const { error } = await client.from("users").upsert(
        { email, name: name || null, avatar: avatar || null, password: password || null },
        { onConflict: "email" },
      );
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
      const { data, error } = await client.from("users").select("*").eq("email", email).limit(1);
      if (error) throw error;
      return res.status(200).json({ ok: true, user: data?.[0] || null });
    } catch (e) {
      return res.status(200).json({ ok: false, user: null });
    }
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
