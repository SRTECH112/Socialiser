'use client';

import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";
import { TypingIndicator } from "./typing-indicator";
import { JoinRoomButton } from "../rooms/join-room-button";
import { PusherDebug } from "../debug/pusher-debug";

type ChatRoomClientProps = {
  roomId: string;
  currentUserId: string;
  isMember: boolean;
  initialMessages: any[];
};

export function ChatRoomClient({ roomId, currentUserId, isMember, initialMessages }: ChatRoomClientProps) {
  return (
    <div className="flex h-full flex-col">
      <PusherDebug roomId={roomId} />
      
      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessages 
          roomId={roomId} 
          currentUserId={currentUserId} 
          initialMessages={initialMessages} 
        />
      </div>

      <div className="border-t p-4">
        {isMember ? (
          <>
            <TypingIndicator roomId={roomId} currentUserId={currentUserId} />
            <MessageInput roomId={roomId} disabled={!isMember} />
          </>
        ) : (
          <JoinRoomButton roomId={roomId} />
        )}
      </div>
    </div>
  );
}
