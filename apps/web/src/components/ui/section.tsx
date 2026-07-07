import type { ReactNode } from "react";
import { Badge } from "./badge";
import { Container } from "./container";

type SectionProps = {
  children: ReactNode;
  eyebrow?: string;
  id?: string;
  title?: string;
  description?: string;
};

export function Section({ children, description, eyebrow, id, title }: SectionProps) {
  return (
    <section className="relative border-t border-white/10 py-20 sm:py-24" id={id}>
      <Container>
        {(eyebrow || title || description) && (
          <div className="mb-11 max-w-3xl">
            {eyebrow ? <Badge>{eyebrow}</Badge> : null}
            {title ? (
              <h2 className="mt-5 text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl">
                {title}
              </h2>
            ) : null}
            {description ? <p className="mt-5 text-lg leading-8 text-[var(--muted)]">{description}</p> : null}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
