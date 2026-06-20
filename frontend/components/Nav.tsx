"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, User, Zap, Shield, Layout, Globe, BookOpen, LayoutDashboard, LogOut } from "lucide-react";
import { logout, getCurrentUser, type User as AuthUser } from "@/lib/api";

const links = [
    {
        name: "Product",
        path: "/product",
        hasMega: true,
    },
    {
        name: "Solutions",
        path: "/solutions",
        hasMega: true,
    },
    {
        name: "Resources",
        path: "/resources",
        
    },
    {
        name: "About",
        path: "/about",
    },
];

const contact = [
    {
        name: "Contact sales",
        path: "/contact",
    },
    {
        name: "Log In",
        path: "/login",
    },
];

const productMegaMenu = {
    columns: [
        {
            title: "Platform",
            links: [
                { name: "Product overview", path: "/product" },
                { name: "All features", path: "/features" },
                { name: "App integrations", path: "/integrations" },
                { name: "Latest release", path: "/releases" },
            ]
        },
        {
            title: "Capabilities",
            links: [
                { name: "Project management", path: "/solutions/project-management" },
                { name: "Workflows and automation", path: "/solutions/workflows" },
                { name: "Goals and reporting", path: "/solutions/goals" },
                { name: "Resource management", path: "/solutions/resources" },
                { name: "Admin and security", path: "/solutions/security" },
            ]
        },
        // {
        //     title: "Qscribe AI",
        //     links: [
        //         { name: "Qscribe AI", path: "/ai" },
        //         { name: "AI Studio", path: "/ai/studio" },
        //         { name: "AI Teammates", path: "/ai/teammates" },
        //         { name: "Smart assists", path: "/ai/assists" },
        //     ]
        // }
    ],
    plans: {
        title: "Plans",
        links: [
            { name: "Personal", path: "/pricing", desc: "For individuals", icon: User },
            { name: "Starter", path: "/pricing", desc: "For growing teams", icon: Zap },
            { name: "Advanced", path: "/pricing", desc: "For powerful scaling", icon: Shield }
        ]
    },
    footer: [
        { name: "Contact sales", path: "/contact" },
        { name: "View demo", path: "/demo" },
        { name: "Download app", path: "/download" }
    ]
};

const solutionsMegaMenu = {
    columns: [
        {
            title: "By Team Size",
            links: [
                { name: "For Individuals", path: "/solutions/individuals" },
                { name: "For Small Teams", path: "/solutions/teams" },
                { name: "For Enterprises", path: "/solutions/enterprise" },
            ]
        },
        {
            title: "By Use Case",
            links: [
                { name: "Habit Building", path: "/solutions/habits" },
                { name: "Daily Routines", path: "/solutions/routines" },
                { name: "Goal Setting", path: "/solutions/goals" },
                { name: "Productivity", path: "/solutions/productivity" },
            ]
        }
    ],
    plans: {
        title: "Industries",
        links: [
            { name: "Education", path: "/solutions/education", desc: "For students & teachers", icon: BookOpen },
            { name: "Technology", path: "/solutions/tech", desc: "For developers & startups", icon: Layout },
            { name: "Global Business", path: "/solutions/global", desc: "For distributed work", icon: Globe }
        ]
    },
    footer: [
        { name: "See all solutions", path: "/solutions" },
        { name: "Customer stories", path: "/customers" }
    ]
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
        <nav className="flex items-center justify-between w-full">
            {/* Left side links (closer to logo) */}
            <div className="flex items-center gap-8 ml-10">
                {links.map((link, index) => {
                   const isActive = link.path === path;
                   const isProduct = link.name === "Product";
                   const isSolutions = link.name === "Solutions";
                   const megaMenu = isProduct ? productMegaMenu : isSolutions ? solutionsMegaMenu : null;

                   return (
                       <div key={index} className="group py-4">
                           <Link 
                                href={link.path} 
                                style={isActive ? { color: 'var(--tertiary)' } : undefined}
                                className={`capitalize font-medium transition-all duration-300 flex items-center gap-1 relative ${isActive ? "font-semibold" : "text-muted-foreground hover:text-[var(--tertiary)]"}`}
                            >
                                {link.name}
                                {link.hasMega && (
                                    <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                                )}
                                <span
                                    style={{ backgroundColor: 'var(--tertiary)' }}
                                    className={`absolute -bottom-1 left-0 h-[2px] transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
                                ></span>
                            </Link>
                           
                           {/* Mega Dropdown Menu */}
                           {link.hasMega && megaMenu && (
                               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[900px] bg-popover border border-border rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden flex flex-col">
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
                                                                className="text-sm font-medium text-foreground/80 hover:text-[var(--tertiary)] transition-colors hover:underline underline-offset-4"
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
                                                           className="flex items-start gap-3 group/plan hover:text-[var(--tertiary)] transition-colors"
                                                       >
                                                           <div className="p-2 rounded-lg bg-muted group-hover/plan:bg-[var(--tertiary)]/10 text-muted-foreground group-hover/plan:text-[var(--tertiary)] transition-colors">
                                                               <PlanIcon size={16} />
                                                           </div>
                                                           <div className="flex flex-col">
                                                               <span className="text-sm font-semibold text-foreground group-hover/plan:text-[var(--tertiary)]">
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
                                               className="text-xs font-medium text-muted-foreground hover:text-[var(--tertiary)] transition-colors flex items-center gap-1.5"
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
            <div className="flex items-center gap-6">
                {currentUser ? (
                    /* ── Logged-in state ── */
                    <>
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-[var(--tertiary)]"
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
                                className="capitalize text-sm font-medium transition-all duration-300 hover:text-[var(--tertiary)] text-muted-foreground"
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