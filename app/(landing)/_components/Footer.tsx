const FOOTER_LINKS = ["Features", "Pricing", "About US", "Github"];

export function Footer() {
  return (
    <footer className="bg-white w-full py-8 px-margin-desktop border-t border-black/[0.03] overflow-visible">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-page mx-auto gap-8 md:gap-0">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="font-display-lg text-headline-lg text-on-surface tracking-tighter">
            Poll Precision<span className="text-primary">.</span>
          </div>
          <p className="font-label-mono text-label-mono text-on-surface-variant/60">
            © {new Date().getFullYear()} PollPrecision Inc. Engineered for
            precision.
          </p>
        </div>
        <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
          {FOOTER_LINKS.map((label) => (
            <a
              key={label}
              href="#"
              className="font-label-mono text-label-mono hover:text-primary transition-colors text-on-surface-variant"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
