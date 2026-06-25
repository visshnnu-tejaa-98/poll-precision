import { Icon } from "./Icon";
import { RevealSection } from "./RevealSection";

export function Hero() {
  return (
    <RevealSection className="relative overflow-hidden pt-20 pb-32 px-margin-mobile md:px-margin-desktop bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.09] to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-40" />
      <div className="max-w-page mx-auto relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary font-label-mono text-label-mono mb-12 backdrop-blur-sm">
          <Icon name="terminal" className="text-[16px]" />
          <span>v2.0_release_candidate</span>
        </div>
        <h1 className="font-display-lg text-display-lg md:text-[64px] text-on-background mb-8 tracking-tighter leading-none max-w-4xl">
          Decision-making, <span className="text-primary">simplified</span> with
          precision.
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-12 max-w-2xl text-lg">
          Create, share, and analyze polls in real-time. Secure, intuitive, and
          built for modern engineering teams who value data-driven clarity.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
          <button
            type="button"
            className="bg-primary text-on-primary px-10 py-5 rounded-xl font-label-mono text-label-mono font-bold shadow-[0_4px_20px_rgba(0,82,255,0.25)] hover:shadow-[0_8px_30px_rgba(0,82,255,0.35)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 group active:scale-95"
          >
            Start Creating for Free
            <Icon
              name="arrow_forward"
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>
    </RevealSection>
  );
}
