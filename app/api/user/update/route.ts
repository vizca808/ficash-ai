import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, payday } = await req.json();

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name,
        payday: parseInt(payday, 10),
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
