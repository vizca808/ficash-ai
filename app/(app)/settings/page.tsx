import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6 pb-20 md:pb-0 max-w-2xl mx-auto">
      <header>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-slate-400">Kelola profil dan preferensi keuanganmu.</p>
      </header>

      <SettingsForm user={user} />
    </div>
  );
}
