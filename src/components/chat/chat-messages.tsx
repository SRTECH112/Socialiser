"use client";

import { useEffect, useRef, useState } from "react";

import { getPusherClient } from "@/lib/pusher-client";
import type { ChatMessage } from "@/types/chat";

type ChatMessagesProps = {
  roomId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
};

type MessagePayload = ChatMessage;

export function ChatMessages({ roomId, currentUserId, initialMessages }: ChatMessagesProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) {
      return;
    }

    const channelName = `room-${roomId}`;
    const channel = pusher.subscribe(channelName);

    const handleNewMessage = (payload: MessagePayload) => {
      setMessages((prev) => {
        if (prev.some((message) => message.id === payload.id)) {
          return prev;
        }
        return [...prev, payload];
      });
    };

    channel.bind("message:new", handleNewMessage);

    return () => {
      channel.unbind("message:new", handleNewMessage);
      pusher.unsubscribe(channelName);
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto px-4 py-6">
      {messages.map((message) => {
        const isSelf = message.user.id === currentUserId;
        const timeLabel = new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        return (
          <div key={message.id} className={`flex w-full ${isSelf ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-lg ${
                isSelf ? "bg-indigo-500 text-white" : "bg-white/10 text-white"
              }`}
            >
              {!isSelf ? <p className="text-xs font-medium text-white/80">{message.user.email}</p> : null}
              <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">{message.text}</p>
              <p className={`mt-1 text-[11px] ${isSelf ? "text-white/80" : "text-white/60"}`}>{timeLabel}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
