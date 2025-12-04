// src/app/api/pusher/auth/route.ts
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const socketId = formData.get('socket_id') as string;
    const channel = formData.get('channel_name') as string;

    if (!socketId || !channel) {
      return new NextResponse('Missing socket_id or channel_name', { status: 400 });
    }

    // Check if pusherServer is initialized
    if (!pusherServer) {
      console.error('Pusher server not initialized - check environment variables');
      return new NextResponse('Server configuration error', { status: 500 });
    }

    // TypeScript now knows pusherServer is not null here
    const authResponse = (pusherServer as any).authenticateUser(socketId, {
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