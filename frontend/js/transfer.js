// frontend/js/transfer.js

async function sendTransfer() {
  const to_display = document.getElementById('to_display').value.trim();
  const amount = parseInt(document.getElementById('amount').value, 10);
  if (!to_display || !amount) { alert('Fill fields'); return; }
  const user = supabase.auth.user();
  if (!user) return window.location = '/login.html';

  // find receiver by display_name
  const { data: receivers } = await supabase.from('profiles').select('*').eq('display_name', to_display).limit(1);
  if (!receivers || receivers.length === 0) { alert('Receiver not found'); return; }
  const receiver = receivers[0];

  const { data: meP } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if ((meP.vpoints || 0) < amount) { alert('Insufficient V-Points'); return; }

  // update balances (read-then-write)
  await supabase.from('profiles').update({ vpoints: (meP.vpoints - amount) }).eq('id', user.id);
  await supabase.from('profiles').update({ vpoints: (receiver.vpoints || 0) + amount }).eq('id', receiver.id);
  await supabase.from('transfers').insert([{ sender: user.id, receiver: receiver.id, amount }]);
  alert('Transfer complete');
  window.location = '/dashboard.html';
}
