import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, merchant, description, date, categoryId, type } = await req.json();

    if (!amount || !categoryId || !date) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const tx = await prisma.transaction.create({
      data: {
        userId: session.userId,
        amount: Number(amount),
        merchant,
        description,
        categoryId,
        type: type || 'EXPENSE',
        date: new Date(date),
        source: 'MANUAL',
      }
    });

    return NextResponse.json(tx);
  } catch (error) {
    console.error("Create Tx Error:", error);
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
    const id = url.searchParams.get('id');

    if (id === 'all') {
      await prisma.transaction.deleteMany({
        where: { userId: session.userId }
      });
    } else if (id) {
      await prisma.transaction.delete({
        where: { id, userId: session.userId }
      });
    } else {
      return NextResponse.json({ error: 'Missing transaction id' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Tx Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
