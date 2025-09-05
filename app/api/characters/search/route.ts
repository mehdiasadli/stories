import { NextRequest, NextResponse } from 'next/server';
import { searchCharacters } from '@/lib/fetchers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q) {
      return NextResponse.json([]);
    }

    const results = await searchCharacters(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching characters:', error);
    return NextResponse.json([], { status: 500 });
  }
}
