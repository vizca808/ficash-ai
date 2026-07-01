"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BudgetManager({ categories, initialBudgets, expensesByCategory, currentMonth, currentYear }: any) {
  const router = useRouter();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [loading, setLoading] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editLimit, setEditLimit] = useState("");

  const handleSaveBudget = async (categoryId: string) => {
    if (!editLimit) {
      setEditCategoryId(null);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          monthlyLimit: parseInt(editLimit),
          month: currentMonth,
          year: currentYear
        })
      });
      if (res.ok) {
        const newBudget = await res.json();
        setBudgets((prev: any) => {
          const exists = prev.find((b: any) => b.categoryId === categoryId);
          if (exists) {
            return prev.map((b: any) => b.categoryId === categoryId ? newBudget : b);
          }
          return [...prev, newBudget];
        });
        setEditCategoryId(null);
        setEditLimit("");
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan anggaran.");
    }
    setLoading(false);
  };

  const getExpenseForCategory = (categoryId: string) => {
    return expensesByCategory[categoryId] || 0;
  };

  const getBudgetForCategory = (categoryId: string) => {
    return budgets.find((b: any) => b.categoryId === categoryId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat: any) => {
          const budget = getBudgetForCategory(cat.id);
          const limit = budget ? budget.monthlyLimit : 0;
          const spent = getExpenseForCategory(cat.id);
          const isEditing = editCategoryId === cat.id;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          
          let progressColor = "bg-blue-500";
          if (percentage >= 100) progressColor = "bg-red-500";
          else if (percentage >= 75) progressColor = "bg-yellow-500";

          return (
            <div key={cat.id} className="glass-card p-4 rounded-2xl border-l-4" style={{ borderColor: cat.color }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={editLimit}
                      onChange={(e) => setEditLimit(e.target.value)}
                      placeholder="Nominal"
                      className="w-24 md:w-32 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => handleSaveBudget(cat.id)}
                      disabled={loading}
                      className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
                    >
                      Simpan
                    </button>
                    <button 
                      onClick={() => setEditCategoryId(null)}
                      className="text-slate-400 hover:text-slate-300 text-sm font-medium"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditCategoryId(cat.id);
                      setEditLimit(limit > 0 ? limit.toString() : "");
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                  >
                    {limit > 0 ? "Ubah" : "Set Anggaran"}
                  </button>
                )}
              </div>
              
              {limit > 0 ? (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Terpakai: Rp {spent.toLocaleString("id-ID")}</span>
                    <span>Anggaran: Rp {limit.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                  </div>
                  <div className="mt-1 text-right text-xs">
                    <span className={percentage >= 100 ? "text-red-400 font-bold" : (percentage >= 75 ? "text-yellow-400 font-bold" : "text-slate-500")}>
                      {percentage.toFixed(1)}% terpakai
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">Belum ada batas anggaran yang diatur.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
