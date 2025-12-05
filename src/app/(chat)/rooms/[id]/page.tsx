import { redirect } from "next/navigation";

import { getRoomMessages } from "@/actions/chat";
import { ChatRoomClient } from "@/components/chat/chat-room-client";
import { getAuthSession } from "@/lib/auth";
import { getRoomWithMembership } from "@/lib/rooms";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomDetailPage({ params }: RoomPageProps) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const room = await getRoomWithMembership(id, session.user.id);
  if (!room) {
    redirect("/rooms");
  }

  const isMember = room.users.length > 0;
  const messages = isMember ? await getRoomMessages(id) : [];

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Room</p>
            <h1 className="text-2xl font-semibold">{room.name}</h1>
            <p className="text-sm text-white/70">
              {room._count.users} member{room._count.users === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </header>

      <ChatRoomClient 
        roomId={room.id}
        currentUserId={session.user.id}
        isMember={isMember}
        initialMessages={messages}
      />
    </div>
  );
}
