"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
export default function AuthBox() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined } });
    setLoading(false);
    if (!error) setSent(true); else alert(error.message);
  }
  return (
    <div className="max-w-md mx-auto p-6 border border-zinc-700 rounded-2xl bg-zinc-900/50">
      <h2 className="text-2xl font-bold mb-2">Вход по почте</h2>
      <p className="text-sm opacity-75 mb-4">Магическая ссылка на почту. Без паролей.</p>
      <input className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700" placeholder="you@email.com"
             value={email} onChange={(e)=>setEmail(e.target.value)} />
      <button disabled={loading || !email} onClick={signIn} className="mt-3 w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
        {loading ? "Отправка..." : "Получить ссылку"}
      </button>
      {sent && <p className="text-sm mt-3 text-green-400">Проверь почту и нажми на ссылку.</p>}
    </div>
  );
}
