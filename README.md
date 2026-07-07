# NovaRose AI

Sprint 1 builds the first production-quality version of `novaroseai.com`: a premium dark-mode marketing website plus a small reusable foundation for future AI agent demos.

This sprint intentionally does not include auth, dashboards, RAG, Supabase integration, payments, live OpenAI calls, full CRM sync, or production n8n workflows.

## Run Locally

```bash
npm install
npm run dev
```

The web app runs from `apps/web`. If port `3000` is busy, Next.js will choose the next available port.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## Architecture

The app uses Next.js App Router, TypeScript, and Tailwind CSS.

- `apps/web/src/app`: App Router routes, metadata, and global styles.
- `apps/web/src/config`: Company, navigation, services, pricing, FAQ, and landing-page content.
- `apps/web/src/components/ui`: Reusable UI primitives such as `Button`, `Section`, `Card`, `Badge`, and `Container`.
- `apps/web/src/components/marketing`: Marketing-specific components such as `Navbar`, `Footer`, `ServiceCard`, `PricingCard`, and `FAQItem`.
- `apps/web/src/components/agent`: Sprint 1 mock AI Sales Agent widget.
- `apps/web/src/agents`: Agent configuration files for NovaRose AI and future demos.
- `apps/web/src/lib`: Small shared helpers.
- `apps/web/src/types`: Shared TypeScript types.

## Add A New Agent Config

1. Create a new file in `apps/web/src/agents`, for example `roofing-demo.ts`.
2. Export an `AgentConfig` object with a unique `id`, welcome message, mock responses, and CTA.
3. Add the new config to `agentConfigs` in `apps/web/src/agents/index.ts`.
4. Set `NEXT_PUBLIC_DEFAULT_AGENT_ID` in `.env.local` if that agent should power the floating widget by default.

## Environment

Copy `.env.example` to `.env.local` when local secrets are needed.

Sprint 1 only uses `NEXT_PUBLIC_DEFAULT_AGENT_ID`. The other variables are placeholders for Sprint 2 provider integration.

## Sprint 2

Sprint 2 should add the first real provider-backed workflow:

- OpenAI agent runtime behind a typed service boundary.
- n8n webhook adapter for lead or booking automation.
- Supabase schema for captured leads and conversation summaries.
- Server Action for submitting qualified leads.
- Basic admin-safe logging and error handling.
- One industry demo agent wired to real form or chat submission.
