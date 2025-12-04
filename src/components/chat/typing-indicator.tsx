"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { getPusherClient } from "@/lib/pusher-client";

type TypingIndicatorProps = {
  roomId: string;
  currentUserId: string;
};

type TypingPayload = {
  userId: string;
  email: string;
};

export function TypingIndicator({ roomId, currentUserId }: TypingIndicatorProps) {
  const [typers, setTypers] = useState<Record<string, string>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) {
      return;
    }

    const channelName = `room-${roomId}`;
    const channel = pusher.subscribe(channelName);

    const removeUser = (userId: string) => {
      setTypers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      const timer = timersRef.current[userId];
      if (timer) {
        clearTimeout(timer);
        delete timersRef.current[userId];
      }
    };

    const handleTyping = (payload: TypingPayload) => {
      if (payload.userId === currentUserId) {
        return;
      }

      setTypers((prev) => ({
        ...prev,
        [payload.userId]: payload.email,
      }));

      if (timersRef.current[payload.userId]) {
        clearTimeout(timersRef.current[payload.userId]);
      }

      timersRef.current[payload.userId] = setTimeout(() => {
        removeUser(payload.userId);
      }, 3000);
    };

    channel.bind("user:typing", handleTyping);

    return () => {
      channel.unbind("user:typing", handleTyping);
      pusher.unsubscribe(channelName);
      Object.values(timersRef.current).forEach(clearTimeout);
      timersRef.current = {};
      setTypers({});
    };
  }, [roomId, currentUserId]);

  const message = useMemo(() => {
    const names = Object.values(typers);
    if (names.length === 0) {
      return null;
    }

    if (names.length === 1) {
      return `${names[0]} is typing...`;
    }

    if (names.length === 2) {
      return `${names[0]} and ${names[1]} are typing...`;
    }

    return `${names.slice(0, 2).join(", ")} and others are typing...`;
  }, [typers]);

  if (!message) {
    return null;
  }

  return (
    <div className="px-4 py-2 text-sm text-white/70">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-white/70" />
        {message}
      </span>
    </div>
  );
}
