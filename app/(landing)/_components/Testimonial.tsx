import Image from "next/image";
import { Icon } from "@/app/_components/Icon";
import { RevealSection } from "./RevealSection";

const AVATAR_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCtPF07yTk4GDK6JfyPEpf-nVmY8LdHxlo_-psBMqI6b_OEsl9eUY8_LIJ5PlWvHJ2GWRW9aWMa6ZU0J3DmUP32jT8l4MNW0qep8yh4aSU9NxBKxIEVVQ5_EHA0oppLiYsQUucvWoYzgioA-BDb6q4IK_qFJHm6ZzBZSH8ZfF-AaUoUf4p_wbt7gZVIcx0AGXo7KKcTuUsPDjohJ5mwEIOULQX9OVP7K5CZJgqa6KUymuG7CAW79-r-StKK2fUy8ydixsA8LLaNMFoQ";

export function Testimonial() {
  return (
    <RevealSection className="py-32 px-margin-mobile md:px-margin-desktop relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/[0.03] blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="max-w-page mx-auto relative z-10">
        <div className="glass-card p-12 md:p-20 rounded-[40px] shadow-xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden bg-white/60">
          <div className="absolute top-0 right-0 p-10 text-primary/[0.03]">
            <Icon name="format_quote" className="text-[160px] leading-none" />
          </div>
          <div className="relative w-32 h-32 flex-shrink-0 rounded-full overflow-hidden border-2 border-primary/10 shadow-lg z-10">
            <Image
              alt="Alex D. Product Lead"
              src={AVATAR_IMG}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="relative z-10">
            <p className="font-headline-lg-mobile md:text-[28px] italic text-on-surface mb-8 leading-snug">
              &ldquo;PollPrecision transformed how we gather team feedback. The
              analytics are a game-changer for our weekly planning
              sessions.&rdquo;
            </p>
            <div>
              <h5 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
                Alex D.
              </h5>
              <p className="text-on-surface-variant font-label-mono text-label-mono uppercase tracking-wider">
                Product Lead @ StackHQ
              </p>
            </div>
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
