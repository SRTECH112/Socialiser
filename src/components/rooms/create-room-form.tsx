"use client";

import { useActionState, useEffect, useRef } from "react";

import { createRoom } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RoomActionState } from "@/types/actions";

const initialState: RoomActionState = {};

export function CreateRoomForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createRoom, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <label className="text-xs uppercase tracking-wide text-white/60" htmlFor="name">
          New Room
        </label>
        <Input
          id="name"
          name="name"
          placeholder="Give it a name"
          minLength={3}
          maxLength={50}
          required
        />
      </div>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        Create Room
      </Button>
    </form>
  );
}
