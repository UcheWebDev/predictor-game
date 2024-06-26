import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://liqvehozsqomoftifbgf.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcXZlaG96c3FvbW9mdGlmYmdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg5OTk4MjQsImV4cCI6MjAzNDU3NTgyNH0.PRnvTO9zE_X-FvVQuznnAQf0k_TIuyZ7xc7O13s0h6Y"
export const supabase = createClient(supabaseUrl, supabaseKey)