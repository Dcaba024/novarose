# NovaRose AI

Sprint 2 adds the Rose AI Engine on top of the Sprint 1 marketing website. The goal is a reusable AI employee foundation, not a generic chatbot.

This version intentionally does not include auth, dashboards, persistent external vector storage, Supabase integration, payments, full CRM sync, or production n8n workflows.

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
- `apps/web/src/components/agent`: Rose chat widget, chat panel, and streamed response parser.
- `apps/web/src/agents`: Agent configuration files for NovaRose AI and future demos.
- `apps/web/src/lib/conversation`: Reusable conversation engine, stage resolver, lead extraction, scoring, OpenAI Responses + embeddings RAG service, and `ConversationManager`.
- `apps/web/src/types`: Shared TypeScript conversation, lead, and marketing types.
- `apps/web/src/app/api/conversations`: Server API boundary used by the chat widget. It streams newline-delimited conversation events.

## Add A New Agent Config

1. Create a new file in `apps/web/src/agents`, for example `roofing-demo.ts`.
2. Export an `AgentConfig` object with a unique `id`, welcome message, mock responses, and CTA.
3. Add the new config to `agentConfigs` in `apps/web/src/agents/index.ts`.
4. Set `NEXT_PUBLIC_DEFAULT_AGENT_ID` in `apps/web/.env.local` if that agent should power the floating widget by default.

## Environment

Copy `.env.example` to `apps/web/.env.local` and set `OPENAI_API_KEY` before using Rose locally. Do not put real secrets in `.env.example`; it is a tracked template and may be overwritten by normal repo edits.

The public marketing site can render with only `NEXT_PUBLIC_DEFAULT_AGENT_ID`, but the Rose AI Engine requires `OPENAI_API_KEY` for real responses.

Set `OPENAI_EMBEDDING_MODEL` to change the retrieval embedding model. Mock responses are disabled by default and require `ENABLE_MOCK_AI=true`.

## Rose AI Engine

Rose is configured as a Senior AI Solutions Consultant in `apps/web/src/agents/nova-rose.ts`.

The engine maintains:

- conversation history
- session state
- conversation stage
- extracted lead data
- lead score, confidence, temperature, and recommended next action
- vector retrieval over NovaRose service, use-case, process, and solution knowledge using OpenAI embeddings

Conversation stages:

- `INTRODUCTION`
- `DISCOVERY`
- `PAIN_DISCOVERY`
- `SOLUTION_RECOMMENDATION`
- `QUALIFICATION`
- `BOOKING`
- `COMPLETE`

The widget calls `/api/conversations` and consumes streamed events. Future agents should reuse `ConversationManager` and require configuration changes first. Each turn embeds the customer query, retrieves the most relevant NovaRose knowledge chunks, and sends the retrieved context to OpenAI's Responses API.

## Sprint 2

Sprint 2 built the Rose AI Engine on top of the marketing site:

- Config-driven agent profiles with `AgentConfig`.
- A reusable `ConversationManager` for conversation state and stage transitions.
- Lead extraction, scoring, temperature, and recommended next action logic.
- OpenAI Responses API support for real streamed responses.
- OpenAI embeddings retrieval over NovaRose service, use-case, process, problem, and solution knowledge.
- Explicit mock mode for local demos with `ENABLE_MOCK_AI=true`.
- A streamed `/api/conversations` route used by the floating Rose chat widget.

## Deferred To Sprint 3

Do not add these yet:

- n8n workflow automation.
- Supabase persistence.
- Authentication.
- Admin dashboards.
- CRM integrations.
- Payments.
