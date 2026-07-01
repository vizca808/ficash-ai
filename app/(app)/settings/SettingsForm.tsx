"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ user }: { user: any }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [payday, setPayday] = useState(user.payday.toString());
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  
  const [loading, setLoading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Foto profil berhasil diperbarui!");
        router.refresh();
      } else {
        alert("Gagal mengunggah foto profil");
        setAvatarPreview(user.avatar);
      }
    } catch (err) {
      alert("Error mengunggah foto profil");
      setAvatarPreview(user.avatar);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, payday }),
      });
      if (res.ok) {
        alert("Pengaturan berhasil disimpan");
        router.refresh();
      } else {
        alert("Gagal menyimpan");
      }
    } catch (e) {
      alert("Error saving settings");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Profil */}
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg border-b border-slate-700 pb-2">Profil</h2>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold border-2 border-slate-700 overflow-hidden shadow-lg group">
            {avatarPreview ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-sm">
              Ubah
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={loading} />
            </label>
          </div>
          <p className="text-xs text-slate-400">Klik foto untuk mengubah</p>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input 
            type="email" 
            disabled
            value={user.email}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 px-4 text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">Email tidak dapat diubah (MVP).</p>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">Nama Panggilan</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
          />
        </div>
      </section>

      {/* Keuangan */}
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg border-b border-slate-700 pb-2">Pengaturan Siklus</h2>
        
        <div>
          <label className="block text-sm text-slate-400 mb-1">Tanggal Gajian</label>
          <input 
            type="number" 
            min="1" max="31"
            value={payday}
            onChange={(e) => setPayday(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
          />
        </div>
      </section>

      {/* Tampilan (Tema) */}
      <section className="glass-card p-6 rounded-2xl space-y-4">
        <h2 className="font-semibold text-lg border-b border-slate-700 pb-2">Tampilan Warna</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              document.documentElement.removeAttribute("data-theme");
              localStorage.setItem("theme", "slate");
            }}
            className="w-12 h-12 rounded-full bg-slate-900 border-2 border-slate-500 hover:scale-110 transition-transform"
            title="Slate (Default)"
          ></button>
          <button 
            onClick={() => {
              document.documentElement.setAttribute("data-theme", "emerald");
              localStorage.setItem("theme", "emerald");
            }}
            className="w-12 h-12 rounded-full bg-emerald-900 border-2 border-emerald-500 hover:scale-110 transition-transform"
            title="Emerald"
          ></button>
          <button 
            onClick={() => {
              document.documentElement.setAttribute("data-theme", "purple");
              localStorage.setItem("theme", "purple");
            }}
            className="w-12 h-12 rounded-full bg-indigo-900 border-2 border-indigo-500 hover:scale-110 transition-transform"
            title="Purple"
          ></button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Pilih warna latar belakang favoritmu.</p>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
