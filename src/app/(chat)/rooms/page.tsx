import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

export default async function RoomsHomePage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-slate-900 text-center text-white">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Welcome</p>
        <h1 className="text-4xl font-semibold">Pick a room from the left</h1>
        <p className="text-white/70">
          Create a new chat room or select an existing one to start messaging instantly.
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
        Tip: Rooms update in real-time. Invite teammates to keep the conversation flowing.
      </div>
    </div>
  );
}
