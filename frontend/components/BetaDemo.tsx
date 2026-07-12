"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  Sparkles,
  Shield,
  Target,
  Loader2,
} from "lucide-react";

const betaFeatures = [
  {
    icon: Target,
    title: "Habit Tracking",
    description: "Create and track 5 daily habits with streak counters and progress bars.",
  },
  {
    icon: Zap,
    title: "Savings Goals",
    description: "Set savings targets with visual progress — interest rates coming for Tier 3.",
  },
  {
    icon: Sparkles,
    title: "Gamified Pets",
    description: "Collect common pets as you build streaks. Rare pets unlock at Tier 3.",
  },
  {
    icon: Shield,
    title: "Tier Progression",
    description: "Start as Tier 1 (student). Verify to Tier 2. Go premium at Tier 3.",
  },
];

export default function BetaDemo() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulate submission — in production connect to a real endpoint
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <section className="relative w-full py-28 overflow-hidden" id="beta">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 30% 50%, rgba(89,225,132,0.06) 0%, transparent 70%), radial-gradient(ellipse 70% 40% at 70% 50%, rgba(152,37,152,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border"
            style={{
              color: "#59E184",
              borderColor: "rgba(89,225,132,0.35)",
              background: "rgba(89,225,132,0.07)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-[#59E184] animate-pulse" />
            Beta testing phase
          </span>
          <h2 className="text-5xl font-black text-foreground leading-tight">
            Try the{" "}
            <span className="text-primary">beta</span> today
          </h2>
          <p className="mt-4 text-foreground/50 text-lg max-w-2xl mx-auto">
            Qscribe is currently in open beta. Sign up free to access Tier 1 features
            and help shape the platform with your feedback.
          </p>
        </div>

        {/* Beta demo preview */}
        <div className="max-w-5xl mx-auto mb-16">
          {/* Interactive demo preview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {betaFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-foreground/10 p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] group"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-[#982598]/20"
                    style={{ background: "rgba(152,37,152,0.1)" }}
                  >
                    <Icon size={20} style={{ color: "#982598" }} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* What's currently available */}
          <div
            className="rounded-3xl border p-8 backdrop-blur-md"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(89,225,132,0.15)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left side — mock timeline / demo screenshot */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground">
                  What you get in the beta
                </h3>
                <ul className="space-y-3">
                  {[
                    "Full Tier 1 access (habits, savings, pets)",
                    "Progress toward Tier 2 verification",
                    "Dashboard to track your stats",
                    "Priority feedback channel",
                    "Beta user badge on your profile",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/70">
                      <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: "#59E184" }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4">
                  <Link href="/signup">
                    <Button
                      className="rounded-full px-8 font-semibold uppercase tracking-wide shadow-lg hover:scale-105 transition-transform"
                      style={{ background: "#982598" }}
                    >
                      Start Beta
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right side — waitlist */}

              {!submitted ? (
                <form
                  onSubmit={handleWaitlistSubmit}
                  className="rounded-2xl border border-foreground/10 p-6 backdrop-blur-sm"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <h4 className="text-sm font-bold text-foreground mb-1">
                    Join the waitlist for updates
                  </h4>
                  <p className="text-xs text-foreground/50 mb-4">
                    Get notified about new tiers, features, and beta events.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="flex-1 rounded-xl border border-foreground/10 bg-foreground/5 px-4 py-2.5 text-sm text-foreground placeholder-foreground/30 outline-none focus:border-[#982598]/40 focus:ring-1 focus:ring-[#982598]/40 transition-all"
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl px-5 font-medium transition-all hover:scale-105"
                      style={{ background: "#982598" }}
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        "Join"
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div
                  className="rounded-2xl border border-[#59E184]/30 p-6 backdrop-blur-sm text-center"
                  style={{ background: "rgba(89,225,132,0.05)" }}
                >
                  <CheckCircle2 size={32} className="mx-auto mb-2" style={{ color: "#59E184" }} />
                  <h4 className="text-sm font-bold text-foreground">You&apos;re on the list!</h4>
                  <p className="text-xs text-foreground/50 mt-1">
                    We&apos;ll keep you posted on new features and updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Beta disclaimer */}
        <div className="text-center">
          <p className="text-xs text-foreground/30 max-w-lg mx-auto">
            Qscribe is currently in beta. Features, pricing, and availability are subject to change.
            Your feedback during this phase helps us build a better platform for everyone.
          </p>
        </div>
      </div>
    </section>
  );
}
