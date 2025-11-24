// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseServer');

function checkAdminSecret(req, res) {
  const secret = req.headers['x-admin-secret'];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    res.status(403).json({ error: 'forbidden' });
    return false;
  }
  return true;
}

// get exchange requests
router.get('/requests', async (req, res) => {
  if (!checkAdminSecret(req, res)) return;
  try {
    const { data } = await supabase.from('exchange_requests').select('*').order('created_at', { ascending: false });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// respond to a request: update status, append message, optionally deduct vpoints
router.post('/requests/:id/respond', async (req, res) => {
  if (!checkAdminSecret(req, res)) return;
  const { id } = req.params;
  const { status, message, adjust_vpoints } = req.body;
  try {
    // get current messages
    const r = await supabase.from('exchange_requests').select('messages, user_id, amount').eq('id', id).single();
    if (!r.data) return res.status(404).json({ error: 'not found' });
    const messages = r.data.messages || [];
    messages.push({ by: 'deskman', msg: message || '', at: new Date().toISOString() });
    await supabase.from('exchange_requests').update({ status, messages }).eq('id', id);

    if (status === 'approved' && adjust_vpoints) {
      const uid = r.data.user_id;
      const amt = r.data.amount || 0;
      const p = await supabase.from('profiles').select('vpoints').eq('id', uid).single();
      const current = (p.data?.vpoints) || 0;
      const newVal = Math.max(0, current - amt);
      await supabase.from('profiles').update({ vpoints: newVal }).eq('id', uid);
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
