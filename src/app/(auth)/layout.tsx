import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Socialiser | Auth",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-indigo-500/20">
          {children}
        </div>
      </div>
    </div>
  );
}
