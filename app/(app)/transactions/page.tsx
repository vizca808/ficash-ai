import prisma from "@/lib/db";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import TransactionList from "./TransactionList";

export default async function TransactionsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    include: { category: true },
    orderBy: { date: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Semua Transaksi</h1>
        <Link 
          href="/transactions/new"
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors font-medium"
        >
          + Tambah
        </Link>
      </header>

      <TransactionList initialTransactions={transactions} />
    </div>
  );
}
