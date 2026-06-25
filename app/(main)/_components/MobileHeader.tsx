import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="md:hidden flex justify-between items-center w-full px-margin-mobile h-16 bg-surface border-b border-outline-variant shadow-sm z-30 sticky top-0">
      <Link
        href="/dashboard"
        className="font-headline-md text-[20px] font-bold text-primary"
      >
        PollPrecision
      </Link>
      <UserButton />
    </header>
  );
}
