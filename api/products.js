import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  function extractDataUrlParts(dataUrl) {
    const match = typeof dataUrl === 'string' ? dataUrl.match(/^data:(.+?);base64,(.+)$/) : null;
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');
    return { mime, buffer };
  }

  async function ensureImageUrl(image) {
    if (!image) return null;
    if (typeof image === 'string' && image.startsWith('data:')) {
      const parts = extractDataUrlParts(image);
      if (!parts) return '';
      const ext = (parts.mime.split('/')[1] || 'png').toLowerCase();
      const path = `prod-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const upload = await supabase.storage.from('product-images').upload(path, parts.buffer, { contentType: parts.mime, upsert: true });
      if (upload.error) return '';
      const pub = supabase.storage.from('product-images').getPublicUrl(path);
      return pub.data.publicUrl || '';
    }
    if (typeof image === 'string' && image.length > 500) return '';
    return image;
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    const mapped = data.map(p => ({
      ...p,
      image: p.image_url,
      salesTrend: p.sales_trend
    }));
    return res.status(200).json(mapped);
  }

  if (req.method === 'POST') {
    const { name, category, stock, price, image, description, salesTrend } = req.body;
    const imageUrl = await ensureImageUrl(image);
    const descriptionSafe = typeof description === 'string' ? description.slice(0, 500) : description;
    const payload = {
      product_code: `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name, 
      category, 
      stock, 
      price, 
      image_url: imageUrl, 
      description: descriptionSafe, 
      sales_trend: salesTrend
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select();

    if (error) return res.status(500).json({ error: error.message });
    const result = {
      ...data[0],
      image: data[0].image_url,
      salesTrend: data[0].sales_trend
    };
    return res.status(200).json(result);
  }

  if (req.method === 'PUT') {
    const { id, name, category, stock, price, image, description, salesTrend } = req.body;
    const imageUrl = await ensureImageUrl(image);
    const descriptionSafe = typeof description === 'string' ? description.slice(0, 500) : description;
    const payload = {
      name, 
      category, 
      stock, 
      price, 
      image_url: imageUrl, 
      description: descriptionSafe, 
      sales_trend: salesTrend,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    const result = {
      ...data[0],
      image: data[0].image_url,
      salesTrend: data[0].sales_trend
    };

    return res.status(200).json(result);
  }

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
