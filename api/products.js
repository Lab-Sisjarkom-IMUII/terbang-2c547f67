import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // GET: Fetch all products
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // POST: Add new product
  if (req.method === 'POST') {
    const { name, category, stock, price, image, description, salesTrend } = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert([{ name, category, stock, price, image, description, salesTrend }])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  // PUT: Update product
  if (req.method === 'PUT') {
    const { id, name, category, stock, price, image, description, salesTrend } = req.body;
    const { data, error } = await supabase
      .from('products')
      .update({ name, category, stock, price, image, description, salesTrend })
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
  }

  // DELETE: Delete product
  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Product deleted' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
