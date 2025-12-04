"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import type { ChatMessage } from "@/types/chat";
import type { MessageActionState, RoomActionState } from "@/types/actions";

type MessageWithUser = {
  id: string;
  text: string;
  createdAt: Date;
  roomId: string;
  user: {
    id: string;
    email: string;
  };
};

const createRoomSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters").max(50),
});

const typingSchema = z.object({
  roomId: z.string().min(1),
});

export async function createRoom(
  _prevState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const parseResult = createRoomSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0]?.message ?? "Invalid input" };
  }

  const room = await prisma.room.create({
    data: {
      name: parseResult.data.name,
      users: {
        connect: { id: session.user.id },
      },
    },
  });

  if (pusherServer) {
    await pusherServer.trigger("rooms", "room:new", {
      id: room.id,
      name: room.name,
      memberCount: 1,
      creatorId: session.user.id,
    });
  }

  revalidatePath("/rooms", "layout");
  return { success: "Room created" };
}

const sendMessageSchema = z.object({
  roomId: z.string().min(1),
  text: z.string().min(1, "Message cannot be empty").max(500),
});

export async function sendMessage(
  _prevState: MessageActionState,
  formData: FormData,
): Promise<MessageActionState> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: "You must be signed in to send messages." };
  }

  const parseResult = sendMessageSchema.safeParse({
    roomId: formData.get("roomId"),
    text: formData.get("text"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0]?.message ?? "Invalid input" };
  }

  const { roomId, text } = parseResult.data;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, users: { select: { id: true } } },
  });

  if (!room) {
    return { error: "Room not found." };
  }

  const isMember = room.users.some((user: { id: string }) => user.id === session.user!.id);

  if (!isMember) {
    return { error: "Join the room before sending messages." };
  }

  const message = await prisma.message.create({
    data: {
      text,
      roomId,
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  });

  if (pusherServer) {
    await pusherServer.trigger(`room-${roomId}`, "message:new", {
      id: message.id,
      text: message.text,
      createdAt: message.createdAt.toISOString(),
      roomId,
      user: {
        id: message.user.id,
        email: message.user.email,
      },
    });
  }

  revalidatePath(`/rooms/${roomId}`);
  return { successId: message.id };
}

export async function getRoomMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
  const messages = await prisma.message.findMany({
    where: { roomId },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return messages.reverse().map((message: MessageWithUser): ChatMessage => ({
    id: message.id,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
    roomId: message.roomId,
    user: {
      id: message.user.id,
      email: message.user.email,
    },
  }));
}

export async function broadcastTyping(roomId: string) {
  const parsed = typingSchema.safeParse({ roomId });
  if (!parsed.success) {
    return;
  }

  const session = await getAuthSession();
  if (!session?.user?.id || !pusherServer) {
    return;
  }

  await pusherServer.trigger(`room-${parsed.data.roomId}`, "user:typing", {
    userId: session.user.id,
    email: session.user.email ?? "Someone",
  });
}

export async function joinRoom(
  _prevState: RoomActionState,
  formData: FormData,
): Promise<RoomActionState> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { error: "You must be signed in." };
  }

  const roomId = formData.get("roomId");
  if (typeof roomId !== "string") {
    return { error: "Invalid room." };
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true },
  });

  if (!room) {
    return { error: "Room not found." };
  }

  const alreadyMember = await prisma.room.findFirst({
    where: {
      id: roomId,
      users: {
        some: { id: session.user.id },
      },
    },
    select: { id: true },
  });

  if (alreadyMember) {
    return { success: "You're already in this room." };
  }

  await prisma.room.update({
    where: { id: roomId },
    data: {
      users: {
        connect: { id: session.user.id },
      },
    },
  });

  const memberCountResult = await prisma.room.findUnique({
    where: { id: roomId },
    select: { _count: { select: { users: true } } },
  });

  const memberCount = memberCountResult?._count.users ?? 0;

  if (pusherServer) {
    await pusherServer.trigger("rooms", "room:member-joined", {
      roomId,
      memberCount,
      userId: session.user.id,
    });
  }

  revalidatePath(`/rooms/${roomId}`);
  revalidatePath("/rooms", "layout");
  return { success: "Joined room" };
}
