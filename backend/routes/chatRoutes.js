// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseServer');

// send message from user to exchange
router.post('/send', async (req, res) => {
  const { exchange_id, sender_id, message } = req.body;
  if (!exchange_id || !sender_id || !message) return res.status(400).json({ error: 'invalid' });
  try {
    await supabase.from('chat_messages').insert([{ exchange_id, sender: sender_id, message }]);
    // append to exchange_requests.messages
    const r = await supabase.from('exchange_requests').select('messages').eq('id', exchange_id).single();
    const messages = (r.data?.messages) || [];
    messages.push({ by: sender_id, msg: message, at: new Date().toISOString() });
    await supabase.from('exchange_requests').update({ messages }).eq('id', exchange_id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
