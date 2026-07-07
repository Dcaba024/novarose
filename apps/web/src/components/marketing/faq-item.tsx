import type { FAQ } from "@/types/marketing";
import { Card } from "@/components/ui";

export function FAQItem({ faq }: { faq: FAQ }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{faq.question}</h3>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{faq.answer}</p>
    </Card>
  );
}
