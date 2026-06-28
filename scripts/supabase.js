import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lathuftssqgdxawjunwc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdGh1ZnRzc3FnZHhhd2p1bndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTc1NTMsImV4cCI6MjA5ODE5MzU1M30.CMOWX4nexPvaaNxpaCNuvewG3xV1hOY8rm3M092lU0Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);