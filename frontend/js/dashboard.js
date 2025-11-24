// frontend/js/dashboard.js

async function loadDashboard() {
  const profile = await getProfile();
  if (!profile) {
    window.location = '/login.html';
    return;
  }
  document.getElementById('vpoints').innerText = profile.vpoints ?? 0;
  document.getElementById('video_passes').innerText = profile.video_passes ?? 0;
  document.getElementById('referral_code').innerText = profile.referral_code ?? '';
  // check referral reward (simple)
  checkReferralReward(profile);
}

// watching action (uses one pass)
async function watchVideoAction() {
  const user = supabase.auth.user();
  if (!user) return window.location = '/login.html';
  const profile = await getProfile();
  if ((profile.video_passes || 0) <= 0) {
    alert('You have no video passes. Watch an ad (earn +5 passes) via the earn-passes flow (not implemented ad network in MVP).');
    return;
  }
  // consume one pass and give vpoints (10)
  const newPasses = (profile.video_passes || 0) - 1;
  const newPoints = (profile.vpoints || 0) + 10;
  await supabase.from('profiles').update({ video_passes: newPasses, vpoints: newPoints }).eq('id', profile.id);
  alert('Watched: +10 V-Points (1 video pass used)');
  await loadDashboard();
}

// checks referral and rewards once if condition met
async function checkReferralReward(profile) {
  try {
    const { data } = await supabase.from('profiles').select('id').eq('referred_by', profile.referral_code);
    const count = (data || []).length;
    if (count >= 10) {
      // check if rewarded
      const { data: rr } = await supabase.from('referral_rewards').select('*').eq('referrer', profile.id);
      if ((rr || []).length === 0) {
        // reward 50 V-Points
        await supabase.from('profiles').update({ vpoints: (profile.vpoints || 0) + 50 }).eq('id', profile.id);
        await supabase.from('referral_rewards').insert([{ referrer: profile.id, referee: null, rewarded: true }]);
        alert('Congrats — you earned 50 V-Points for inviting 10 friends!');
        await loadDashboard();
      }
    }
  } catch (err) {
    console.error('referral check error', err);
  }
}
