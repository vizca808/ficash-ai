import { NextResponse } from 'next/server';
import { parseTransactionText } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, currentDateStr } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const parsedData = await parseTransactionText(text, currentDateStr || new Date().toISOString().split('T')[0]);

    if (!parsedData) {
      return NextResponse.json({ error: "Failed to parse transaction" }, { status: 500 });
    }

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
