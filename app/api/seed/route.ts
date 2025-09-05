import { seed } from '@/seed';
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse('Not allowed', { status: 403 });
  }

  try {
    await seed();
  } catch (error) {
    console.error(error);
    return new NextResponse(error instanceof Error ? error.message : 'Error seeding database', { status: 500 });
  }

  return NextResponse.json({ message: 'Seed completed' });
}
