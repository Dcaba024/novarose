import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { companyConfig, navItems } from "@/config";
import { ButtonLink, Container } from "@/components/ui";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050706]/78 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between">
        <Link aria-label={`${companyConfig.name} home`} className="flex items-center gap-3" href="/">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(94,241,197,0.34)] bg-[#0b1714]">
            <span className="absolute h-6 w-6 rounded-full border border-[var(--aqua)]" />
            <span className="absolute h-3 w-3 rounded-full bg-[var(--rose)]" />
            <span className="absolute h-10 w-px rotate-45 bg-[rgba(216,182,111,0.48)]" />
          </span>
          <span className="text-sm font-semibold tracking-wide text-[var(--foreground)]">{companyConfig.name}</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <ButtonLink href="#final-cta" size="sm">
          Start
          <ArrowRight aria-hidden="true" size={16} />
        </ButtonLink>
      </Container>
    </header>
  );
}
