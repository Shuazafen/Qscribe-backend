"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Zap,
  Shield,
  Sparkles,
  LayoutDashboard,
  LogOut,
  GraduationCap,
  TrendingUp,
  Layers,
} from "lucide-react";
import { logout, getCurrentUser, type User as AuthUser } from "@/lib/api";

const links = [
  {
    name: "Features",
    path: "/features",
    hasMega: true,
  },
  {
    name: "Pricing",
    path: "/pricing",
    hasMega: true,
  },
  {
    name: "About",
    path: "/about",
  },
  {
    name: "Beta",
    path: "/beta",
    badge: "Live",
  },
];

const contact = [
  {
    name: "Contact",
    path: "/contact",
  },
  {
    name: "Log In",
    path: "/login",
  },
];

const featuresMegaMenu = {
  columns: [
    {
      title: "Core Features",
      links: [
        { name: "Habit Tracking", path: "/features/habits", desc: "Build & track daily routines" },
        { name: "Savings Goals", path: "/features/savings", desc: "Save with auto-interest (Tier 3)" },
        { name: "Gamified Pets", path: "/features/pets", desc: "Unlock rare pets as you grow" },
        { name: "Transaction Logs", path: "/features/transactions", desc: "Track deposits & withdrawals" },
      ],
    },
    {
      title: "Tiers & Upgrades",
      links: [
        { name: "Tier 1 — Starter", path: "/tiers/tier1", desc: "Habits, basic savings" },
        { name: "Tier 2 — Verified", path: "/tiers/tier2", desc: "NIN + facial recognition" },
        { name: "Tier 3 — Premium", path: "/tiers/tier3", desc: "Interest savings, rare pets" },
        { name: "Upgrade Now", path: "/upgrade", desc: "Move up tiers" },
      ],
    },
  ],
  plans: {
    title: "Why Qscribe?",
    links: [
      {
        name: "AI Insights",
        path: "/ai",
        desc: "Smart nudges & pattern analysis",
        icon: Sparkles,
      },
      {
        name: "Streak System",
        path: "/streaks",
        desc: "Stay consistent, earn rewards",
        icon: TrendingUp,
      },
      {
        name: "Multi-tier Access",
        path: "/tiers",
        desc: "More features as you verify",
        icon: Layers,
      },
    ],
  },
  footer: [
    { name: "See all features", path: "/features" },
    { name: "Join Beta", path: "/beta" },
    { name: "View demo", path: "/demo" },
  ],
};

const pricingMegaMenu = {
  columns: [
    {
      title: "Free Tier",
      links: [
        { name: "Habit tracking (up to 5)", path: "/pricing" },
        { name: "Basic savings goals", path: "/pricing" },
        { name: "Common pets", path: "/pricing" },
        { name: "30-day history", path: "/pricing" },
      ],
    },
    {
      title: "Premium — coming soon",
      links: [
        { name: "Unlimited habits", path: "/pricing" },
        { name: "Interest-bearing savings", path: "/pricing" },
        { name: "Rare pets & cosmetics", path: "/pricing" },
        { name: "AI habit insights", path: "/pricing" },
      ],
    },
  ],
  plans: {
    title: "Current Status",
    links: [
      {
        name: "Beta Access",
        path: "/beta",
        desc: "Free during beta phase",
        icon: Zap,
      },
      {
        name: "Tier Upgrades",
        path: "/upgrade",
        desc: "KYC-based feature unlocks",
        icon: Shield,
      },
      {
        name: "Student Plan",
        path: "/pricing",
        desc: "Built for university students",
        icon: GraduationCap,
      },
    ],
  },
  footer: [
    { name: "Compare tiers", path: "/tiers" },
    { name: "FAQ", path: "/faq" },
  ],
};

const Nav = () => {
    const path = usePathname();
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

    // Re-read auth state whenever the route changes (covers post-login redirects)
    useEffect(() => {
        setCurrentUser(getCurrentUser());
    }, [path]);

    function handleLogout() {
        logout();
        setCurrentUser(null);
        router.push("/");
    }

    return (
        <nav className="flex items-center justify-between w-full min-w-0">
            {/* Left side links (closer to logo) */}
            <div className="flex items-center gap-6 2xl:gap-8 ml-6 2xl:ml-10 min-w-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {links.map((link, index) => {
                   const isActive = link.path === path;
                   const isFeatures = link.name === "Features";
                   const isPricing = link.name === "Pricing";
                   const megaMenu = isFeatures ? featuresMegaMenu : isPricing ? pricingMegaMenu : null;

                   return (
                       <div key={index} className="group py-4 shrink-0">
                           <Link 
                                href={link.path} 
                                style={isActive ? { color: 'var(--secondary)' } : undefined}
                                className={`capitalize font-medium transition-all duration-300 flex items-center gap-1 relative ${isActive ? "font-semibold" : "text-muted-foreground hover:text-[var(--secondary)]"}`}
                            >
                                {link.name}
                                {link.badge && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse">
                                    {link.badge}
                                  </span>
                                )}
                                {link.hasMega && (
                                    <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                                )}
                                <span
                                    className={`bg-primary ${`absolute -bottom-1 left-0 h-[2px] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}`}
                                ></span>
                            </Link>
                           
                           {/* Mega Dropdown Menu */}
                           {link.hasMega && megaMenu && (
                               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[min(900px,90vw)] bg-popover border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden flex flex-col">
                                   {/* Main content grid */}
                                   <div className="grid grid-cols-4 p-8 gap-8">
                                       {/* Columns 1-3 */}
                                       <div className="col-span-3 grid grid-cols-3 gap-8">
                                           {megaMenu.columns.map((col, cIdx) => (
                                               <div key={cIdx} className="flex flex-col gap-4">
                                                   <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 pb-2 border-b border-border/40">
                                                       {col.title}
                                                   </h4>
                                                   <div className="flex flex-col gap-3">
                                                       {col.links.map((sublink, sIdx) => (
                                                           <Link 
                                                                key={sIdx} 
                                                                href={sublink.path}
                                                                className="text-sm font-medium text-foreground/80 hover:text-[var(--secondary)] transition-colors hover:underline underline-offset-4"
                                                            >
                                                               {sublink.name}
                                                           </Link>
                                                       ))}
                                                   </div>
                                               </div>
                                           ))}
                                       </div>

                                       {/* Rightmost column (Plans / Right Special Panel) */}
                                       <div className="col-span-1 border-l border-border/40 pl-8 flex flex-col gap-4">
                                           <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 pb-2 border-b border-border/40">
                                               {megaMenu.plans.title}
                                           </h4>
                                           <div className="flex flex-col gap-4">
                                               {megaMenu.plans.links.map((plan, pIdx) => {
                                                   const PlanIcon = plan.icon;
                                                   return (
                                                       <Link 
                                                           key={pIdx} 
                                                           href={plan.path}
                                                           className="flex items-start gap-3 group/plan hover:text-[var(--secondary)] transition-colors"
                                                       >
                                                           <div className="p-2 rounded-lg bg-muted group-hover/plan:bg-[var(--secondary)]/10 text-muted-foreground group-hover/plan:text-[var(--secondary)] transition-colors">
                                                               <PlanIcon size={16} />
                                                           </div>
                                                           <div className="flex flex-col">
                                                               <span className="text-sm font-semibold text-foreground group-hover/plan:text-[var(--secondary)]">
                                                                   {plan.name}
                                                               </span>
                                                               <span className="text-xs text-muted-foreground/80">
                                                                   {plan.desc}
                                                               </span>
                                                           </div>
                                                       </Link>
                                                   );
                                               })}
                                           </div>
                                       </div>
                                   </div>

                                   {/* Bottom Footer Bar */}
                                   <div className="bg-muted/40 border-t border-border/40 px-8 py-4 flex items-center gap-6">
                                       {megaMenu.footer.map((footLink, fIdx) => (
                                           <Link 
                                               key={fIdx} 
                                               href={footLink.path}
                                               className="text-xs font-medium text-muted-foreground hover:text-[var(--secondary)] transition-colors flex items-center gap-1.5"
                                           >
                                               {footLink.name}
                                               {fIdx < megaMenu.footer.length - 1 && (
                                                   <span className="text-muted-foreground/20 ml-4">|</span>
                                               )}
                                           </Link>
                                       ))}
                                   </div>
                               </div>
                           )}

                           {/* Standard Sublink Dropdown */}
                            {/* {!link.hasMega  && (
                                <div className="absolute top-full left-0 mt-1 w-56 bg-popover border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 flex flex-col p-2 gap-1">
                                    {link.sublinks.map((sublink, i) => (
                                        <Link 
                                             key={i} 
                                             href={sublink.path}
                                             className="px-4 py-2.5 hover:bg-muted rounded-lg flex flex-col gap-0.5 transition-colors"
                                         >
                                            <span className="text-sm font-semibold text-foreground hover:text-primary">{sublink.name}</span>
                                            {sublink.desc && <span className="text-xs text-muted-foreground/80">{sublink.desc}</span>}
                                        </Link>
                                    ))}
                                </div>
                            )} */}
                       </div>
                   );
                })}
            </div>

            {/* Right side — auth-aware */}
            <div className="flex items-center gap-4 2xl:gap-6 shrink-0">
                {currentUser ? (
                    /* ── Logged-in state ── */
                    <>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--secondary)]"
                        >
                            <LayoutDashboard size={15} />
                            Dashboard
                        </Link>
                        <span className="text-border">|</span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
                        >
                            <LogOut size={15} />
                            Log out
                        </button>
                    </>
                ) : (
                    /* ── Logged-out state ── */
                    <>
                        {contact.map((link, index) => (
                            <Link
                                href={link.path}
                                key={index}
                                className="capitalize text-sm font-medium transition-all duration-300 hover:text-[var(--secondary)] text-muted-foreground"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <Link href="/signup">
                            <Button className="rounded-full px-6 font-medium shadow-sm transition-transform hover:scale-105">
                                Get Started
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Nav;