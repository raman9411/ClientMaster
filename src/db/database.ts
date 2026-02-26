import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export let dbError: string | null = null;

const initSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    dbError = "Missing Supabase Credentials. Please provide SUPABASE_URL and SUPABASE_KEY in your .env file.";
    console.error(`❌ [SUPABASE CONFIG OVERRIDE] ❌\n${dbError}`);
    return null;
  }

  try {
    const client = createClient(supabaseUrl, supabaseKey);
    console.log(`[Supabase] Successfully initialized remote client.`);
    return client;
  } catch (error: any) {
    dbError = `Supabase Connection Error: ${error.message}`;
    console.error(`❌ [SUPABASE CONNECTION ERROR] ❌\n${dbError}`);
    return null;
  }
};

export const supabase = initSupabase();

export function initDb() {
  // Remote database schema is maintained in Supabase Dashboard. Local creation isn't required.
  if (dbError) {
    console.error("Skipping DB checks due to credential issues.");
  }
}
