"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { ChevronDown, User, Zap, Shield, Sparkles, Layout, Globe, BookOpen } from "lucide-react";

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
        sublinks: [
            { name: "Blog", path: "/blog", desc: "Latest news & stories" },
            { name: "Help Center", path: "/help", desc: "Tutorials & guides" },
        ]
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
        {
            title: "Qscribe AI",
            links: [
                { name: "Qscribe AI", path: "/ai" },
                { name: "AI Studio", path: "/ai/studio" },
                { name: "AI Teammates", path: "/ai/teammates" },
                { name: "Smart assists", path: "/ai/assists" },
            ]
        }
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
                               className={`capitalize font-medium transition-all duration-300 hover:text-primary flex items-center gap-1 relative ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}
                           >
                               {link.name}
                               {link.hasMega && (
                                   <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                               )}
                               <span className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}></span>
                           </Link>
                           
                           {/* Mega Dropdown Menu */}
                           {link.hasMega && megaMenu && (
                               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[900px] bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 overflow-hidden flex flex-col">
                                   {/* Main content grid */}
                                   <div className="grid grid-cols-4 p-8 gap-8">
                                       {/* Columns 1-3 */}
                                       <div className="col-span-3 grid grid-cols-3 gap-8">
                                           {megaMenu.columns.map((col, cIdx) => (
                                               <div key={cIdx} className="flex flex-col gap-4">
                                                   <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-50">
                                                       {col.title}
                                                   </h4>
                                                   <div className="flex flex-col gap-3">
                                                       {col.links.map((sublink, sIdx) => (
                                                           <Link 
                                                                key={sIdx} 
                                                                href={sublink.path}
                                                                className="text-sm font-medium text-gray-700 hover:text-primary transition-colors hover:underline underline-offset-4"
                                                            >
                                                               {sublink.name}
                                                           </Link>
                                                       ))}
                                                   </div>
                                               </div>
                                           ))}
                                       </div>

                                       {/* Rightmost column (Plans / Right Special Panel) */}
                                       <div className="col-span-1 border-l border-gray-100 pl-8 flex flex-col gap-4">
                                           <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-50">
                                               {megaMenu.plans.title}
                                           </h4>
                                           <div className="flex flex-col gap-4">
                                               {megaMenu.plans.links.map((plan, pIdx) => {
                                                   const PlanIcon = plan.icon;
                                                   return (
                                                       <Link 
                                                           key={pIdx} 
                                                           href={plan.path}
                                                           className="flex items-start gap-3 group/plan hover:text-primary transition-colors"
                                                       >
                                                           <div className="p-2 rounded-lg bg-gray-50 group-hover/plan:bg-primary/5 text-gray-500 group-hover/plan:text-primary transition-colors">
                                                               <PlanIcon size={16} />
                                                           </div>
                                                           <div className="flex flex-col">
                                                               <span className="text-sm font-semibold text-gray-800 group-hover/plan:text-primary">
                                                                   {plan.name}
                                                               </span>
                                                               <span className="text-xs text-gray-400">
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
                                   <div className="bg-gray-50/80 border-t border-gray-100 px-8 py-4 flex items-center gap-6">
                                       {megaMenu.footer.map((footLink, fIdx) => (
                                           <Link 
                                               key={fIdx} 
                                               href={footLink.path}
                                               className="text-xs font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5"
                                           >
                                               {footLink.name}
                                               {fIdx < megaMenu.footer.length - 1 && (
                                                   <span className="text-gray-300 ml-4">|</span>
                                               )}
                                           </Link>
                                       ))}
                                   </div>
                               </div>
                           )}

                           {/* Standard Sublink Dropdown */}
                           {!link.hasMega && link.sublinks && (
                               <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-50 flex flex-col p-2 gap-1">
                                   {link.sublinks.map((sublink, i) => (
                                       <Link 
                                            key={i} 
                                            href={sublink.path}
                                            className="px-4 py-2.5 hover:bg-gray-50 rounded-lg flex flex-col gap-0.5 transition-colors"
                                        >
                                           <span className="text-sm font-semibold text-gray-800 hover:text-primary">{sublink.name}</span>
                                           {sublink.desc && <span className="text-xs text-gray-400">{sublink.desc}</span>}
                                       </Link>
                                   ))}
                               </div>
                           )}
                       </div>
                   );
                })}
            </div>

            {/* Right side contact & button (far end) */}
            <div className="flex items-center gap-6">
                {contact.map((link, index) => {
                    return (
                        <Link
                            href={link.path}
                            key={index}
                            className="capitalize text-sm font-medium transition-all duration-300 hover:text-primary text-muted-foreground"
                        >
                            {link.name}
                        </Link>
                    )
                })}
                <Link href='/signup'>
                    <Button className="rounded-full px-6 font-medium shadow-sm transition-transform hover:scale-105">Get Started</Button>
                </Link>
            </div>
        </nav>
    );
}

export default Nav;