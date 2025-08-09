"use client";
export function levelFromXP(xp: number){
  let level = 1; let need = 100; let acc = 0;
  while (xp >= acc + need) { acc += need; level++; need = 100 * level; }
  const current = xp - acc; const next = need; const percent = Math.min(100, Math.round(current/next*100));
  return { level, current, next, percent };
}
export default function LevelBar({ xp, title }: { xp: number; title: string; }){
  const { level, current, next, percent } = levelFromXP(xp);
  return (
    <div className="p-4 border border-zinc-700 rounded-2xl bg-zinc-900/50">
      <div className="text-xl font-semibold">🎖️ Уровень {level} <span className="opacity-70">— {title}</span></div>
      <div className="text-sm opacity-75">XP: {xp}</div>
      <div className="w-full h-3 bg-zinc-800 rounded mt-2"><div className="h-3 rounded bg-green-600" style={{ width: `${percent}%`}}/></div>
      <div className="text-xs opacity-70 mt-1">{current} / {next} до следующего уровня</div>
    </div>
  );
}
