import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body as { id?: string };
    if (!id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    await prisma.notification.update({ where: { id }, data: { read: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
