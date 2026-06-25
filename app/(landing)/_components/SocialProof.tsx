import { RevealSection } from "./RevealSection";

const LOGOS = ["VELOCITY", "STACK_HQ", "QUANTUM", "NEXUS.IO", "LUMINA"];

export function SocialProof() {
  return (
    <RevealSection className="py-16 bg-surface-container-lowest border-y border-black/[0.03]">
      <div className="max-w-page mx-auto px-margin-mobile md:px-margin-desktop">
        <p className="text-center font-label-mono text-label-mono text-on-surface-variant/60 uppercase tracking-widest mb-10">
          Trusted by modern engineering &amp; product teams
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale">
          {LOGOS.map((logo) => (
            <div
              key={logo}
              className="h-8 flex items-center font-headline-lg-mobile font-bold text-on-surface tracking-widest"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
