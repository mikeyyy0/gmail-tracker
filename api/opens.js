import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  // Basic auth check via shared secret
  const authHeader = req.headers['authorization'];
  if (!authHeader || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing id' });
  }

  try {
    const { data, error } = await supabase
      .from('email_opens')
      .select('opened_at, ip_address, user_agent')
      .eq('tracking_id', id)
      .order('opened_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      tracking_id: id,
      open_count: data.length,
      opens: data,
    });
  } catch (err) {
    console.error('Query error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

