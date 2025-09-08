import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CharacterDeleteSchema } from '@/lib/schemas/character.schema';
import { deleteImage, extractPublicIdFromUrl } from '@/lib/cloudinary';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { slug } = await params;

    // Get the request body
    const body = await request.json();
    const data = CharacterDeleteSchema.parse({ ...body, slug });

    // Find the character and check if it exists
    const existingCharacter = await prisma.character.findUnique({
      where: { slug },
      select: { name: true, profileImageUrl: true },
    });

    if (!existingCharacter) {
      return NextResponse.json({ success: false, message: 'Character not found' }, { status: 404 });
    }

    // Check if the user is the author (we need to find the author through chapters)
    const authorId = (
      await prisma.chapter.findFirst({
        select: { authorId: true },
      })
    )?.authorId;

    if (!authorId) {
      return NextResponse.json({ success: false, message: 'Author not found' }, { status: 404 });
    }

    if (authorId !== userId) {
      return NextResponse.json(
        { success: false, message: 'Only the author can delete this character' },
        { status: 403 }
      );
    }

    // Verify the character name matches
    if (existingCharacter.name !== data.name) {
      return NextResponse.json({ success: false, message: 'Character name does not match' }, { status: 400 });
    }

    // If there is a profile image, delete it from Cloudinary
    if (existingCharacter.profileImageUrl) {
      const publicId = extractPublicIdFromUrl(existingCharacter.profileImageUrl);
      if (publicId) {
        await deleteImage(publicId);
      }
    }

    // Delete the character
    await prisma.character.delete({
      where: { slug },
    });

    return NextResponse.json({ success: true, message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json({ success: false, message: 'An unexpected error occurred' }, { status: 500 });
  }
}
