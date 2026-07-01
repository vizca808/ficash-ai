"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

export default function TransactionList({ initialTransactions }: { initialTransactions: any[] }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, INCOME, EXPENSE

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    setIsProcessing(true);
    try {
      await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      alert("Gagal menghapus");
    }
    setIsProcessing(false);
  };

  const handleDeleteAll = async () => {
    if (!confirm("Yakin ingin menghapus SEMUA transaksi? Aksi ini tidak dapat dibatalkan.")) return;
    setIsProcessing(true);
    try {
      await fetch(`/api/transactions?id=all`, { method: "DELETE" });
      router.refresh();
    } catch (e) {
      alert("Gagal menghapus semua transaksi");
    }
    setIsProcessing(false);
  };

  const handleExportCSV = () => {
    if (initialTransactions.length === 0) return alert("Tidak ada data untuk diekspor");
    
    const headers = ["Tanggal", "Tipe", "Kategori", "Merchant/Catatan", "Nominal"];
    const rows = initialTransactions.map(tx => [
      new Date(tx.date).toISOString().split("T")[0],
      tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      tx.category?.name || "Lainnya",
      tx.merchant || tx.description || "-",
      tx.amount.toString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(String).map(v => v.includes(",") ? `"${v}"` : v).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ficash_transactions_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = useMemo(() => {
    return initialTransactions.filter(tx => {
      const matchSearch = (tx.merchant || tx.description || "").toLowerCase().includes(search.toLowerCase()) || 
                          (tx.category?.name || "").toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === "ALL" ? true : tx.type === filterType;
      return matchSearch && matchType;
    });
  }, [initialTransactions, search, filterType]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <input 
          type="text"
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
        />
        <div className="flex gap-2">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800/50 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="EXPENSE">Pengeluaran</option>
            <option value="INCOME">Pemasukan</option>
          </select>
          <button 
            onClick={handleExportCSV}
            className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
          >
            📥 Ekspor CSV
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm px-2">
        <span className="text-slate-400">Menampilkan {filteredTransactions.length} transaksi</span>
        <button 
          onClick={handleDeleteAll}
          disabled={isProcessing}
          className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 font-medium"
        >
          Hapus Semua
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center text-slate-400 py-10 glass-card rounded-2xl">
          Tidak ada transaksi yang cocok.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((tx: any) => (
            <div key={tx.id} className="glass-card p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                  {tx.category?.icon || "❓"}
                </div>
                <div>
                  <p className="font-semibold truncate max-w-[150px] md:max-w-[300px]">
                    {tx.merchant || tx.description || "Transaksi"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {tx.category?.name || "Lainnya"} • {new Date(tx.date).toISOString().split("T")[0]}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <p className={`font-semibold whitespace-nowrap ${tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                  {tx.type === "INCOME" ? "+" : "-"} Rp {tx.amount.toLocaleString("id-ID")}
                </p>
                <button 
                  onClick={() => handleDelete(tx.id)}
                  disabled={isProcessing}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-2"
                  title="Hapus"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
