"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import { CreateRoomForm } from "@/components/rooms/create-room-form";
import { Button } from "@/components/ui/button";
import { getPusherClient } from "@/lib/pusher-client";
import type { RoomSummary } from "@/types/room";

type RoomsSidebarProps = {
  initialRooms: RoomSummary[];
  currentUserId: string;
  email?: string;
};

type RoomNewPayload = {
  id: string;
  name: string;
  memberCount: number;
  creatorId: string;
};

type RoomMemberPayload = {
  roomId: string;
  memberCount: number;
  userId: string;
};

export function RoomsSidebar({ initialRooms, currentUserId, email }: RoomsSidebarProps) {
  const pathname = usePathname();
  const [rooms, setRooms] = useState<RoomSummary[]>(initialRooms);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe("rooms");

    const handleRoomNew = (payload: RoomNewPayload) => {
      setRooms((prev) => {
        if (prev.some((room) => room.id === payload.id)) {
          return prev;
        }

        return [
          {
            id: payload.id,
            name: payload.name,
            memberCount: payload.memberCount,
            isMember: payload.creatorId === currentUserId,
          },
          ...prev,
        ];
      });
    };

    const handleMemberJoined = (payload: RoomMemberPayload) => {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === payload.roomId
            ? {
                ...room,
                memberCount: payload.memberCount,
                isMember: room.isMember || payload.userId === currentUserId,
              }
            : room,
        ),
      );
    };

    channel.bind("room:new", handleRoomNew);
    channel.bind("room:member-joined", handleMemberJoined);

    return () => {
      channel.unbind("room:new", handleRoomNew);
      channel.unbind("room:member-joined", handleMemberJoined);
      pusher.unsubscribe("rooms");
    };
  }, [currentUserId]);

  return (
    <aside className="flex w-80 flex-col border-r border-white/10 bg-slate-950/70 px-4 py-6 backdrop-blur">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-white/50">Logged in as</p>
        <p className="truncate text-lg font-semibold text-white">{email ?? "Anonymous"}</p>
        <Button variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
          Sign out
        </Button>
      </div>

      <div className="my-6 h-px bg-white/10" />

      <CreateRoomForm />

      <div className="my-6 h-px bg-white/10" />

      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        <p className="text-xs uppercase tracking-wide text-white/50">Rooms</p>
        {rooms.length === 0 ? (
          <p className="text-sm text-white/60">No rooms yet. Create one above!</p>
        ) : (
          <ul className="space-y-2">
            {rooms.map((room) => {
              const isActive = pathname?.startsWith(`/rooms/${room.id}`);
              return (
                <li key={room.id}>
                  <Link
                    href={`/rooms/${room.id}`}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition hover:border-white/50 ${
                      isActive ? "border-white bg-white/10" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-white">{room.name}</p>
                      <p className="text-xs text-white/60">
                        {room.memberCount} member{room.memberCount === 1 ? "" : "s"}
                        {!room.isMember ? " • join to chat" : ""}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
