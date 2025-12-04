import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const socketId = (await request.formData()).get('socket_id') as string;
    const channel = (await request.formData()).get('channel_name') as string;

    if (!socketId || !channel) {
      return new NextResponse('Missing socket_id or channel_name', { status: 400 });
    }

    // Authenticate the user for the channel
    const authResponse = pusherServer.authenticateUser(socketId, {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || 'Anonymous',
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
