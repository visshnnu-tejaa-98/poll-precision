"use client";

import { Icon } from "@/app/_components/Icon";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/builder", label: "Poll Builder", icon: "ballot" },
  { href: "/submissions", label: "Submissions", icon: "group" },
  { href: "/reports", label: "Reports", icon: "insights" },
] as const;

const SECONDARY_LINKS = [
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/help", label: "Help", icon: "help_outline" },
] as const;

export function Sidebar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant z-40">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xl shadow-sm">
            P
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">
              Workspace
            </h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {`${firstName} ${lastName}`}
            </p>
          </div>
        </Link>
        <div className="space-y-1">
          {PRIMARY_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active ?
                    "flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded px-4 py-3 transition-all"
                  : "flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-low transition-colors rounded"
                }
              >
                <Icon name={link.icon} filled={active} />
                <span
                  className={
                    active ?
                      "font-label-sm text-label-sm font-semibold"
                    : "font-label-sm text-label-sm"
                  }
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-auto p-6 space-y-1 border-t border-outline-variant">
        <button
          type="button"
          className="w-full py-2.5 mb-4 bg-surface border border-outline text-primary font-label-sm text-label-sm rounded hover:bg-primary/5 transition-colors"
        >
          Upgrade Plan
        </button>
        {SECONDARY_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active ?
                  "flex items-center gap-3 bg-secondary-container text-on-secondary-container px-4 py-2 rounded transition-all"
                : "flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-surface-container-low transition-colors rounded"
              }
            >
              <Icon name={link.icon} filled={active} />
              <span className="font-label-sm text-label-sm">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
