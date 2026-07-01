"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-card p-8 rounded-2xl">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-gradient">Ficash</span>-AI
        </h1>
        <p className="text-slate-300 mb-8 text-lg">
          Asisten keuangan pribadi AI yang mencatat tanpa ribet dan memberi wawasan cerdas.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/30"
          >
            Mulai Sekarang Gratis
          </button>
        </div>
        
        <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-slate-400">
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🎙️</span>
            <span>Voice Input</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">📸</span>
            <span>Scan Struk</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-2">🤖</span>
            <span>AI Insights</span>
          </div>
        </div>
      </div>
    </main>
  );
}
