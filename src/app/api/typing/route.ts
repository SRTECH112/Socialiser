import { NextResponse } from "next/server";

import { broadcastTyping } from "@/actions/chat";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await broadcastTyping(body?.roomId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Typing API error", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
