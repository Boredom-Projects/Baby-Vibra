// frontend/js/exchange.js

let currentExchangeId = null;

async function createExchange() {
  const amount = parseInt(document.getElementById('req_amount').value, 10);
  const method = document.getElementById('method').value;
  const user = supabase.auth.user();
  if (!user) return window.location = '/login.html';
  const { data } = await supabase.from('exchange_requests').insert([{ user_id: user.id, amount, method }]).select().single();
  alert('Request created. Desk Man will contact you.');
  window.location = '/exchange.html?exchange=' + data.id;
}

async function loadExchangeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ex = params.get('exchange');
  if (!ex) return;
  currentExchangeId = ex;
  await renderExchange(ex);
}

async function renderExchange(exchangeId) {
  const { data } = await supabase.from('exchange_requests').select('*').eq('id', exchangeId).single();
  if (!data) { document.getElementById('chatBox').innerText = 'Not found'; return; }
  const messages = data.messages || [];
  const box = document.getElementById('chatBox');
  box.innerHTML = '';
  messages.forEach(m => {
    const el = document.createElement('div');
    el.className = 'mb-2';
    el.innerHTML = `<div class="text-xs text-gray-400">${m.at || ''}</div><div class="bg-gray-700 p-2 rounded">${m.by || 'user'}: ${m.msg}</div>`;
    box.appendChild(el);
  });
}

async function sendChatMessage() {
  const txt = document.getElementById('chatMsg').value.trim();
  if (!txt || !currentExchangeId) return;
  const user = supabase.auth.user();
  if (!user) return window.location = '/login.html';
  // post to backend
  await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exchange_id: currentExchangeId, sender_id: user.id, message: txt })
  });
  document.getElementById('chatMsg').value = '';
  await renderExchange(currentExchangeId);
}
