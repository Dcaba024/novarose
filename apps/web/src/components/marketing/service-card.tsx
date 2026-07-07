import { Bot, CalendarClock, Headphones, MailPlus, Route, Workflow } from "lucide-react";
import type { Service } from "@/types/marketing";
import { Card } from "@/components/ui";

const icons = [Route, Bot, Headphones, MailPlus, CalendarClock, Workflow];

export function ServiceCard({ index, service }: { index: number; service: Service }) {
  const Icon = icons[index] ?? Bot;

  return (
    <Card className="group flex min-h-72 flex-col p-6 transition hover:border-white/25">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(94,241,197,0.12)] text-[var(--aqua)]">
        <Icon aria-hidden="true" size={21} />
      </div>
      <h3 className="text-xl font-semibold text-[var(--foreground)]">{service.title}</h3>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{service.description}</p>
      <p className="mt-auto pt-8 text-sm font-medium text-[var(--rose)]">{service.outcome}</p>
    </Card>
  );
}
