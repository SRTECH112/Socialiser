"use client";

import { useFormState, useFormStatus } from "react-dom";

import { joinRoom } from "@/actions/chat";
import { Button } from "@/components/ui/button";
import type { RoomActionState } from "@/types/actions";

const initialState: RoomActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Joining..." : "Join room"}
    </Button>
  );
}

export function JoinRoomButton({ roomId }: { roomId: string }) {
  const [state, formAction] = useFormState(joinRoom, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="roomId" value={roomId} readOnly />
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
      <SubmitButton />
    </form>
  );
}
