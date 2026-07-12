"use client";

import Link from "next/link"
import { useState } from "react";
import { X, Menu } from "lucide-react";
import { logout, getCurrentUser } from "@/lib/api";
import { Button } from "./ui/button";
import Nav from "./Nav";

const mobileLinks = [
  { name: "Features", path: "/features" },
  { name: "Pricing", path: "/pricing" },
  { name: "About", path: "/about" },
  { name: "Beta", path: "/beta" },
];

const Header = () => {
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border py-4 xl:py-6 transition-all overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center overflow-hidden">

            <Link href={"/"} className="font-bold text-2xl tracking-tight flex items-center gap-2 text-primary hover:opacity-80 transition-opacity shrink-0">
              QSCRIBE
            </Link>

            {/* Desktop nav bar */}
            <div className="hidden xl:flex items-center flex-1 min-w-0">
              <Nav />
            </div>

            {/* Mobile hamburger */}
            <div className="xl:hidden flex items-center shrink-0">
              <MobileMenu
                currentUser={currentUser}
                onLogout={() => {
                  logout();
                  setCurrentUser(null);
                }}
              />
            </div>

            </div>
        </header>
    )
}

function MobileMenu({ currentUser, onLogout }: { currentUser: any; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative z-50 p-2 text-foreground/60 hover:text-foreground transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="fixed inset-0 top-0 z-40 flex flex-col items-center justify-center gap-6 sm:gap-8 bg-background/95 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto px-6 py-20">
          {/* Close button top-right for easy dismiss */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 p-2 text-foreground/40 hover:text-foreground transition-colors z-50"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>

          {mobileLinks.map((link) => {
            return (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setOpen(false)}
                className="text-xl font-bold tracking-wide text-foreground/60 hover:text-primary transition-colors text-center"
              >
                {link.name}
                {link.name === "Beta" && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/20 text-primary animate-pulse">
                    Live
                  </span>
                )}
              </Link>
            );
          })}

          <div className="flex flex-col items-center gap-4 mt-4 w-full max-w-[240px]">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-lg font-bold text-foreground/60 hover:text-primary transition-colors text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { onLogout(); setOpen(false); }}
                  className="text-sm text-foreground/40 hover:text-destructive transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="w-full">
                  <Button variant="outline" className="rounded-full px-8 w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="w-full">
                  <Button className="rounded-full px-8 font-semibold w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header