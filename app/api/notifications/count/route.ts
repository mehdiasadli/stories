import { auth } from '@/lib/auth';
import { getNotificationsCount } from '@/lib/fetchers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await getNotificationsCount(session.user.id, 'unread');

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
