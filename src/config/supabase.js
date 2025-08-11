// Supabase Configuration
// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings

export const SUPABASE_CONFIG = {
  // Your Supabase project URL (found in Project Settings > API)
  URL: import.meta.env.VITE_SUPABASE_URL,
  
  // Your Supabase anon/public key (found in Project Settings > API)
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Instructions:
// 1. Go to your Supabase project dashboard
// 2. Click on "Settings" in the sidebar
// 3. Click on "API"
// 4. Copy the "Project URL" and paste it above
// 5. Copy the "anon public" key and paste it above
// 6. Save this file
