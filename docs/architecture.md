# Sprint 1 Architecture

NovaRose AI is starting with a focused public website and a mock AI Sales Agent. The code is organized so future agents and client demos can be added by configuration first, not by rewriting the page.

## Current Scope

- Next.js App Router application in `apps/web`.
- Config-driven company, services, pricing, FAQ, and use-case content.
- Reusable UI components in `apps/web/src/components/ui`.
- Marketing components in `apps/web/src/components/marketing`.
- Mock agent widget in `apps/web/src/components/agent`.
- Agent configs in `apps/web/src/agents`.

## Extension Rule

When adding a new demo agent, create a new config in `src/agents` and register it in `src/agents/index.ts`. Avoid hardcoding industry-specific behavior in UI components.

## Deferred To Sprint 2

Do not add provider SDKs directly to page components. OpenAI, n8n, Supabase, Resend, and CRM providers should be introduced behind small typed service boundaries when Sprint 2 begins.
