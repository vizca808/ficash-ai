import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen relative overflow-hidden bg-fintech-bg">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-700/50 bg-slate-900/60 backdrop-blur-3xl hidden md:flex flex-col z-10 shadow-2xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold"><span className="text-gradient">Ficash</span>-AI</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all hover:translate-x-1 font-medium">
            📊 Dashboard
          </Link>
          <Link href="/transactions" className="block px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all hover:translate-x-1 font-medium">
            💸 Transaksi
          </Link>
          <Link href="/statistics" className="block px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all hover:translate-x-1 font-medium">
            📈 Statistik
          </Link>
          <Link href="/insights" className="block px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all hover:translate-x-1 font-medium relative">
            🤖 AI Insights
            <span className="absolute top-3 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></span>
          </Link>

        </nav>
        <div className="p-4 border-t border-slate-700/50">
          <Link href="/settings" className="block w-full text-left px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-all hover:translate-x-1 text-slate-400 font-medium">
            ⚙️ Pengaturan
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Nav Bottom */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full glass-card border-t border-slate-700/50 flex justify-around items-center p-3 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <Link href="/dashboard" className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
          <span className="text-lg mb-1">📊</span>
          Home
        </Link>
        <Link href="/transactions" className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
          <span className="text-lg mb-1">💸</span>
          Transaksi
        </Link>
        <Link href="/insights" className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
          <span className="text-lg mb-1 relative">
            🤖
            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse"></span>
          </span>
          AI Insights
        </Link>
        <Link href="/statistics" className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
          <span className="text-lg mb-1">📈</span>
          Statistik
        </Link>
        <Link href="/settings" className="flex flex-col items-center text-[10px] text-slate-400 hover:text-white transition-colors">
          <span className="text-lg mb-1">⚙️</span>
          Pengaturan
        </Link>
      </nav>
    </div>
  );
}
