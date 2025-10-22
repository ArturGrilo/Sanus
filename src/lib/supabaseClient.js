import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qwgwdameesjbbhcrxlql.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Z3dkYW1lZXNqYmJoY3J4bHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxODIwNzYsImV4cCI6MjA3NTc1ODA3Nn0.XcU_zidJQB5Luw1s_aFqjzCO0Cgsx8DHtToC25afZHI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);