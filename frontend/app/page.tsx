
import { Button } from "@/components/ui/button"
import HowItWorks from "@/components/HowItWorks"
import HeroBackground from "@/components/HeroBackground"

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

              {/* Eyebrow badge */}
              <span
                className="inline-block text-xs font-bold uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full border"
                style={{
                  color: "#E159A2",
                  borderColor: "rgba(225,89,162,0.35)",
                  background: "rgba(225,89,162,0.07)",
                }}
              >
                Coming soon
              </span>

              <h1 className="text-[clamp(4rem,10vw,8rem)] font-black leading-none mb-6 tracking-tight">
                <span className="text-foreground">Q</span>
                <span className="text-primary">SCRIBE</span>
              </h1>

              <p className="max-w-[480px] mb-10 text-foreground/55 text-lg leading-relaxed">
                Build lasting habits, track your goals, and unlock AI-powered
                insights — all in one beautiful workspace.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full px-8 font-semibold uppercase tracking-wide shadow-lg hover:scale-105 transition-transform bg-secondary text-primary-foreground"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 font-semibold uppercase tracking-wide border-foreground/20 text-foreground/80 hover:text-foreground hover:border-foreground/50 transition-all"
                >
                  View Demo
                </Button>
              </div>

              {/* Floating stat chips */}
              <div className="flex flex-wrap gap-6 mt-14">
                {[
                  { value: "10k+", label: "Beta sign-ups" },
                  { value: "4.9 ★", label: "Avg. rating" },
                  { value: "98%", label: "Retention rate" },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col">
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

            {/* Right visual panel — glowing mock card */}
            <div className="order-1 xl:order-none flex-1 flex justify-center xl:justify-end">
              <div
                className="relative w-full max-w-sm rounded-3xl border border-foreground/10 p-8 backdrop-blur-md"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  boxShadow: "0 0 80px rgba(89,225,132,0.12), inset 0 0 40px rgba(89,225,132,0.04)",
                }}
              >
                {/* Mock habit tracker UI */}
                <p className="text-xs text-foreground/30 uppercase tracking-widest mb-5">Today&apos;s habits</p>
                {[
                  { label: "Morning run", done: true, pct: 100 },
                  { label: "Deep work block", done: true, pct: 100 },
                  { label: "Evening journal", done: false, pct: 60 },
                  { label: "Read 20 pages", done: false, pct: 30 },
                ].map((h) => (
                  <div key={h.label} className="mb-5 last:mb-0">
                    <div className="flex justify-between mb-1.5">
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

                {/* Streak badge */}
                <div
                  className="mt-7 flex items-center gap-3 rounded-2xl p-4 border border-[##982598]/20 bg-primary/10"
                >
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">14-day streak</p>
                    <p className="text-xs text-foreground/40">Keep it up — you&apos;re on fire!</p>
                  </div>
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
    </>
  )
}

export default Home

