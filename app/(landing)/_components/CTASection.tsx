import { SignInButton } from "@clerk/nextjs";
import { Icon } from "@/app/_components/Icon";
import { RevealSection } from "./RevealSection";

export function CTASection() {
  return (
    <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop bg-surface-container-low overflow-hidden relative border-t border-black/[0.03]">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 blur-[120px] rounded-full" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="font-display-lg text-headline-lg md:text-display-lg mb-8 text-on-background tracking-tight">
          Ready to get precise answers?
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-12 text-lg">
          Join over 10,000 teams using PollPrecision to make better, faster, and
          more inclusive decisions every day.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <SignInButton>
            <button
              type="button"
              className="bg-primary text-on-primary px-10 py-5 rounded-xl font-label-mono text-label-mono font-bold shadow-[0_10px_25px_rgba(0,82,255,0.2)] hover:shadow-[0_15px_35px_rgba(0,82,255,0.3)] hover:translate-y-[-2px] transition-all scale-105 active:scale-100 flex items-center gap-2"
            >
              Start Creating for Free
              <Icon name="arrow_forward" />
            </button>
          </SignInButton>
        </div>
        <p className="mt-8 text-on-surface-variant/60 font-label-mono text-code-sm">
          No credit card required. Free tier available forever.
        </p>
      </div>
    </RevealSection>
  );
}
