import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Discipline Tracker — Cloud", description: "GTA × RPG × CRMP discipline game" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen p-6">
          <header className="max-w-5xl mx-auto mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div><h1 className="text-3xl font-bold">Discipline Tracker Cloud</h1><p className="text-sm opacity-70">Стиль: GTA × RPG × CRMP</p></div>
          </header>
          {children}
          <footer className="max-w-5xl mx-auto mt-10 text-center opacity-60 text-xs">Сделано для Архитектора 😎</footer>
        </div>
        <script dangerouslySetInnerHTML={{__html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(()=>{}); }); }`}} />
      </body>
    </html>
  );
}
