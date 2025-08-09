"use client";
import { useEffect, useState } from "react";
import AuthBox from "@/components/Auth";
import QuestList from "@/components/QuestList";
import { supabase } from "@/lib/supabaseClient";
export default function Home() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess));
    return () => { sub.subscription.unsubscribe(); };
  }, []);
  if (loading) return <div className="max-w-5xl mx-auto">Загрузка...</div>;
  if (!session) return <AuthBox />;
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-75">Привет! Ты вошёл как {session.user.email}</div>
        <button className="border border-zinc-600 px-3 py-1.5 rounded-lg" onClick={()=>supabase.auth.signOut()}>Выйти</button>
      </div>
      <QuestList />
    </div>
  );
}
