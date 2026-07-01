import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { monthlyIncome, savingsTarget, payday } = await req.json();

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        monthlyIncome: parseInt(monthlyIncome) || 0,
        savingsTarget: parseInt(savingsTarget) || 0,
        payday: parseInt(payday) || 1,
        onboardingDone: true,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
