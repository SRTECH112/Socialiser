"use client";

import { useCallback, useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { sendMessage } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageActionState } from "@/types/actions";

const initialState: MessageActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="px-4" disabled={pending}>
      {pending ? "Sending..." : "Send"}
    </Button>
  );
}

export function MessageInput({ roomId, disabled }: { roomId: string; disabled?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const typingCooldown = useRef<NodeJS.Timeout | null>(null);
  const [state, formAction] = useFormState(sendMessage, initialState);

  useEffect(() => {
    if (state.successId) {
      formRef.current?.reset();
    }
  }, [state.successId]);

  const notifyTyping = useCallback(() => {
    if (typingCooldown.current) {
      return;
    }

    typingCooldown.current = setTimeout(() => {
      typingCooldown.current = null;
    }, 2500);

    fetch("/api/typing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
    }).catch(() => null);
  }, [roomId]);

  const handleChange = () => {
    notifyTyping();
  };

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-3" autoComplete="off">
      <input name="roomId" value={roomId} hidden readOnly />
      <Input
        name="text"
        placeholder={disabled ? "Join this room to chat" : "Type a message"}
        onChange={handleChange}
        disabled={disabled}
        maxLength={500}
      />
      <SubmitButton />
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
    </form>
  );
}
