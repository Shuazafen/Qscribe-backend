"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Sign Up in Seconds",
    description:
      "Create your free Qscribe account and explore our ui, for access to Habit tracking and productivity goals a Tier 2(KYC Registeration is required).",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="14" r="7" stroke="#982598" strokeWidth="2.5" />
        <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Build Your Habit Stack",
    description:
      "Choose from curated templates or build custom routines. Qscribe intelligently groups your habits into morning, afternoon, and evening stacks.",
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
    title: "Track Your Progress",
    description:
      "Log completions with a single tap. Qscribe visualises your streaks, consistency scores, and weekly momentum in real time. A gamified system represents streaks and progress which serves to encourage users in their perspective habits ",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <polyline points="4,32 14,18 22,24 32,10 38,16" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="38" cy="16" r="2.5" fill="#982598" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Grow with AI Insights",
    description:
      "Qscribe's AI analyses your patterns and nudges you at the right moment — helping you stay consistent even on your hardest days.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 4C11.163 4 4 11.163 4 20s7.163 16 16 16 16-7.163 16-16S28.837 4 20 4z" stroke="#982598" strokeWidth="2.5" />
        <path d="M14 20c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6" stroke="#982598" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="20" cy="20" r="2.5" fill="#982598" />
        <path d="M20 4v4M20 32v4M4 20H8M32 20h4" stroke="#982598" strokeWidth="2" strokeLinecap="round" />
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
            hover:border-[##982598]/30 hover:bg-white/[0.06]
            transition-all duration-300 shadow-xl
            ${isLeft ? "mr-auto" : "ml-auto"}
          `}
        >
          {/* Glow blob */}
          <div
            className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle,var(--color-primary)_0%,transparent_70%)] opacity-30"
          />

          {/* Step number watermark */}
          <span
            className="absolute top-4 right-6 text-7xl font-black leading-none select-none text-primary/10"
          >
            {step.number}
          </span>

          <div className="relative z-10 flex flex-col gap-5">
            {/* Icon */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-[##982598]/20 bg-[##982598]/5">
              {step.icon}
            </div>

            {/* Step label */}
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Step {step.number}
            </span>

            <h3 className="text-2xl font-bold text-foreground leading-snug">{step.title}</h3>
            <p className="text-foreground/55 text-base leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>

      {/* --- Centre spine + circle --- */}
      <div className="w-[8%] flex flex-col items-center relative">
        {/* Vertical line segment */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[linear-gradient(to_bottom,transparent,var(--color-primary),transparent)] opacity-25"
        />
        {/* Number bubble */}
        <div
          className={`
            relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center
            text-sm font-bold transition-all duration-500
            ${isVisible
              ? "border-[##982598] bg-[##982598]/15 text-[##982598] scale-100"
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
            Four steps to{" "}
            <span className="text-primary">lasting habits</span>
          </h2>
          <p className="mt-4 text-foreground/50 text-lg max-w-xl mx-auto">
            Qscribe makes building consistent routines effortless — from signup to AI-powered growth.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-10 max-w-5xl mx-auto relative">
          {/* Full-height spine */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-[linear-gradient(to_bottom,transparent_0%,var(--color-primary)_10%,var(--color-primary)_90%,transparent_100%)] opacity-15"
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
      </div>
    </section>
  );
}
