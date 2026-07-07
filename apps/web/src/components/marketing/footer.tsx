import Link from "next/link";
import { companyConfig, navItems } from "@/config";
import { Container } from "@/components/ui";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#040605]">
      <Container className="flex flex-col gap-7 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">{companyConfig.name}</p>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">{companyConfig.tagline}</p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-5 text-sm text-[var(--muted)]">
          {navItems.map((item) => (
            <Link className="transition hover:text-[var(--foreground)]" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
