import { prisma } from "@/lib/prisma";
import type { RoomSummary } from "@/types/room";

export async function getRoomSummaries(userId: string): Promise<RoomSummary[]> {
  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true } },
      users: {
        where: { id: userId },
        select: { id: true },
      },
    },
  });

  return rooms.map((room: any) => ({
    id: room.id,
    name: room.name,
    memberCount: room._count.users,
    isMember: room.users.length > 0,
  }));
}

export async function getRoomWithMembership(roomId: string, userId: string) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      users: {
        where: { id: userId },
        select: { id: true },
      },
      _count: { select: { users: true } },
    },
  });
}
