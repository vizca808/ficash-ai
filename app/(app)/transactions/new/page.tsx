"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewTransactionPage() {
  const router = useRouter();
  const [tab, setTab] = useState("MANUAL"); // MANUAL, VOICE, OCR
  
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("EXPENSE"); // EXPENSE, INCOME
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCategories(data);
          // Set default category
          const defaultExp = data.find(c => c.type === 'EXPENSE');
          if (defaultExp) setCategoryId(defaultExp.id);
        }
      });
  }, []);

  // Update default category when type changes
  useEffect(() => {
    const defaultCat = categories.find(c => c.type === type);
    if (defaultCat) setCategoryId(defaultCat.id);
  }, [type, categories]);

  const handleManualSave = async () => {
    if (!amount || !merchant || !date || !categoryId) return alert("Lengkapi semua data");
    setIsProcessing(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          merchant,
          description,
          date,
          categoryId,
          type
        })
      });
      if (res.ok) {
        router.push("/transactions");
        router.refresh();
      } else {
        alert("Gagal menyimpan transaksi");
      }
    } catch (e) {
      alert("Error saving transaction");
    }
    setIsProcessing(false);
  };

  const handleVoiceProcess = async () => {
    if (!voiceText) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: voiceText })
      });
      const data = await res.json();
      if (data && data.amount) {
        setAmount(data.amount.toString());
        if (data.merchant) setMerchant(data.merchant);
        if (data.date) setDate(data.date);
        setTab("MANUAL"); // Switch to manual tab to confirm
      }
    } catch (e) {
      alert("Failed to parse voice text");
    }
    setIsProcessing(false);
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-lg mx-auto">
      <header className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white">
          ← Kembali
        </button>
        <h1 className="text-2xl font-bold">Catat Transaksi</h1>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-800/50 p-1 rounded-xl">
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "MANUAL" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          onClick={() => setTab("MANUAL")}
        >
          ✍️ Manual
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "VOICE" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          onClick={() => setTab("VOICE")}
        >
          🎙️ Voice
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === "OCR" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          onClick={() => setTab("OCR")}
        >
          📸 Struk
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        {tab === "MANUAL" && (
          <div className="space-y-5">
            {/* Tipe Transaksi Toggle */}
            <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-700">
               <button 
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === "EXPENSE" ? "bg-red-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                onClick={() => setType("EXPENSE")}
              >
                Pengeluaran
              </button>
              <button 
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === "INCOME" ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
                onClick={() => setType("INCOME")}
              >
                Pemasukan
              </button>
            </div>

            {/* Kategori Grid */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Pilih Kategori</label>
              {categories.length === 0 ? (
                <div className="animate-pulse flex gap-2 overflow-hidden">
                  {[1,2,3,4].map(i => <div key={i} className="w-16 h-16 bg-slate-800 rounded-xl"></div>)}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {filteredCategories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCategoryId(c.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                        categoryId === c.id 
                          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
                          : "border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                      }`}
                    >
                      <span className="text-2xl mb-1">{c.icon}</span>
                      <span className="text-[10px] text-center leading-tight line-clamp-1">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Nominal (Rp)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 text-xl font-bold"
                placeholder="50000"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nama / Merchant</label>
                <input 
                  type="text" 
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
                  placeholder={type === "EXPENSE" ? "Kopi Kenangan" : "Gaji Bulanan"}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tanggal</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 css-invert-calendar"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Catatan (Opsional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 min-h-[80px]"
                placeholder="Catatan tambahan..."
              />
            </div>

            <button 
              onClick={handleManualSave}
              disabled={isProcessing}
              className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? "Menyimpan..." : "Simpan Transaksi"}
            </button>
          </div>
        )}

        {tab === "VOICE" && (
          <div className="space-y-6 text-center py-4">
            <p className="text-slate-400 text-sm mb-4">
              Ketik atau sebutkan transaksi kamu.<br/>
              Contoh: "Beli kopi kenangan 35 ribu kemarin"
            </p>
            <textarea 
              value={voiceText}
              onChange={(e) => setVoiceText(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 focus:outline-none focus:border-blue-500 min-h-[100px]"
              placeholder="Tuliskan teks atau gunakan dictation keyboard..."
            />
            <button 
              onClick={handleVoiceProcess}
              disabled={isProcessing || !voiceText}
              className="w-full py-3 bg-blue-600 disabled:bg-slate-700 disabled:text-slate-400 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              {isProcessing ? "Memproses AI..." : "🤖 Proses dengan AI"}
            </button>
          </div>
        )}

        {tab === "OCR" && (
          <div className="text-center py-6 space-y-6">
            {!isProcessing ? (
              <>
                <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-4xl shadow-lg shadow-slate-900 border border-slate-700">
                  📸
                </div>
                <div>
                  <h3 className="text-slate-200 font-bold text-lg">Scan Struk Pintar</h3>
                  <p className="text-slate-400 text-sm px-4 mt-2">
                    Simulasi unggah foto struk belanja. Sistem OCR AI akan mengekstrak total biaya dan toko secara otomatis.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    alert("Fitur Scan Struk Pintar masih dalam proses pengembangan. 🛠️");
                  }}
                  className="px-6 py-3 bg-slate-800 text-slate-400 font-bold rounded-xl shadow-lg border border-slate-700 hover:bg-slate-700 transition-all"
                >
                  🚀 Simulasikan Scan Struk
                </button>
              </>
            ) : (
              <div className="py-10 space-y-4">
                <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <h3 className="text-slate-200 font-bold text-lg animate-pulse">Memindai Struk dengan AI...</h3>
                <p className="text-slate-400 text-sm">Sedang mengekstrak Merchant dan Nominal</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
