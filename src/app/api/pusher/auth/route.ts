// src/app/api/pusher/auth/route.ts
// For now we are only using public Pusher channels (no private/presence),
// so this auth endpoint is not required. We keep a minimal stub so the
// route exists but does nothing sensitive if called.

import { NextResponse } from 'next/server';

export async function POST() {
  return new NextResponse('Pusher auth not used for public channels', {
    status: 501,
  });
}