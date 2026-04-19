import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://qcinrnojycjuzgllzosf.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjaW5ybm9qeWNqdXpnbGx6b3NmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzODc0NTcsImV4cCI6MjA5MTk2MzQ1N30.lM_rENEQd2Vtw-xZRTNXFNjgpeY6h-Fr0yFM3yt5joQ"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)