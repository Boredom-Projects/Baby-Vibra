// backend/routes/transferRoutes.js
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

// Admin bulk transfer: receiverIds: [uuid], amount: integer
router.post('/admin-transfer', async (req, res) => {
  if (!checkAdminSecret(req, res)) return;
  const { receiverIds, amount } = req.body;
  if (!Array.isArray(receiverIds) || !amount) return res.status(400).json({ error: 'invalid' });

  try {
    // for each receiver, fetch then update vpoints
    for (const id of receiverIds) {
      const { data: prof } = await supabase.from('profiles').select('vpoints').eq('id', id).single();
      const current = (prof?.vpoints) || 0;
      await supabase.from('profiles').update({ vpoints: current + amount }).eq('id', id);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
