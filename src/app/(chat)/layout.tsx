import { redirect } from "next/navigation";

import { getRoomSummaries } from "@/lib/rooms";
import { getAuthSession } from "@/lib/auth";
import { RoomsSidebar } from "@/components/sidebar/rooms-sidebar";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  const rooms = await getRoomSummaries(session.user.id);

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <RoomsSidebar
        initialRooms={rooms}
        currentUserId={session.user.id}
        email={session.user.email ?? undefined}
      />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
