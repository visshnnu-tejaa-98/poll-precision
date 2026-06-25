import Image from "next/image";
import { Icon } from "./Icon";
import { RevealSection } from "./RevealSection";

const BUILDER_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvyHDgTl61doZjhSn6D3R7qqMQzDgEdtHZuP_k_efIVWOIprjgg5pDXv_L9ebjxGW2Mq-3qLGG8kc8UVubRXGJXo6EDmn5QLtzO0ND_E_AYP0BFV7rdqyPEzPo4U2G35eCSi0mrDsxJjr9iTXOfbUThf_j2t4kS8EXcc2kNhhKwgqVks4ZC4KyXaJQ21sOiYkK1pX3sagiFgOe7_OME1dAcjkKdEI4nu8rGxCNsjom3CuPiKBD6dFZ6oMlteepVVmCfqSRKcUPGCgD";

const ANALYTICS_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCCwgdrvlhgF2rT62KRkVgSaWPKft66HMfmzTj6BgS_noAsfnd_VyrLmhFjvTHiCXqiSwwfU2PiYGW9-czsP7qqoWOCeZw11Mg7dZoxWLaIxfU8MaUU46kR_63ZNchcf1l2MKiLWT7CBszdluYtG7_RRK7z2onMbTW-giuZ_HGCxQ1L1tRKyhKHEfgO8Olhyd0zExKKo-dgH73tG7OmPpHg0qy4h21RTkuflTWea6hSucoGWzN9u3weDJk9DPuz9nRUmzjAXI32Pvw_";

export function Features() {
  return (
    <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop relative bg-background">
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-primary/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="max-w-page mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">
            Precision tools for precision results
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body-md">
            Everything you need to gather high-quality insights from your
            audience, colleagues, or customers.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <div className="md:col-span-8 glass-card p-10 rounded-3xl flex flex-col justify-between lift-hover h-full">
            <div className="z-10">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 border border-primary/10">
                <Icon name="edit_note" className="text-3xl" />
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-4 text-on-background">
                Intuitive Builder
              </h3>
              <p className="text-on-surface-variant max-w-md font-body-md">
                Drag-and-drop questions, toggle settings, and preview in
                real-time. Our builder removes the friction between having a
                question and getting an answer.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl relative h-48">
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent z-10" />
              <Image
                alt="Intuitive Builder Interface"
                src={BUILDER_IMG}
                fill
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover rounded-xl"
              />
            </div>
          </div>

          <div className="md:col-span-4 glass-card p-10 rounded-3xl flex flex-col justify-between lift-hover">
            <div className="z-10">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6 border border-secondary/10">
                <Icon name="insights" className="text-3xl" />
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-4 text-on-background">
                Real-time Analytics
              </h3>
              <p className="text-on-surface-variant font-body-md">
                Watch insights roll in as they happen with beautiful
                visualizations that update automatically.
              </p>
            </div>
            <div className="mt-8 overflow-hidden rounded-2xl relative h-48">
              <Image
                alt="Real-time Analytics Visualization"
                src={ANALYTICS_IMG}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover rounded-xl opacity-90"
              />
            </div>
          </div>

          <div className="md:col-span-6 bg-surface-container-low p-10 rounded-3xl border border-outline-variant/30 lift-hover">
            <div className="w-12 h-12 bg-tertiary/10 text-tertiary rounded-xl flex items-center justify-center mb-6 border border-tertiary/10">
              <Icon name="security" className="text-3xl" />
            </div>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-4 text-on-background">
              Secure &amp; Flexible
            </h3>
            <p className="text-on-surface-variant font-body-md">
              Choose between anonymous or authenticated voting with customizable
              expiry times and password protection for sensitive data
              collection.
            </p>
          </div>

          <div className="md:col-span-6 bg-surface-container-low p-10 rounded-3xl border border-outline-variant/30 lift-hover overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-on-surface/10 text-on-surface rounded-xl flex items-center justify-center mb-6 border border-on-surface/10">
                <Icon name="share" className="text-3xl" />
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile mb-4 text-on-background">
                Public Sharing
              </h3>
              <p className="text-on-surface-variant font-body-md">
                Generate a link and reach your audience anywhere. Embed in your
                website, Slack, or share via QR codes instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
