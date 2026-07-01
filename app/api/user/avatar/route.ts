import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/session';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save locally to public/uploads
    const ext = file.name.split('.').pop() || 'png';
    const fileName = `avatar-${session.userId}-${Date.now()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists (we can just write, but it might fail if uploads dir doesn't exist. I'll create it via shell script later if needed, but in nextjs usually we can just create it using fs.mkdir, but fs/promises is imported)
    try {
      await import('fs/promises').then(m => m.mkdir(uploadDir, { recursive: true }));
    } catch (e) {}

    const path = join(uploadDir, fileName);
    await writeFile(path, buffer);

    const avatarUrl = `/uploads/${fileName}`;

    // Update User
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: { avatar: avatarUrl }
    });

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
