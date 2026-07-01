"use client";

import { useState, useEffect } from "react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        await fetchInsights();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus insight ini?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/insights?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchInsights();
      } else {
        alert("Gagal menghapus insight.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan saat menghapus.");
    }
    setIsDeleting(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gradient">AI Insights</h1>
      </header>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-1"
      >
        {loading ? "Menganalisis Data..." : "✨ Minta Analisis AI Sekarang"}
      </button>

      <div className="space-y-4 mt-6">
        {insights.length === 0 ? (
          <div className="glass-card p-10 rounded-3xl text-center space-y-4 border border-slate-800">
            <div className="text-6xl mb-2">🤖</div>
            <h3 className="text-xl font-bold text-slate-300">Belum Ada Analisis</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Klik tombol di atas untuk membiarkan AI menganalisis kondisi keuanganmu berdasarkan transaksi terakhir.
            </p>
          </div>
        ) : (
          insights.map((insight) => (
            <div 
              key={insight.id}
              className={`glass-card p-6 rounded-3xl border-l-4 transition-all hover:bg-slate-800/80 group relative
                ${insight.severity === 'WARNING' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}
              `}
            >
              <button
                onClick={() => handleDelete(insight.id)}
                disabled={isDeleting === insight.id}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-800 rounded-full"
                title="Hapus insight"
              >
                {isDeleting === insight.id ? "..." : "🗑️"}
              </button>
              
              <div className="flex justify-between items-start mb-4 pr-10">
                <h2 className="font-bold text-lg text-slate-200">{insight.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-md font-medium
                  ${insight.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}
                `}>
                  {new Date(insight.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              
              <div className="text-slate-300 space-y-3 leading-relaxed text-sm">
                <p>{insight.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
