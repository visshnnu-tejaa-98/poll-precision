import { RevealSection } from "./RevealSection";

const STEPS = [
  {
    n: 1,
    title: "Build your poll",
    body: "Use our intelligent builder to craft the perfect set of questions with 10+ response types.",
  },
  {
    n: 2,
    title: "Share the link",
    body: "Distribute your unique link across any platform. One-click distribution for maximum reach.",
  },
  {
    n: 3,
    title: "Analyze results",
    body: "Get deep insights with real-time dashboards, sentiment analysis, and exportable reports.",
  },
];

export function HowItWorks() {
  return (
    <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop relative bg-surface-container-lowest">
      <div className="max-w-page mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">
            How it works
          </h2>
          <p className="text-on-surface-variant font-body-md">
            From inception to insight in three simple steps.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          {STEPS.map((step) => (
            <div key={step.n} className="text-center group relative">
              <div className="w-20 h-20 bg-white border border-outline-variant/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(0,82,255,0.1)] transition-all relative z-10">
                <span className="font-headline-lg-mobile text-primary">
                  {step.n}
                </span>
                <div className="absolute -z-10 w-full h-full bg-primary/5 rounded-full scale-0 group-hover:scale-125 transition-transform duration-500" />
              </div>
              <h4 className="font-headline-lg-mobile text-headline-lg-mobile mb-4 text-on-background">
                {step.title}
              </h4>
              <p className="text-on-surface-variant font-body-md">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </RevealSection>
  );
}
