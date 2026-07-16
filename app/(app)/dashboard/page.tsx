import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardAlerts from "./DashboardAlerts";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/login");


  // Fetch transactions for current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // FIX: add upper bound so future-dated transactions don't bleed into "this month"
  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  
  // Fetch ALL transactions to compute cumulative carry-over
  const allTransactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  // Strictly filter: current month only (between 1st of this month and 1st of next month)
  const currentMonthTx = allTransactions.filter(tx => {
    const d = new Date(tx.date);
    return d >= startOfMonth && d < startOfNextMonth;
  });
  // Everything strictly before this month
  const prevMonthTx = allTransactions.filter(tx => new Date(tx.date) < startOfMonth);

  // Current month stats
  const spent = currentMonthTx
    .filter(tx => tx.type === 'EXPENSE')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const income = currentMonthTx
    .filter(tx => tx.type === 'INCOME')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Carry-over: net balance from ALL previous months  
  const carryOver = prevMonthTx.reduce((sum, tx) => {
    return sum + (tx.type === 'INCOME' ? tx.amount : -tx.amount);
  }, 0);

  // Total balance = carry-over sisa bulan lalu + saldo bulan ini
  const totalBalance = carryOver + income - spent;
  
  // Current month name for display
  const currentMonthName = today.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  // Build monthly history grouped by year-month (for previous months)
  const monthlyHistory: Record<string, { label: string; income: number; expense: number; balance: number; transactions: typeof allTransactions }> = {};
  prevMonthTx.forEach(tx => {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyHistory[key]) {
      monthlyHistory[key] = {
        label: d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        income: 0,
        expense: 0,
        balance: 0,
        transactions: [],
      };
    }
    if (tx.type === 'INCOME') monthlyHistory[key].income += tx.amount;
    else monthlyHistory[key].expense += tx.amount;
    monthlyHistory[key].balance = monthlyHistory[key].income - monthlyHistory[key].expense;
    monthlyHistory[key].transactions.push(tx);
  });

  // Sort months descending
  const sortedMonths = Object.entries(monthlyHistory).sort(([a], [b]) => b.localeCompare(a));

  // Calculate expenses by category for the chart (current month only)
  const categoryTotals: Record<string, {name: string, color: string, amount: number}> = {};
  currentMonthTx.filter(tx => tx.type === 'EXPENSE').forEach(tx => {
    if (!tx.category) return;
    if (!categoryTotals[tx.category.id]) {
      categoryTotals[tx.category.id] = { name: tx.category.name, color: tx.category.color, amount: 0 };
    }
    categoryTotals[tx.category.id].amount += tx.amount;
  });
  const categoryData = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

  // Use currentMonthTx for the recent transactions list
  const transactions = currentMonthTx;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-slate-400 text-sm">Selamat datang kembali 👋</p>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-slate-500 text-xs mt-1">Ficash-AI — tempat terbaik untuk mencatat &amp; mengatur keuangan pintarmu. 💡</p>
        </div>
      </header>

      {/* Hero Widget: Total Balance (Credit Card Style) */}
      <div className="relative p-8 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-500 ease-out bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700/50">
        {/* Holographic light effect */}
        <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-b from-transparent via-white/5 to-transparent -rotate-45 pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1 tracking-widest uppercase">Total Saldo</p>
              <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${totalBalance < 0 ? 'text-red-400' : 'text-white'}`}>
                <span className="text-2xl md:text-3xl font-medium text-slate-400 mr-1">Rp</span>
                {totalBalance.toLocaleString("id-ID")}
              </h2>
            </div>
            <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-400/80 to-yellow-600/80 shadow-inner flex items-center justify-center opacity-80">
               {/* Simulating EMV Chip */}
               <div className="w-8 h-5 border border-yellow-800/30 rounded-sm"></div>
            </div>
          </div>
          
          <div className="flex gap-8 pt-6 border-t border-slate-700/50 flex-wrap">
            <div>
              <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">Pemasukan ⬇</p>
              <p className="text-sm font-bold text-emerald-400">Rp {income.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">Pengeluaran ⬆</p>
              <p className="text-sm font-bold text-red-400">Rp {spent.toLocaleString("id-ID")}</p>
            </div>
            {carryOver !== 0 && (
              <div>
                <p className="text-[10px] text-slate-400 mb-1 uppercase tracking-wider font-semibold">Sisa Bln Lalu 🏦</p>
                <p className={`text-sm font-bold ${carryOver >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  Rp {carryOver.toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-6 right-6 font-mono text-slate-500/50 text-sm tracking-[0.2em]">
            FICASH • AI
          </div>
        </div>
      </div>



  {/* Fetch Alerts for Budgets and Subscriptions */}
  {(() => {
    return (
      <div className="space-y-3">
        <DashboardAlerts userId={user.id} categoryTotals={categoryTotals} />
      </div>
    );
  })()}

  {/* Expense Chart */}
      {spent > 0 && (
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="font-semibold mb-3 text-sm">Porsi Pengeluaran</h3>
          <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex mb-4">
            {categoryData.map((cat, i) => (
              <div 
                key={i}
                className="h-full" 
                style={{ width: `${(cat.amount / spent) * 100}%`, backgroundColor: cat.color }}
                title={`${cat.name}: Rp ${cat.amount.toLocaleString('id-ID')}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
             {categoryData.slice(0,4).map((cat, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                 <span className="text-slate-400 truncate">{cat.name}</span>
                 <span className="ml-auto font-medium">{Math.round((cat.amount/spent)*100)}%</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Quick Actions / Recent Trans */}
      <div className="flex justify-between items-center pt-2">
        <h3 className="font-semibold">Transaksi Terakhir</h3>
        <Link href="/transactions" className="text-blue-400 text-sm hover:underline">Lihat Semua</Link>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center space-y-3">
            <div className="text-4xl">📝</div>
            <p className="text-slate-400">Belum ada transaksi. Yuk catat pemasukan atau pengeluaran pertamamu!</p>
          </div>
        ) : (
          transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                  {tx.category?.icon || "❓"}
                </div>
                <div>
                  <p className="font-semibold">{tx.merchant || tx.description || "Transaksi"}</p>
                  <p className="text-xs text-slate-400">{tx.category?.name} • {tx.date.toISOString().split("T")[0]}</p>
                </div>
              </div>
              <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString("id-ID")}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Monthly History Section */}
      {sortedMonths.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="font-semibold">Riwayat Bulan Sebelumnya</h3>
          {sortedMonths.map(([key, month]) => (
            <details key={key} className="glass-card rounded-2xl overflow-hidden group">
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">📅</div>
                  <div>
                    <p className="font-semibold text-slate-200">{month.label}</p>
                    <p className="text-xs text-slate-400">{month.transactions.length} transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${month.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {month.balance >= 0 ? '+' : ''}{month.balance.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-500">saldo bulan itu</p>
                </div>
              </summary>
              <div className="border-t border-slate-700/50">
                <div className="flex gap-4 px-4 py-3 bg-slate-900/30">
                  <div>
                    <p className="text-xs text-slate-500">Pemasukan</p>
                    <p className="text-xs font-semibold text-emerald-400">Rp {month.income.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pengeluaran</p>
                    <p className="text-xs font-semibold text-red-400">Rp {month.expense.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-700/30">
                  {month.transactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{tx.category?.icon || '❓'}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{tx.merchant || tx.description || 'Transaksi'}</p>
                          <p className="text-xs text-slate-500">{tx.category?.name} • {new Date(tx.date).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                      <p className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} {tx.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                  {month.transactions.length > 10 && (
                    <p className="text-xs text-center text-slate-500 py-3">+{month.transactions.length - 10} transaksi lainnya. Lihat di halaman Transaksi.</p>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}

      {/* Floating Action Button for Transaction Input */}
      <Link 
        href="/transactions/new"
        className="fixed bottom-20 md:bottom-10 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-blue-600/40 transition-transform hover:scale-105 z-50"
      >
        +
      </Link>
    </div>
  );
}
