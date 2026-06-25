import type { Metadata } from "next";
import { CTASection } from "../_components/CTASection";
import { Icon } from "@/app/_components/Icon";
import { RevealSection } from "../_components/RevealSection";

export const metadata: Metadata = {
  title: "Pricing | Poll Precision",
  description:
    "Free for solo work. Upgrade for real-time analytics, unlimited responses, and enterprise controls.",
};

type Tier = {
  name: string;
  tagline: string;
  price: string;
  period?: string;
  cta: string;
  featured?: boolean;
  features: string[];
};

const TIERS: Tier[] = [
  {
    name: "Free",
    tagline: "For students and one-off polls.",
    price: "$0",
    period: "forever",
    cta: "Start for free",
    features: [
      "Up to 3 active polls",
      "100 responses per poll",
      "Anonymous voting",
      "Public link sharing",
      "Basic analytics dashboard",
    ],
  },
  {
    name: "Pro",
    tagline: "For product, ops, and engineering teams.",
    price: "$12",
    period: "per user / month",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "Unlimited polls and responses",
      "Real-time live response counts",
      "Authenticated voting",
      "Custom expiry windows",
      "Password-protected polls",
      "Publishable result pages",
      "CSV export",
    ],
  },
  {
    name: "Enterprise",
    tagline: "For orgs that need control and compliance.",
    price: "Custom",
    cta: "Talk to sales",
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Role-based workspaces",
      "Audit log",
      "99.99% uptime SLA",
      "Dedicated CSM",
    ],
  },
];

const FAQ = [
  {
    q: "How are responses counted across plans?",
    a: "A response is a single submitted ballot, no matter how many questions it contains. Free caps at 100 per poll; Pro and Enterprise are unlimited.",
  },
  {
    q: "Can I switch between anonymous and authenticated voting?",
    a: "Yes — every poll is configured independently. Free plans support anonymous voting; Pro and above unlock authenticated voting with sign-in.",
  },
  {
    q: "What happens when a poll expires?",
    a: "The link stays live but stops accepting new responses. If you've published the results, visitors will see the final summary instead of the voting form.",
  },
  {
    q: "Is there a discount for annual billing?",
    a: "Annual plans bill at 10 months — two months free. Reach out to sales for volume pricing on Enterprise seats.",
  },
  {
    q: "Do you offer a non-profit or education plan?",
    a: "Yes. Verified non-profits and accredited classrooms get Pro at no cost. Email hello@pollprecision.dev with proof of status.",
  },
];

export default function PricingPage() {
  return (
    <>
      <RevealSection className="relative overflow-hidden pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-40" />
        <div className="max-w-page mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary font-label-mono text-label-mono mb-10 backdrop-blur-sm">
            <Icon name="payments" className="text-[16px]" />
            <span>pricing_v2.0</span>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-[64px] text-on-background mb-6 tracking-tighter leading-none max-w-4xl">
            Pricing built for <span className="text-primary">precision</span>.
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl text-lg">
            Free forever for solo work. Upgrade when you need real-time
            analytics, unlimited responses, or enterprise controls. No hidden
            response caps, no per-respondent billing.
          </p>
        </div>
      </RevealSection>

      <RevealSection className="py-20 px-margin-mobile md:px-margin-desktop relative bg-background">
        <div className="max-w-page mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={
                  tier.featured
                    ? "relative bg-surface-container-low p-10 rounded-3xl border-2 border-primary/40 lift-hover shadow-[0_12px_40px_-12px_rgba(0,82,255,0.2)] flex flex-col"
                    : "relative bg-surface-container-low p-10 rounded-3xl border border-outline-variant/30 lift-hover flex flex-col"
                }
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1 rounded-full font-label-mono text-[12px] font-bold uppercase tracking-wider">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-2 text-on-background">
                    {tier.name}
                  </h3>
                  <p className="text-on-surface-variant font-body-md text-sm">
                    {tier.tagline}
                  </p>
                </div>
                <div className="mb-8 flex items-baseline gap-2">
                  <span className="font-display-lg text-display-lg text-on-background tracking-tighter">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-on-surface-variant font-body-md text-sm">
                      {tier.period}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className={
                    tier.featured
                      ? "w-full bg-primary text-on-primary px-6 py-3 rounded-xl font-label-mono text-label-mono font-bold shadow-[0_4px_20px_rgba(0,82,255,0.25)] hover:shadow-[0_8px_30px_rgba(0,82,255,0.35)] hover:translate-y-[-1px] transition-all mb-8 active:scale-95"
                      : "w-full bg-white border border-outline-variant/40 text-on-background px-6 py-3 rounded-xl font-label-mono text-label-mono font-bold hover:border-primary hover:text-primary transition-all mb-8 active:scale-95"
                  }
                >
                  {tier.cta}
                </button>
                <ul className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-on-surface-variant font-body-md text-sm"
                    >
                      <Icon
                        name="check_circle"
                        className="text-primary text-[18px] mt-0.5"
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">
              Frequently asked questions
            </h2>
            <p className="text-on-surface-variant font-body-md">
              Still curious? Email{" "}
              <a
                href="mailto:hello@pollprecision.dev"
                className="text-primary hover:underline"
              >
                hello@pollprecision.dev
              </a>
              .
            </p>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="bg-surface-container-low rounded-2xl border border-outline-variant/30 p-6 group lift-hover"
              >
                <summary className="font-headline-lg-mobile text-[18px] font-semibold text-on-background cursor-pointer flex items-center justify-between gap-4 list-none">
                  <span>{item.q}</span>
                  <Icon
                    name="add"
                    className="text-on-surface-variant text-[20px] group-open:rotate-45 transition-transform shrink-0"
                  />
                </summary>
                <p className="mt-4 text-on-surface-variant font-body-md">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </RevealSection>

      <CTASection />
    </>
  );
}
