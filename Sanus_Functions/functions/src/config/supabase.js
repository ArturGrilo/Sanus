const {createClient} = require("@supabase/supabase-js");

let client = null;

function getSupabase() {
  if (client) return client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // não atires erro aqui para não “matar” a função toda ao arrancar
    console.error("❌ ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos no .env");
  }

  client = createClient(supabaseUrl, supabaseKey);
  return client;
}

module.exports = {getSupabase};