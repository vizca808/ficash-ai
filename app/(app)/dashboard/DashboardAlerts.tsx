import prisma from "@/lib/db";
import Link from "next/link";

export default async function DashboardAlerts({ userId, categoryTotals }: { userId: string, categoryTotals: any }) {
  const today = new Date();

  // Budgets near limit
  const budgets = await prisma.budget.findMany({
    where: { userId, month: today.getMonth() + 1, year: today.getFullYear() },
    include: { category: true }
  });

  const overBudgets = budgets.filter(b => {
    const spent = categoryTotals[b.categoryId]?.amount || 0;
    return spent >= b.monthlyLimit * 0.9 && b.monthlyLimit > 0; // Warn at 90%
  });

  if (overBudgets.length === 0) return null;

  return (
    <>
      {overBudgets.map(b => {
        const spent = categoryTotals[b.categoryId]?.amount || 0;
        const percentage = Math.round((spent / b.monthlyLimit) * 100);
        return (
          <div key={`budget-${b.id}`} className="glass-card p-4 rounded-2xl border-l-4 border-red-500 flex items-center justify-between shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <div>
              <p className="text-sm font-semibold text-red-400">Peringatan Anggaran {b.category.name}</p>
              <p className="text-xs text-slate-400">Pengeluaran sudah mencapai {percentage}% dari batas Rp {b.monthlyLimit.toLocaleString('id-ID')}</p>
            </div>
            <Link href="/budget" className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg">Cek</Link>
          </div>
        );
      })}
    </>
  );
}
