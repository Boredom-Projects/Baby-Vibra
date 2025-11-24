// frontend/js/supabaseClient.js
// include <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script> in your pages

const SUPABASE_URL = 'https://rovdsomfwjrswvgmvpyi.supabase.co'; // e.g. https://xyz.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvdmRzb21md2pyc3d2Z212cHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjIxODcsImV4cCI6MjA3OTQ5ODE4N30.Sd_Bfdk1Q9z59G9jTvKgw6KQ7a1VV7yIui8yt8T9fJU';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// helper: get profile (returns profile row)
async function getProfile() {
  const user = supabase.auth.user();
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) return null;
  return data;
}
