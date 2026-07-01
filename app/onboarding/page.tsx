"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [payday, setPayday] = useState("25");

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyIncome: income, savingsTarget: savings, payday })
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (e) {
      alert("Error menyimpan data");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="max-w-md w-full glass-card p-8 rounded-2xl relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-slate-700 w-full">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <h2 className="text-2xl font-bold mb-6 mt-2">
          {step === 1 && "Berapa pendapatan bulananmu?"}
          {step === 2 && "Berapa target tabunganmu?"}
          {step === 3 && "Kapan tanggal gajianmu?"}
        </h2>

        <div className="mb-8 min-h-[100px] flex items-center">
          {step === 1 && (
            <div className="w-full relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
              <input 
                type="number" 
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="0"
                autoFocus
              />
            </div>
          )}
          {step === 2 && (
            <div className="w-full relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
              <input 
                type="number" 
                value={savings}
                onChange={(e) => setSavings(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="0 (opsional)"
                autoFocus
              />
            </div>
          )}
          {step === 3 && (
            <div className="w-full">
              <input 
                type="number" 
                min="1" max="31"
                value={payday}
                onChange={(e) => setPayday(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                placeholder="Tanggal (1-31)"
                autoFocus
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
            >
              Kembali
            </button>
          )}
          <button 
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors"
          >
            {step === 3 ? "Selesai" : "Lanjut"}
          </button>
        </div>
      </div>
    </main>
  );
}
