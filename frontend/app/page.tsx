import { Button } from "@/components/ui/button"
import HowItWorks from "@/components/HowItWorks"
import BetaDemo from "@/components/BetaDemo"
import HeroBackground from "@/components/HeroBackground"
import Link from "next/link"

const Home = () => {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex items-center">
        {/* Animated background (blobs + particle network) */}
        <HeroBackground />

        {/* Foreground content sits above the background (z-10) */}
        <div className="container mx-auto relative z-10 px-6">
          <div className="flex flex-col xl:flex-row items-center gap-16 pt-32 pb-24">

            {/* Text block */}
            <div className="order-2 xl:order-none max-w-2xl">

              {/* Eyebrow badge - Beta live */}
              <span
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full border"
                style={{
                  color: "#E159A2",
                  borderColor: "rgba(225,89,162,0.35)",
                  background: "rgba(225,89,162,0.07)",
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#E159A2] animate-pulse" />
                Beta is live — try it now
              </span>

              <h1 className="text-[clamp(4rem,10vw,8rem)] font-black leading-none mb-6 tracking-tight">
                <span className="text-foreground">Q</span>
                <span className="text-primary">SCRIBE</span>
              </h1>

              <p className="max-w-[480px] mb-10 text-foreground/55 text-lg leading-relaxed">
                Track habits, set savings goals, and unlock gamified pets as you level up.
                A tiered platform for students and young adults — from simple routines to
                premium perks.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-3 mb-10">
                {[
                  { label: "Habit Tracker", color: "#982598" },
                  { label: "Savings Goals", color: "#59E184" },
                  { label: "Gamified Pets", color: "#FFCF95" },
                  { label: "3-Tier System", color: "#E159A2" },
                ].map((feat) => (
                  <span
                    key={feat.label}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-sm"
                    style={{
                      color: feat.color,
                      borderColor: `${feat.color}40`,
                      background: `${feat.color}10`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: feat.color }} />
                    {feat.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="rounded-full px-8 font-semibold uppercase tracking-wide shadow-lg hover:scale-105 transition-transform bg-secondary text-primary-foreground"
                  >
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/beta">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full px-8 font-semibold uppercase tracking-wide border-foreground/20 text-foreground/80 hover:text-foreground hover:border-foreground/50 transition-all"
                  >
                    Join Beta
                  </Button>
                </Link>
              </div>

              {/* Floating stat chips */}
              <div className="flex flex-wrap gap-6 mt-14">
                {[
                  { value: "500+", label: "Beta users" },
                  { value: "3 Tiers", label: "Progression" },
                  { value: "4.9 ★", label: "User rating" },
                ].map((stat, idx) => (
                  <div key={stat.label} className={`flex flex-col animate-fade-in-up delay-${idx + 1}`}>
                    <span className="text-2xl font-black text-primary">
                      {stat.value}
                    </span>
                    <span className="text-xs text-foreground/40 uppercase tracking-widest">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual panel — glowing mock card with REAL features */}
            <div className="order-1 xl:order-none flex-1 flex justify-center xl:justify-end">
              <div
                className="relative w-full max-w-sm rounded-3xl border border-foreground/10 p-8 backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "0 0 80px rgba(89,225,132,0.12), inset 0 0 40px rgba(89,225,132,0.04)",
                }}
              >
                {/* Tier badge */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-xs text-foreground/30 uppercase tracking-widest">
                    Today&apos;s progress
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#982598]/20 text-[#982598]">
                    Tier 1
                  </span>
                </div>

                {/* Habits section */}
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-3">
                  Habits
                </p>
                {[
                  { label: "Morning run", done: true, pct: 100 },
                  { label: "Deep work block", done: true, pct: 100 },
                  { label: "Evening journal", done: false, pct: 60 },
                ].map((h) => (
                  <div key={h.label} className="mb-3 last:mb-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground/80">{h.label}</span>
                      <span
                        className={`text-xs font-bold ${h.done ? "text-primary" : "text-foreground/30"}`}
                      >
                        {h.done ? "✓ Done" : `${h.pct}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-foreground/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${h.pct}%`,
                          background: h.done
                            ? "#982598"
                            : "linear-gradient(to right, #982598aa, #98259855)",
                        }}
                      />
                    </div>
                  </div>
                ))}

                {/* Divider */}
                <div className="my-4 border-t border-foreground/5" />

                {/* Savings goal mini */}
                <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground/40 mb-3">
                  Savings Goal
                </p>
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-foreground/80">New Laptop</span>
                    <span className="text-xs text-foreground/50">₦150k / ₦500k</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-foreground/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "30%",
                        background: "linear-gradient(to right, #FFCF95, #59E184)",
                      }}
                    />
                  </div>
                </div>

                {/* Streak + Pet badge */}
                <div className="mt-5 flex items-center gap-3 rounded-2xl p-4 border border-secondary/20 bg-secondary/10 transition-all duration-200 hover:border-secondary/40 hover:bg-secondary/15 card-hover">
                  <span className="text-3xl">🔥</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">14-day streak</p>
                    <p className="text-xs text-foreground/40">Keep it up — unlock a rare pet at Tier 3!</p>
                  </div>
                  <span className="text-2xl">🐾</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade into page */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[5] bg-gradient-to-b from-transparent to-background"
        />
      </section>

      {/* ── How it works ─────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Beta / Demo section ──────────────────────────────────── */}
      <BetaDemo />
    </>
  )
}

export default Home
