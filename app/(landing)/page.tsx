import { CTASection } from "./_components/CTASection";
import { Features } from "./_components/Features";
import { Hero } from "./_components/Hero";
import { HowItWorks } from "./_components/HowItWorks";
import { SocialProof } from "./_components/SocialProof";
import { Testimonial } from "./_components/Testimonial";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Testimonial />
      <CTASection />
    </>
  );
}
