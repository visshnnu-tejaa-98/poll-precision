"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

type Props = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function RevealSection({ className = "", children, ...props }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.classList.add("opacity-0", "translate-y-10");
    el.classList.remove("opacity-100", "translate-y-0");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 opacity-100 translate-y-0 ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
