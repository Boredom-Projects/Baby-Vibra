# Baby Vibra (Single-repo MVP)

## Quick setup (local)

1. Create a Supabase project.
2. Run `supabase_schema.sql` in the Supabase SQL Editor.
3. Enable Email auth (or choose passwordless) in Supabase Auth settings.
4. Copy your Supabase URL and ANON KEY.

### Frontend
- Open `frontend/js/supabaseClient.js` and replace `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### Backend
- In `backend/.env` (create from `.env.example`), set:
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY (SERVICE ROLE key from Supabase - **server-side only**)
  - ADMIN_SECREADMIN_SECRET (pick a strong secret)
- From `baby-vibra/backend`:
  ```bash
  npm install
  npm start
