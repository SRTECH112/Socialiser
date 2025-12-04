"use client";

import { useEffect } from "react";
import { getPusherClient } from "@/lib/pusher-client";

export function PusherDebug({ roomId }: { roomId: string }) {
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) {
      console.error("Pusher client not initialized");
      return;
    }

    console.log("Pusher client initialized", pusher);

    const channel = pusher.subscribe(`room-${roomId}`);
    console.log(`Subscribed to room-${roomId}`);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Successfully subscribed to channel");
    });

    channel.bind("message:new", (data: any) => {
      console.log("New message received:", data);
    });

    channel.bind("pusher:subscription_error", (error: any) => {
      console.error("Pusher subscription error:", error);
    });

    return () => {
      console.log("Unsubscribing from channel");
      channel.unbind_all();
      pusher.unsubscribe(`room-${roomId}`);
    };
  }, [roomId]);

  return null;
}
