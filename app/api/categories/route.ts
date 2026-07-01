import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { type: 'asc' },
        { sortOrder: 'asc' }
      ]
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
