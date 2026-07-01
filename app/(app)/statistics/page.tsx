import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StatisticsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) redirect("/login");

  const today = new Date();
  
  // For 6-month trend
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  const allTx = await prisma.transaction.findMany({
    where: { 
      userId: user.id,
      date: { gte: sixMonthsAgo }
    },
    include: { category: true },
    orderBy: { date: 'asc' },
  });

  // Current month stats
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const currentMonthTx = allTx.filter(tx => tx.date >= startOfMonth);
  const expenses = currentMonthTx.filter(tx => tx.type === 'EXPENSE');
  const totalExpense = expenses.reduce((sum, tx) => sum + tx.amount, 0);

  // Stats by Category (Current Month)
  const categoryTotals: Record<string, {name: string, color: string, amount: number, icon: string}> = {};
  expenses.forEach(tx => {
    if (!tx.category) return;
    if (!categoryTotals[tx.category.id]) {
      categoryTotals[tx.category.id] = { name: tx.category.name, color: tx.category.color, icon: tx.category.icon, amount: 0 };
    }
    categoryTotals[tx.category.id].amount += tx.amount;
  });
  const categoryData = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);
  const topCategory = categoryData[0];

  // Highest Transaction
  const sortedExpenses = [...expenses].sort((a, b) => b.amount - a.amount);
  const highestTx = sortedExpenses[0];

  // 6-Month Trend Calculation
  const trendData: Record<string, { month: string, income: number, expense: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trendData[key] = {
      month: d.toLocaleString('id-ID', { month: 'short' }),
      income: 0,
      expense: 0
    };
  }

  allTx.forEach(tx => {
    const key = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
    if (trendData[key]) {
      if (tx.type === 'INCOME') trendData[key].income += tx.amount;
      else trendData[key].expense += tx.amount;
    }
  });

  const trendArray = Object.values(trendData);
  const maxAmount = Math.max(...trendArray.map(t => Math.max(t.income, t.expense)), 1); // Avoid div by 0

  // Busiest Day of the Week (All Time in last 6 months, or current month? Let's do current month)
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const dayAmounts = [0, 0, 0, 0, 0, 0, 0];
  
  expenses.forEach(tx => {
    const day = tx.date.getDay();
    dayCounts[day]++;
    dayAmounts[day] += tx.amount;
  });

  const maxDayCount = Math.max(...dayCounts, 1);
  const busiestDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
  const busiestDayName = dayCounts[busiestDayIndex] > 0 ? dayNames[busiestDayIndex] : "-";

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-white">← Kembali</Link>
        <h1 className="text-2xl font-bold text-gradient">Statistik</h1>
      </header>

      {/* 6-Month Trend Chart */}
      <div className="glass-card p-6 rounded-3xl">
        <h3 className="font-bold mb-6">Tren 6 Bulan Terakhir</h3>
        <div className="h-40 flex items-end justify-between gap-2">
          {trendArray.map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 group relative">
              {/* Tooltip */}
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-700 text-xs rounded-lg p-2 transition-opacity z-10 pointer-events-none w-max shadow-xl">
                <p className="text-emerald-400">Masuk: Rp {t.income.toLocaleString('id-ID')}</p>
                <p className="text-red-400">Keluar: Rp {t.expense.toLocaleString('id-ID')}</p>
              </div>
              
              <div className="flex gap-1 w-full justify-center h-full items-end">
                <div 
                  className="w-1/3 bg-emerald-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                  style={{ height: `${(t.income / maxAmount) * 100}%`, minHeight: t.income > 0 ? '4px' : '0' }}
                />
                <div 
                  className="w-1/3 bg-red-500 rounded-t-sm opacity-80 hover:opacity-100 transition-all"
                  style={{ height: `${(t.expense / maxAmount) * 100}%`, minHeight: t.expense > 0 ? '4px' : '0' }}
                />
              </div>
              <span className="text-xs text-slate-400">{t.month}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-slate-400 justify-center">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Pemasukan</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> Pengeluaran</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-blue-500">
          <p className="text-xs text-slate-400 mb-1">Pengeluaran Terbesar (Bulan Ini)</p>
          <p className="font-bold text-lg truncate" title={topCategory?.name || "-"}>
            {topCategory?.icon} {topCategory?.name || "-"}
          </p>
          <p className="text-sm text-red-400 font-semibold">
            {topCategory ? `Rp ${topCategory.amount.toLocaleString("id-ID")}` : "Rp 0"}
          </p>
        </div>
        <div className="glass-card p-4 rounded-2xl border-l-4 border-purple-500">
          <p className="text-xs text-slate-400 mb-1">Hari Paling Boros (Bulan Ini)</p>
          <p className="font-bold text-lg truncate">
            📅 {busiestDayName}
          </p>
          <p className="text-sm text-red-400 font-semibold">
            {dayCounts[busiestDayIndex] > 0 ? `${dayCounts[busiestDayIndex]} transaksi` : "Belum ada"}
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold mb-4">Rincian Kategori Pengeluaran (Bulan Ini)</h3>
        
        {categoryData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">Belum ada data pengeluaran bulan ini.</p>
        ) : (
          <div className="space-y-4">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-slate-800" style={{ boxShadow: `0 0 10px ${cat.color}20` }}>
                  {cat.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-sm">{cat.name}</span>
                    <span className="font-medium text-sm">Rp {cat.amount.toLocaleString("id-ID")}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${(cat.amount / totalExpense) * 100}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
