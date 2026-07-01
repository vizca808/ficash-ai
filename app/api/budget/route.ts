import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
       return NextResponse.json({ error: 'Month and year required' }, { status: 400 });
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.userId,
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        category: true,
      }
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { categoryId, monthlyLimit, month, year } = body;

    if (!categoryId || monthlyLimit === undefined || !month || !year) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert budget to handle updates easily if the user just changes the amount
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId: session.userId,
          categoryId,
          month: parseInt(month),
          year: parseInt(year)
        }
      },
      update: {
        monthlyLimit: parseInt(monthlyLimit)
      },
      create: {
        userId: session.userId,
        categoryId,
        monthlyLimit: parseInt(monthlyLimit),
        month: parseInt(month),
        year: parseInt(year)
      }
    });

    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
