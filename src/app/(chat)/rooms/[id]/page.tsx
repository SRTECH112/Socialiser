import { redirect } from "next/navigation";

import { getRoomMessages } from "@/actions/chat";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MessageInput } from "@/components/chat/message-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { JoinRoomButton } from "@/components/rooms/join-room-button";
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
            <p className="text-sm text-white/70">{room._count.users} member{room._count.users === 1 ? "" : "s"}</p>
          </div>
          {!isMember ? <JoinRoomButton roomId={room.id} /> : null}
        </div>
      </header>

      <section className="flex-1 overflow-hidden">
        {isMember ? (
          <>
            <div className="h-full overflow-hidden">
              <ChatMessages roomId={room.id} currentUserId={session.user.id} initialMessages={messages} />
            </div>
            <TypingIndicator roomId={room.id} currentUserId={session.user.id} />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white/80">
            <p>You need to join this room to see its messages.</p>
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 bg-slate-950/70 px-6 py-4">
        <MessageInput roomId={room.id} disabled={!isMember} />
      </footer>
    </div>
  );
}
