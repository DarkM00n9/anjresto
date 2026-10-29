"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "left" | "right" | "zoom";
  className?: string;
}

/** Apparition au scroll (IntersectionObserver + transitions CSS, sans dépendance). */
export function Reveal({ children, delay = 0, direction = "up", className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dir = direction === "left" ? "reveal-left" : direction === "right" ? "reveal-right" : direction === "zoom" ? "reveal-zoom" : "";

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={`reveal ${dir} ${className}`}
    >
      {children}
    </div>
  );
}
