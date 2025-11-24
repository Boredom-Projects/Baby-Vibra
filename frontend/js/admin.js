// frontend/js/admin.js
// Admin uses the server endpoints with header x-admin-secret set in backend's env

const ADMIN_SECRET = '<REPLACE_WITH_ADMIN_SECRET_ON_BACKEND>'; // only used client-side for manual admin pages; better to use server session in future

async function loadAdminPanel() {
  // load pending exchange requests from server
  const res = await fetch('/api/admin/requests', { headers: { 'x-admin-secret': ADMIN_SECRET }});
  const reqs = await res.json();
  const container = document.getElementById('requestsList');
  container.innerHTML = '';
  reqs.forEach(r => {
    const el = document.createElement('div');
    el.className = 'p-2 bg-gray-700 rounded';
    el.innerHTML = `<div><strong>${r.id}</strong> — ${r.amount} V</div>
      <div class="text-xs text-gray-400">${r.method} — ${r.status}</div>
      <div class="mt-2 flex gap-2">
        <button onclick="respondRequest('${r.id}','approved')" class="px-2 py-1 bg-green-500 rounded text-sm">Approve</button>
        <button onclick="respondRequest('${r.id}','rejected')" class="px-2 py-1 bg-red-500 rounded text-sm">Reject</button>
      </div>`;
    container.appendChild(el);
  });
}

async function respondRequest(id, status) {
  const message = prompt('Message to user (optional):', status === 'approved' ? 'Approved. Please provide your withdrawal details.' : 'Rejected. Contact support.');
  const body = { status, message, adjust_vpoints: status === 'approved' };
  await fetch(`/api/admin/requests/${id}/respond`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-admin-secret': ADMIN_SECRET },
    body: JSON.stringify(body)
  });
  alert('Done');
  await loadAdminPanel();
}

async function doBulkSend() {
  const users = document.getElementById('bulk_users').value.split(',').map(s => s.trim()).filter(Boolean);
  const amount = parseInt(document.getElementById('bulk_amount').value, 10);
  if (!users.length || !amount) { alert('fill fields'); return; }
  // resolve display names to IDs (simple)
  const { data } = await supabase.from('profiles').select('id,display_name').in('display_name', users);
  const ids = (data || []).map(x => x.id);
  if (!ids.length) { alert('No users resolved'); return; }
  const res = await fetch('/api/transfer/admin-transfer', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-admin-secret': ADMIN_SECRET },
    body: JSON.stringify({ receiverIds: ids, amount })
  });
  const json = await res.json();
  if (json.ok) alert('Bulk sent'); else alert('Error');
}
