import type { PropsWithChildren } from "react";
import { Container } from "./Container";

interface SectionProps extends PropsWithChildren {
  id?: string;
  className?: string;
  spacing?: string;
}

export function Section({ id, className = "", spacing = "py-16 md:py-24", children }: SectionProps) {
  return (
    <section id={id} className={`${spacing} ${className}`}>
      <Container>{children}</Container>
    </section>
  );
}
