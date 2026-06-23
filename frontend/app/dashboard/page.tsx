"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout, type User } from "@/lib/api";
import { LogOut, Zap } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
    } else {
      setUser(u);
    }
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!user) return null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-6">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(89,225,132,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-md">
        {/* Avatar placeholder */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-black bg-primary"
        >
          {user.first_name?.[0]?.toUpperCase() ?? user.username[0].toUpperCase()}
        </div>

        <div>
          <h1 className="text-3xl font-black text-foreground">
            Welcome, {user.first_name || user.username}!
          </h1>
          <p className="mt-1 text-foreground/50 text-sm">@{user.username} · Tier {user.tier}</p>
        </div>

        <div
          className="flex items-center gap-3 rounded-2xl border border-[##982598]/20 px-6 py-4 bg-primary/10"
        >
          <Zap size={20} className="text-primary" />
          <p className="text-sm text-foreground/70">
            Your dashboard is being built. Stay tuned!
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-foreground/40 hover:text-red-400 transition-colors mt-2"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </main>
  );
}
