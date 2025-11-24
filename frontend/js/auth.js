// frontend/js/auth.js

async function register(display_name, email, password) {
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // create profile
  const referral_code = Math.random().toString(36).substring(2,9);
  await supabase.from('profiles').insert([{ id: user.id, display_name, referral_code }]);
  alert('Registered! Check your email to confirm (if email confirmation is enabled). Then login.');
  window.location = '/login.html';
}

async function login(email, password) {
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) throw error;
  // redirect to dashboard
  window.location = '/dashboard.html';
}

async function logout() {
  await supabase.auth.signOut();
  window.location = '/';
}
