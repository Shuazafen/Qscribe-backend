"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";

const steps = [
  {
    number: "01",
    title: "Sign Up — Tier 1",
    description:
      "Create your free Qscribe account with your university credentials. Submit your phone number, university name, and student ID card — and you're in. Instantly unlock habit tracking, basic savings goals, and common pets.",
    badge: "Free",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="14" r="7" stroke="#982598" strokeWidth="2.5" />
        <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Build Habits & Save",
    description:
      "Create daily habits like morning runs, deep work blocks, or evening journaling. Log completions with a single tap and watch your streak grow. Set savings goals with target amounts — Qscribe tracks your progress and auto-calculates your completion rate.",
    badge: "Core",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <rect x="6" y="10" width="28" height="6" rx="3" stroke="#982598" strokeWidth="2.5" />
        <rect x="6" y="22" width="20" height="6" rx="3" stroke="#982598" strokeWidth="2.5" />
        <rect x="6" y="34" width="14" height="0" rx="3" stroke="#982598" strokeWidth="2.5" />
        <path d="M30 28l4 4-4 4" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Verify & Unlock Tier 2",
    description:
      "Submit your NIN (National Identification Number) and complete facial recognition to upgrade to Tier 2. This unlocks notifications, transaction logging, and access to more pet companions. Qscribe uses your data to personalise your experience.",
    badge: "KYC",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4z" stroke="#982598" strokeWidth="2.5" />
        <path d="M14 20c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="2.5" fill="#982598" />
        <path d="M20 4v4M20 32v4M4 20H8M32 20h4" stroke="#982598" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Go Premium — Tier 3",
    description:
      "Submit your BVN and address to reach Tier 3. Unlock rare pets (exclusive to premium users), interest-bearing savings accounts with auto-compounding rates, and unlimited transaction history with AI-powered insights.",
    badge: "Premium",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <polyline points="4,32 14,18 22,24 32,10 38,16" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="38" cy="16" r="2.5" fill="#982598" />
      </svg>
    ),
  },
];

function StepCard({
  step,
  index,
  isVisible,
}: {
  step: (typeof steps)[0];
  index: number;
  isVisible: boolean;
}) {
  const isLeft = index % 2 === 0;

  return (
    <div
      className={`
        flex w-full items-center gap-0
        ${isLeft ? "flex-row" : "flex-row-reverse"}
      `}
    >
      {/* --- Card side --- */}
      <div
        className={`
          w-[46%] transition-all duration-700 ease-out
          ${isVisible
            ? "opacity-100 translate-x-0"
            : isLeft
              ? "opacity-0 -translate-x-24"
              : "opacity-0 translate-x-24"
          }
        `}
        style={{ transitionDelay: `${index * 80}ms` }}
      >
        <div
          className={`
            relative group rounded-2xl border border-foreground/10 bg-white/[0.03]
            backdrop-blur-sm p-8 overflow-hidden
            hover:border-[#982598]/30 hover:bg-white/[0.06]
            transition-all duration-300 shadow-xl
            ${isLeft ? "mr-auto" : "ml-auto"}
          `}
        >
          {/* Glow blob */}
          <div
            className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)" }}
          />

          {/* Step number watermark */}
          <span
            className="absolute top-4 right-6 text-7xl font-black leading-none select-none text-primary/10"
          >
            {step.number}
          </span>

          <div className="relative z-10 flex flex-col gap-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-[#982598]/20 bg-[#982598]/5">
              {step.icon}
            </div>

            {/* Step label + badge */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                Step {step.number}
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  color: step.badge === "Premium" ? "#FFCF95" : step.badge === "KYC" ? "#E159A2" : "#982598",
                  background: `${step.badge === "Premium" ? "#FFCF95" : step.badge === "KYC" ? "#E159A2" : "#982598"}15`,
                  borderColor: `${step.badge === "Premium" ? "#FFCF95" : step.badge === "KYC" ? "#E159A2" : "#982598"}30`,
                }}
              >
                {step.badge}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-foreground leading-snug">{step.title}</h3>
            <p className="text-foreground/55 text-base leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>

      {/* --- Centre spine + circle --- */}
      <div className="w-[8%] flex flex-col items-center relative">
        {/* Vertical line segment */}
        <div
          className="absolute top-0 bottom-0 w-px"
          style={{
            background: "linear-gradient(to bottom, transparent, var(--color-primary), transparent)",
            opacity: 0.25,
          }}
        />
        {/* Number bubble */}
        <div
          className={`
            relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center
            text-sm font-bold transition-all duration-500
            ${isVisible
              ? "border-[#982598] bg-[#982598]/15 text-[#982598] scale-100"
              : "border-foreground/10 bg-foreground/5 text-foreground/30 scale-75"
            }
          `}
          style={{ transitionDelay: `${index * 80 + 200}ms` }}
        >
          {step.number}
        </div>
      </div>

      {/* --- Empty side placeholder so cards stay in their half --- */}
      <div className="w-[46%]" />
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>(
    new Array(steps.length).fill(false)
  );

  useEffect(() => {
    const observers = stepRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            obs.disconnect();
          }
        },
        { threshold: 0.25 }
      );
      obs.observe(el);
      return obs;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // Tier feature comparison data
  const tiers = [
    {
      name: "Tier 1",
      label: "Starter",
      color: "#982598",
      features: [
        "Habit tracking (up to 5)",
        "Basic savings goals",
        "Common pets",
        "30-day history",
      ],
    },
    {
      name: "Tier 2",
      label: "Verified",
      color: "#E159A2",
      features: [
        "Unlimited habits",
        "Transaction logging",
        "Notifications",
        "More pet companions",
      ],
    },
    {
      name: "Tier 3",
      label: "Premium",
      color: "#FFCF95",
      features: [
        "Interest-bearing savings",
        "Rare pets only",
        "Unlimited transactions",
        "AI habit insights",
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-28 overflow-hidden"
      id="how-it-works"
    >
      {/* Background gradient accents */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 50%, rgba(89,225,132,0.04) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(89,225,132,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-20">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border text-primary border-primary/30 bg-primary/10"
          >
            How it works
          </span>
          <h2 className="text-5xl font-black text-foreground leading-tight">
            Your journey in{" "}
            <span className="text-primary">three tiers</span>
          </h2>
          <p className="mt-4 text-foreground/50 text-lg max-w-xl mx-auto">
            Start with Tier 1 as a student, verify to Tier 2, and go premium with Tier 3 —
            each level unlocks more features.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-10 max-w-5xl mx-auto relative">
          {/* Full-height spine */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
            style={{
              background: "linear-gradient(to bottom, transparent 0%, var(--color-primary) 10%, var(--color-primary) 90%, transparent 100%)",
              opacity: 0.15,
            }}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => { stepRefs.current[i] = el; }}
            >
              <StepCard step={step} index={i} isVisible={visibleSteps[i]} />
            </div>
          ))}
        </div>

        {/* Tier Comparison Table */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border text-foreground/60 border-foreground/20 bg-foreground/5"
            >
              Feature comparison
            </span>
            <h3 className="text-3xl font-bold text-foreground">
              Pick your tier, unlock more
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-2xl border border-foreground/10 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-[var(--tier-color)]/40"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  "--tier-color": tier.color,
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-foreground">{tier.name}</h4>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      color: tier.color,
                      background: `${tier.color}15`,
                      border: `1px solid ${tier.color}30`,
                    }}
                  >
                    {tier.label}
                  </span>
                </div>
                <ul className="flex flex-col gap-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-foreground/70">
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="4" fill={tier.color} opacity="0.6" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <Link href="/signup">
              <Button
                className="rounded-full px-8 font-semibold uppercase tracking-wide shadow-lg hover:scale-105 transition-transform bg-secondary text-primary-foreground"
              >
                Start at Tier 1 — Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
