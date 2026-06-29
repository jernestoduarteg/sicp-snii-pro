SICP.CONFIG = {
  APP_NAME: 'SICP-SNII Pro',
  APP_VERSION: '2.0.0',
  STORAGE_KEY: 'sicp_snii_pro_data',
  USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE === 'true' || !!import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  ORCID_CLIENT_ID: ''
};
