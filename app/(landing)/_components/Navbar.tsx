"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-black/5 bg-surface-container-lowest/80">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-page mx-auto">
        <Link
          href="/"
          className="font-display-lg text-headline-lg-mobile md:text-headline-lg tracking-tighter text-on-background"
        >
          Poll Precision<span className="text-primary">.</span>
        </Link>
        <div className="hidden md:flex gap-gutter items-center">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={
                  active
                    ? "font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1 transition-all duration-300"
                    : "font-body-md text-body-md text-on-surface-variant font-medium hover:text-primary transition-all duration-300"
                }
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-4 items-center">
          <button
            type="button"
            className="hidden sm:block font-label-mono text-label-mono text-on-surface-variant hover:text-primary transition-all px-4 py-2"
          >
            Sign In
          </button>
          <button
            type="button"
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-label-mono text-label-mono font-bold shadow-sm hover:bg-primary/90 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
