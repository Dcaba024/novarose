import Image from "next/image";
import { ArrowRight, Clock, MessageSquareText, Sparkles, TrendingUp } from "lucide-react";
import {
  companyConfig,
  faqs,
  pricingPlans,
  problemPoints,
  processSteps,
  services,
  solutionPoints,
  useCases
} from "@/config";
import { Badge, ButtonLink, Card, Container, Section } from "@/components/ui";
import { FAQItem } from "./faq-item";
import { PricingCard } from "./pricing-card";
import { ServiceCard } from "./service-card";

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--background)]">
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <ServicesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-20">
      <Image
        alt="NovaRose AI operations command center"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-48"
        fill
        priority
        sizes="100vw"
        src="/images/novarose-operations-command-center.png"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#050706_0%,rgba(5,7,6,0.95)_28%,rgba(5,7,6,0.62)_58%,rgba(5,7,6,0.28)_100%)]" />
      <div className="absolute inset-0 miami-grid opacity-40" />

      <Container className="relative grid min-h-[calc(92vh-5rem)] items-center gap-12 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div className="max-w-3xl">
          <Badge>Miami-tech automation studio</Badge>
          <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[1.02] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            {companyConfig.name}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted-strong)] sm:text-xl">
            {companyConfig.tagline}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="#final-cta" size="lg">
              Build my AI system
              <ArrowRight aria-hidden="true" size={18} />
            </ButtonLink>
            <ButtonLink href="#services" size="lg" variant="secondary">
              View services
            </ButtonLink>
          </div>
          <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ["Response", "Instant"],
              ["Focus", "Leads"],
              ["Ops", "Automated"]
            ].map(([label, value]) => (
              <Card className="p-4" key={label}>
                <p className="text-xs uppercase text-[var(--muted)]">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{value}</p>
              </Card>
            ))}
          </div>
        </div>

        <HeroConsole />
      </Container>
    </section>
  );
}

function HeroConsole() {
  const rows = [
    ["Visitor intent", "Sales-ready", "92%"],
    ["Lead summary", "Generated", "Live"],
    ["Booking path", "Prepared", "3 steps"],
    ["Follow-up", "Queued", "Auto"]
  ];

  return (
    <div className="float-soft relative hidden min-h-[590px] lg:block">
      <Card className="absolute right-0 top-6 w-[min(100%,620px)] overflow-hidden p-5">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase text-[var(--muted)]">AI Sales Agent</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)]">Lead capture command center</h2>
          </div>
          <span className="rounded-full border border-[rgba(94,241,197,0.3)] bg-[rgba(94,241,197,0.1)] px-3 py-1 text-xs text-[var(--aqua)]">
            Mock active
          </span>
        </div>
        <div className="grid gap-3">
          {rows.map(([label, status, value]) => (
            <div className="relative overflow-hidden border border-white/10 bg-white/[0.035] p-4" key={label}>
              <div className="absolute left-0 top-0 h-full w-1 bg-[var(--aqua)]" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-[var(--muted)]">{label}</p>
                  <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{status}</p>
                </div>
                <p className="text-sm text-[var(--rose)]">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-4 overflow-hidden border border-white/10 bg-[#0b1714] p-4">
          <div className="agent-scan absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(94,241,197,0.16),transparent)]" />
          <p className="text-xs uppercase text-[var(--muted)]">Outcome</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-strong)]">
            Convert website traffic into qualified conversations, booked calls, and automation-ready lead records.
          </p>
        </div>
      </Card>
    </div>
  );
}

function ProblemSection() {
  return (
    <Section
      description="Most businesses do not need more AI noise. They need faster response, better qualification, and fewer manual handoffs."
      eyebrow="Problem"
      id="problem"
      title="Revenue leaks when attention is manual."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {problemPoints.map((point) => (
          <Card className="flex gap-4 p-6" key={point}>
            <Clock aria-hidden="true" className="mt-1 shrink-0 text-[var(--coral)]" size={20} />
            <p className="text-base leading-7 text-[var(--muted-strong)]">{point}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function SolutionSection() {
  return (
    <Section
      description="Sprint 1 establishes the reusable website, agent configuration, and UI foundation for future demos without connecting production providers yet."
      eyebrow="Solution"
      id="solution"
      title="An AI automation foundation built around outcomes."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {solutionPoints.map((point) => (
          <Card className="min-h-48 p-6" key={point}>
            <Sparkles aria-hidden="true" className="text-[var(--aqua)]" size={22} />
            <p className="mt-6 text-sm leading-6 text-[var(--muted-strong)]">{point}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ServicesSection() {
  return (
    <Section
      description="Each service is a reusable business system, not a one-off widget."
      eyebrow="Services"
      id="services"
      title="Focused systems for lead capture, sales, support, and operations."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <ServiceCard index={index} key={service.title} service={service} />
        ))}
      </div>
    </Section>
  );
}

function HowItWorksSection() {
  return (
    <Section
      description="The first version stays narrow enough to ship, but the workflow is designed so future provider integrations can be added cleanly."
      eyebrow="How it works"
      id="how-it-works"
      title="From bottleneck to launched automation."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {processSteps.map((step, index) => (
          <Card className="p-6" key={step.title}>
            <p className="text-sm text-[var(--rose)]">0{index + 1}</p>
            <h3 className="mt-5 text-xl font-semibold text-[var(--foreground)]">{step.title}</h3>
            <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function UseCasesSection() {
  return (
    <Section
      description="The same agent structure can support future industry demos by changing configuration instead of rebuilding the website."
      eyebrow="Use cases"
      id="use-cases"
      title="Built for service businesses where speed matters."
    >
      <div className="overflow-hidden border-y border-white/10 py-5">
        <div className="marquee flex w-[200%] gap-3">
          {[...useCases, ...useCases].map((useCase, index) => (
            <Card className="min-w-72 p-5" key={`${useCase.industry}-${index}`}>
              <h3 className="text-lg font-semibold text-[var(--foreground)]">{useCase.industry}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{useCase.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}

function PricingSection() {
  return (
    <Section
      description="Pricing starts with workflow scope. Sprint 1 presents clear packaging without adding payments or subscriptions yet."
      eyebrow="Pricing"
      id="pricing"
      title="Custom systems for real business workflows."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </Section>
  );
}

function FAQSection() {
  return (
    <Section
      description="A concise view of what this first version includes and what comes next."
      eyebrow="FAQ"
      id="faq"
      title="Clear scope, clean foundation."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {faqs.map((faq) => (
          <FAQItem faq={faq} key={faq.question} />
        ))}
      </div>
    </Section>
  );
}

function FinalCTASection() {
  return (
    <Section id="final-cta">
      <Card className="relative overflow-hidden p-8 sm:p-12">
        <div className="absolute inset-0 miami-grid opacity-20" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge>Final CTA</Badge>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-5xl">
              Ready to turn missed leads and repetitive work into an AI system?
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Start with one high-value workflow: lead intake, sales response, support, booking, or follow-up automation.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <ButtonLink href={`mailto:${companyConfig.email}?subject=NovaRose%20AI%20Sprint%201%20Call`} size="lg">
              Book a call
              <MessageSquareText aria-hidden="true" size={18} />
            </ButtonLink>
            <ButtonLink href="#pricing" size="lg" variant="secondary">
              Compare packages
              <TrendingUp aria-hidden="true" size={18} />
            </ButtonLink>
          </div>
        </div>
      </Card>
    </Section>
  );
}
