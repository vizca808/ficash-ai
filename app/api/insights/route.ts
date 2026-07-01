import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ambil transaksi 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTx = await prisma.transaction.findMany({
      where: { 
        userId: user.id,
        date: { gte: thirtyDaysAgo }
      },
      include: { category: true }
    });

    const expenses = recentTx.filter(t => t.type === 'EXPENSE');
    const income = recentTx.filter(t => t.type === 'INCOME');
    
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      if (t.category) {
        categoryTotals[t.category.name] = (categoryTotals[t.category.name] || 0) + t.amount;
      }
    });
    
    let biggestCategory = "Tidak Diketahui";
    let biggestAmount = 0;
    
    Object.entries(categoryTotals).forEach(([name, amount]) => {
      if (amount > biggestAmount) {
        biggestAmount = amount;
        biggestCategory = name;
      }
    });
    
    let content = "";
    const isDeficit = totalSpent > totalIncome && totalIncome > 0;
    
    // Unified Smart Assistant Persona
    if (expenses.length === 0) {
      content = "Hmm, data pengeluaranmu masih kosong. Entah kamu memang hemat banget bulan ini atau kamu lupa mencatat. Yuk mulai catat pengeluaran harianmu agar saya bisa bantu atur cash flow-mu! ✨";
    } else if (isDeficit) {
      content = `Berdasarkan data 30 hari terakhir, saya harus ngingetin nih: Pemasukanmu Rp ${totalIncome.toLocaleString('id-ID')}, tapi pengeluaranmu tembus Rp ${totalSpent.toLocaleString('id-ID')}! 🤦‍♂️\n\nBocor paling parah ada di kategori "${biggestCategory}" dengan total Rp ${biggestAmount.toLocaleString('id-ID')}. Ayo kurangi jajan di kategori ini ya! Status arus kasmu sekarang sedang DEFISIT. Ngerem dikit pengeluarannya biar nggak keteteran di akhir bulan! 💚`;
    } else {
      content = `Berdasarkan analisis 30 hari terakhir, pengelolaan keuanganmu sudah masuk kategori SEHAT! ✨\n\nPemasukan (Rp ${totalIncome.toLocaleString('id-ID')}) sukses menutup pengeluaran (Rp ${totalSpent.toLocaleString('id-ID')}). Pengeluaran terbesarmu saat ini ada di "${biggestCategory}" (Rp ${biggestAmount.toLocaleString('id-ID')}). Tetap pertahankan ya, dan jangan tergoda *checkout* keranjang belanja kalau nggak butuh-butuh banget! 🚀`;
    }

    const insight = await prisma.aiInsight.create({
      data: {
        userId: user.id,
        type: 'WEEKLY_REVIEW',
        title: 'Analisis Keuangan Pintar',
        content: content,
        severity: isDeficit ? 'WARNING' : 'INFO',
      }
    });

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Insights API Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const insights = await prisma.aiInsight.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({ insights });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Verify ownership
    const insight = await prisma.aiInsight.findUnique({
      where: { id }
    });

    if (!insight || insight.userId !== session.userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.aiInsight.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
