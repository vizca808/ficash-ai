import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import BudgetManager from "./BudgetManager";

export const dynamic = 'force-dynamic';

export default async function BudgetPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  if (!user) redirect("/login");

  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth, 1);

  // Fetch expense categories
  const categories = await prisma.category.findMany({
    where: { type: 'EXPENSE' },
    orderBy: { sortOrder: 'asc' }
  });

  // Fetch current budgets
  const budgets = await prisma.budget.findMany({
    where: {
      userId: user.id,
      month: currentMonth,
      year: currentYear
    },
    include: { category: true }
  });

  // Fetch expenses for the current month
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      type: 'EXPENSE',
      date: { gte: startOfMonth, lt: startOfNextMonth }
    }
  });

  const expensesByCategory = transactions.reduce((acc: any, tx) => {
    if (!acc[tx.categoryId]) acc[tx.categoryId] = 0;
    acc[tx.categoryId] += tx.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-white">← Kembali</Link>
        <div>
          <h1 className="text-2xl font-bold text-gradient">Manajer Anggaran</h1>
          <p className="text-slate-400 text-sm">Bulan {today.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
        </div>
      </header>

      <div className="glass-card p-6 rounded-3xl mb-6">
        <p className="text-slate-300">
          Tetapkan batas pengeluaran maksimum untuk setiap kategori. Kami akan memberitahu kamu jika pengeluaran sudah mendekati batas anggaran.
        </p>
      </div>

      <BudgetManager 
        categories={categories} 
        initialBudgets={budgets} 
        expensesByCategory={expensesByCategory}
        currentMonth={currentMonth}
        currentYear={currentYear}
      />
    </div>
  );
}
