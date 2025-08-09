"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LevelBar, { levelFromXP } from "./LevelBar";

const QUEST_TYPES: Record<string,string> = { daily: "Ежедневный", routine: "Распорядок", oneoff: "Разовый" };
const TITLES = [
  { lvl: 1, title: "Новичок дисциплины" },
  { lvl: 3, title: "Ученик железной воли" },
  { lvl: 5, title: "Оператор режима" },
  { lvl: 8, title: "Строитель распорядка" },
  { lvl: 12, title: "Архитектор энергии" },
  { lvl: 16, title: "Мастер потока" },
  { lvl: 20, title: "Легенда дисциплины" },
];
function titleForLevel(l:number){ let cur=TITLES[0].title; for (const t of TITLES) if (l>=t.lvl) cur=t.title; else break; return cur; }

export default function QuestList(){
  const [userId, setUserId] = useState<string|null>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [completedToday, setCompletedToday] = useState<number[]>([]);
  const [xp, setXp] = useState(0);
  const [rp, setRp] = useState(0);
  const [filter, setFilter] = useState("all");
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session)=>{ setUserId(session?.user?.id ?? null); });
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    return () => { sub.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { if (!userId) return; (async()=>{
    const { data: q } = await supabase.from("quests").select("id,title,xp,type").order("id");
    setQuests(q||[]);
    const { data: c } = await supabase.from("completions").select("quest_id").eq("date", today);
    setCompletedToday((c||[]).map((x:any)=>x.quest_id));
    const { data: prof } = await supabase.from("profiles").select("xp,rp").single();
    if (prof){ setXp(prof.xp||0); setRp(prof.rp||0); }
  })(); }, [userId, today]);

  const { level } = useMemo(()=>levelFromXP(xp),[xp]);
  const title = useMemo(()=>titleForLevel(level),[level]);

  async function addQuest(title:string, xp:number, type:string){
    const { error, data } = await supabase.from("quests").insert({ title, xp, type }).select("id").single();
    if (error) return alert(error.message);
    setQuests([...quests, { id: data.id, title, xp, type }]);
  }
  async function removeQuest(id:number){
    const { error } = await supabase.from("quests").delete().eq("id", id);
    if (error) return alert(error.message);
    setQuests(quests.filter(q=>q.id!==id));
    setCompletedToday(completedToday.filter(qid=>qid!==id));
  }
  async function completeQuest(q:any){
    if (completedToday.includes(q.id)) return;
    const { error } = await supabase.from("completions").insert({ quest_id: q.id, date: today });
    if (error) return alert(error.message);
    setCompletedToday([...completedToday, q.id]);
    const gainedRP = Math.max(1, Math.round(q.xp/25));
    const { error: e2 } = await supabase.rpc("gain_xp_rp", { add_xp: q.xp, add_rp: gainedRP });
    if (e2) return alert(e2.message);
    setXp(xp+q.xp); setRp(rp+gainedRP);
  }
  async function buyReward(item:{id:string;name:string;cost:number}){
    if (rp < item.cost) return;
    const { error } = await supabase.rpc("spend_rp", { spend: item.cost });
    if (error) return alert(error.message);
    setRp(rp - item.cost);
  }

  const rewardShop = [
    { id: "yt1", name: "1 вдохновляющее видео", cost: 3 },
    { id: "game30", name: "30 минут игры (наградой)", cost: 6 },
    { id: "walk", name: "Прогулка 20 минут", cost: 2 },
    { id: "snack", name: "Полезный снэк", cost: 2 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LevelBar xp={xp} title={title} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 border border-zinc-700 rounded-2xl bg-zinc-900/50">
          <div className="font-semibold mb-2">➕ Добавить квест</div>
          <AddQuest onAdd={addQuest} />
        </div>
        <div className="p-4 border border-zinc-700 rounded-2xl bg-zinc-900/50">
          <div className="font-semibold mb-2">🎯 Фильтр</div>
          <select className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" value={filter} onChange={(e)=>setFilter(e.target.value)}>
            <option value="all">Все</option><option value="daily">Ежедневные</option><option value="routine">Распорядок</option><option value="oneoff">Разовые</option>
          </select>
          <div className="text-xs opacity-70 mt-2">Сегодня: {new Date().toISOString().slice(0,10)}</div>
        </div>
        <div className="p-4 border border-zinc-700 rounded-2xl bg-zinc-900/50">
          <div className="font-semibold mb-2">🛒 Магазин наград</div>
          <div className="space-y-2">
            {rewardShop.map((it)=>(
              <div key={it.id} className="flex items-center justify-between border border-zinc-700 rounded-xl px-3 py-2">
                <div><div className="text-sm font-medium">{it.name}</div><div className="text-xs opacity-70">Цена: {it.cost} RP</div></div>
                <button disabled={rp<it.cost} onClick={()=>buyReward(it)} className="bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg">Купить</button>
              </div>
            ))}
          </div>
          <div className="text-xs opacity-70 mt-2">RP: {rp}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.filter(q=> filter==="all" ? true : q.type===filter).map(q=>{
          const done = completedToday.includes(q.id);
          return (
            <div key={q.id} className={`p-4 border rounded-2xl bg-zinc-900/50 ${done? 'opacity-60 border-green-500': 'border-zinc-700'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{q.title}</div>
                  <div className="text-xs opacity-80">+{q.xp} XP · {QUEST_TYPES[q.type]||q.type}</div>
                </div>
                <div className="flex gap-2">
                  <button disabled={done} onClick={()=>completeQuest(q)} className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg">{done? 'Выполнено' : 'Выполнить'}</button>
                  <button onClick={()=>removeQuest(q.id)} className="border border-zinc-600 px-3 py-1.5 rounded-lg">Удалить</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddQuest({ onAdd }:{ onAdd:(title:string,xp:number,type:string)=>void }){
  const [title, setTitle] = useState(""); const [xp, setXP] = useState(20); const [type, setType] = useState("daily");
  return (
    <div className="space-y-2">
      <input className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700" placeholder="Название квеста" value={title} onChange={e=>setTitle(e.target.value)} />
      <div className="flex gap-2">
        <input type="number" min={1} className="w-28 px-3 py-2 rounded bg-zinc-800 border border-zinc-700" value={xp} onChange={e=>setXP(Number(e.target.value))} />
        <select className="w-44 px-3 py-2 rounded bg-zinc-800 border border-zinc-700" value={type} onChange={e=>setType(e.target.value)}>
          <option value="daily">Ежедневный</option><option value="routine">Распорядок</option><option value="oneoff">Разовый</option>
        </select>
        <button onClick={()=>{ if(!title||xp<=0) return; onAdd(title,xp,type); setTitle(""); setXP(20); setType("daily"); }} className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg">Добавить</button>
      </div>
      <div className="text-xs opacity-70">Совет: держи XP в диапазоне 10–40.</div>
    </div>
  );
}
