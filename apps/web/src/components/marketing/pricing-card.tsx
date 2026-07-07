import { Check } from "lucide-react";
import type { PricingPlan } from "@/types/marketing";
import { ButtonLink, Card } from "@/components/ui";
import { cn } from "@/lib/cn";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <Card
      className={cn(
        "flex min-h-[30rem] flex-col p-6",
        plan.highlighted && "border-[rgba(94,241,197,0.42)] bg-[rgba(94,241,197,0.055)]"
      )}
    >
      {plan.highlighted ? (
        <span className="mb-5 w-fit rounded-full border border-[rgba(94,241,197,0.32)] bg-[rgba(94,241,197,0.1)] px-3 py-1 text-xs font-semibold text-[var(--aqua)]">
          Most common
        </span>
      ) : null}
      <h3 className="text-2xl font-semibold text-[var(--foreground)]">{plan.name}</h3>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{plan.description}</p>
      <p className="mt-8 text-4xl font-semibold text-[var(--foreground)]">{plan.price}</p>
      <ul className="mt-8 space-y-3">
        {plan.features.map((feature) => (
          <li className="flex gap-3 text-sm text-[var(--muted-strong)]" key={feature}>
            <Check aria-hidden="true" className="mt-0.5 shrink-0 text-[var(--aqua)]" size={16} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <ButtonLink className="mt-auto" href="#final-cta" variant={plan.highlighted ? "primary" : "secondary"}>
        Discuss scope
      </ButtonLink>
    </Card>
  );
}
