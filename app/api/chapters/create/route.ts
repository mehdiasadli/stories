import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ChapterCreateSchema } from '@/lib/schemas/chapter.schema';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = ChapterCreateSchema.parse(body);
    const authorId = session.user.id;
    const slug = slugify(data.title);

    // Check if chapter with same title/slug already exists
    const existingChapter = await prisma.chapter.findUnique({
      where: { slug },
    });

    if (existingChapter) {
      return NextResponse.json({ error: 'Chapter with this title already exists' }, { status: 400 });
    }

    // Check if order already exists
    const existingOrder = await prisma.chapter.findUnique({
      where: { order: data.order },
    });

    if (existingOrder) {
      return NextResponse.json({ error: 'Chapter with this order already exists' }, { status: 400 });
    }

    // Create the chapter
    const chapter = await prisma.chapter.create({
      data: {
        ...data,
        slug,
        authorId,
      },
      select: {
        slug: true,
        title: true,
        order: true,
      },
    });

    // Revalidate relevant paths
    revalidatePath('/dashboard/chapters');
    revalidatePath('/'); // Home page that lists chapters

    return NextResponse.json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter,
    });
  } catch (error) {
    console.error('Error creating chapter:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to create chapter' }, { status: 500 });
  }
}

// Get existing chapter orders for validation
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapters = await prisma.chapter.findMany({
      select: {
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });

    const orders = chapters.map((chapter) => chapter.order);
    const nextOrder = orders.length > 0 ? Math.max(...orders) + 1 : 1;

    return NextResponse.json({
      success: true,
      data: {
        existingOrders: orders,
        nextOrder,
      },
    });
  } catch (error) {
    console.error('Error fetching chapter orders:', error);
    return NextResponse.json({ error: 'Failed to fetch chapter orders' }, { status: 500 });
  }
}
