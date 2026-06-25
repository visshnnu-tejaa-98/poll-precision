import { auth, currentUser } from "@clerk/nextjs/server";

const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "API Documentation",
  "Status",
];

export async function DashboardFooter() {
  return (
    <footer className="w-full py-10 px-margin-desktop mt-12 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto border-t border-outline-variant bg-transparent text-on-surface-variant">
      <div className="font-label-sm text-label-sm font-bold text-on-surface mb-6 md:mb-0">
        © {new Date().getFullYear()} PollPrecision Analytics. All rights
        reserved.
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        {FOOTER_LINKS.map((label) => (
          <a
            key={label}
            href="#"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
          >
            {label}
          </a>
        ))}
      </div>
    </footer>
  );
}
