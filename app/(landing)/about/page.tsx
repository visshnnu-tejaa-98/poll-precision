import type { Metadata } from "next";
import { CTASection } from "../_components/CTASection";
import { Icon } from "../_components/Icon";
import { RevealSection } from "../_components/RevealSection";

export const metadata: Metadata = {
  title: "About Us | Poll Precision",
  description:
    "Poll Precision is built for engineering and product teams who want fast, accurate, decision-grade feedback.",
};

const STATS = [
  { value: "10,000+", label: "teams onboarded" },
  { value: "2.4M", label: "responses collected" },
  { value: "<120ms", label: "live update latency" },
];

const VALUES = [
  {
    icon: "target",
    title: "Precision over volume",
    body: "Every count, every chart, every percentage is exact. No rounding errors, no sampling, no estimates buried in tooltips.",
  },
  {
    icon: "lock",
    title: "Privacy by default",
    body: "Anonymous voting means anonymous — no fingerprinting, no tracking pixels, no quietly stored IPs. Authenticated mode is opt-in per poll.",
  },
  {
    icon: "bolt",
    title: "Real-time, always",
    body: "WebSockets stream new responses to dashboards in under 120ms. Watch a planning vote land while the meeting is still happening.",
  },
  {
    icon: "public",
    title: "Open by design",
    body: "Publish results to the same poll link. One URL for collection, one URL for the outcome. No screenshots, no spreadsheets in Slack.",
  },
];

export default function AboutPage() {
  return (
    <>
      <RevealSection className="relative overflow-hidden pt-20 pb-24 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.05] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none opacity-40" />
        <div className="max-w-page mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary font-label-mono text-label-mono mb-10 backdrop-blur-sm">
            <Icon name="info" className="text-[16px]" />
            <span>about_us</span>
          </div>
          <h1 className="font-display-lg text-display-lg md:text-[64px] text-on-background mb-6 tracking-tighter leading-none max-w-4xl">
            Engineered for <span className="text-primary">precision</span>.
            Built for the teams who ship.
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl text-lg">
            Poll Precision started as a hackathon project and turned into the
            tool we wished we had every Monday planning meeting — a polling
            platform that treats responses as data, not engagement bait.
          </p>
        </div>
      </RevealSection>

      <RevealSection className="py-20 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest border-y border-black/[0.03]">
        <div className="max-w-page mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display-lg text-display-lg text-on-background tracking-tighter mb-2">
                  {stat.value}
                </div>
                <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-page mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">
              Our mission
            </h2>
            <p className="text-on-surface-variant font-body-md text-lg leading-relaxed">
              Most polling tools optimize for vanity — bigger numbers, broader
              reach. We optimize for the decisions on the other side of the
              data. Whether you&apos;re scoping a roadmap, picking a vendor, or
              voting on a release name, the answer matters more than the click
              count.
            </p>
          </div>
        </div>
      </RevealSection>

      <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop relative bg-surface-container-lowest">
        <div className="max-w-page mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">
              What we value
            </h2>
            <p className="text-on-surface-variant font-body-md max-w-2xl mx-auto">
              Four principles that show up in every screen, every API, and
              every default.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {VALUES.map((value) => (
              <div
                key={value.title}
                className="bg-surface-container-low p-10 rounded-3xl border border-outline-variant/30 lift-hover"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 border border-primary/10">
                  <Icon name={value.icon} className="text-3xl" />
                </div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-4 text-on-background">
                  {value.title}
                </h3>
                <p className="text-on-surface-variant font-body-md">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </RevealSection>

      <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-page mx-auto">
          <div className="bg-surface-container-low p-10 md:p-16 rounded-3xl border border-outline-variant/30 lift-hover">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary font-label-mono text-[12px] mb-4">
                  <Icon name="how_to_vote" className="text-[14px]" />
                  <span>the_story</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-on-background mb-4 tracking-tight">
                  Built in 48 hours. Refined every week since.
                </h3>
                <p className="text-on-surface-variant font-body-md mb-4">
                  We shipped the first version of Poll Precision at a
                  hackathon, then kept going because every team we showed it
                  to asked, &ldquo;wait, can we actually use this?&rdquo;
                </p>
                <p className="text-on-surface-variant font-body-md">
                  Today it powers planning votes at scrappy startups, retros at
                  300-person engineering orgs, and the occasional debate about
                  what to name the dog in the office Slack.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "rocket_launch", label: "Shipped 2024" },
                  { icon: "code", label: "Open source roadmap" },
                  { icon: "groups", label: "Remote-first team" },
                  { icon: "favorite", label: "Indie funded" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-background border border-outline-variant/30 rounded-2xl p-5 flex flex-col gap-2"
                  >
                    <Icon
                      name={item.icon}
                      className="text-primary text-2xl"
                    />
                    <span className="font-label-mono text-label-mono text-on-surface uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RevealSection>

      <CTASection />
    </>
  );
}
