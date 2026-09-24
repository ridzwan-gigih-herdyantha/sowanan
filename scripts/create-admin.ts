import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!rawUrl || !serviceKey || !email || !password) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD di .env");
  process.exit(1);
}
if (password.length < 12) {
  console.error("ADMIN_PASSWORD minimal 12 karakter.");
  process.exit(1);
}

const supabase = createClient(new URL(rawUrl).origin, serviceKey, { auth: { persistSession: false } });
const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });

if (error) {
  console.error("Gagal membuat admin:", error.message);
  process.exit(1);
}
console.log("Admin dibuat:", data.user.email);
