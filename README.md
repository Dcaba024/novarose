# NovaRose AI

NovaRose AI combines the marketing site, the Rose AI Engine, and a provider-agnostic automation layer for qualified lead handoff. The goal is a reusable AI employee foundation, not a generic chatbot.

This version intentionally does not include auth, dashboards, persistent external vector storage, Supabase integration, payments, full CRM sync, or bundled production automation workflows.

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
- `apps/web/src/lib/automations`: Provider-agnostic automation engine, event router, triggers, and adapters.
- `apps/web/src/types`: Shared TypeScript conversation, lead, and marketing types.
- `apps/web/src/app/api/conversations`: Server API boundary used by the chat widget. It streams newline-delimited conversation events.
- `apps/web/src/app/api/automations`: Server API boundary used for browser-initiated automation events such as booking CTA clicks.

## Add A New Agent Config

1. Create a new file in `apps/web/src/agents`, for example `roofing-demo.ts`.
2. Export an `AgentConfig` object with a unique `id`, welcome message, mock responses, and CTA.
3. Add the new config to `agentConfigs` in `apps/web/src/agents/index.ts`.
4. Set `NEXT_PUBLIC_DEFAULT_AGENT_ID` in `apps/web/.env.local` if that agent should power the floating widget by default.

## Environment

Copy `.env.example` to `apps/web/.env.local` and set `OPENAI_API_KEY` before using Rose locally. Do not put real secrets in `.env.example`; it is a tracked template and may be overwritten by normal repo edits.

The public marketing site can render with only `NEXT_PUBLIC_DEFAULT_AGENT_ID`, but the Rose AI Engine requires `OPENAI_API_KEY` for real responses.

Set `OPENAI_EMBEDDING_MODEL` to change the retrieval embedding model. Mock responses are disabled by default and require `ENABLE_MOCK_AI=true`.

Automations run with the mock adapter by default. Set `ENABLE_AUTOMATIONS=false` to disable automation dispatch completely. Set `N8N_WEBHOOK_URL` to add the optional n8n webhook adapter. Set `AUTOMATION_SECRET` only if the receiving workflow should verify the `X-Automation-Secret` header.

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

## Automation Engine

Sprint 4 adds the NovaRose AI Automation Engine in `apps/web/src/lib/automations`.

The automation layer is provider-agnostic:

- `AutomationEvent` describes a business event such as `LEAD_CAPTURED`, `LEAD_QUALIFIED`, `CONSULTATION_REQUESTED`, or `CONVERSATION_COMPLETED`.
- `AutomationPayload` carries the structured handoff: lead data, lead score, lead status, recommended service, conversation summary, recommended next action, source agent id, and timestamp.
- `AutomationTrigger` decides when conversation state should create an event.
- `AutomationAdapter` delivers the event to an external system.
- `AutomationEngine` routes each event to every enabled adapter and returns success or error results.

`ConversationManager` fires automation events after lead extraction, scoring, and stage resolution. Automation failures are caught and logged only in development, so webhook errors do not break user chat.

### Mock Adapter

`MockAutomationAdapter` is enabled by default. It accepts automation events and returns a successful mock result without calling external services. This keeps local development and demos working before any real workflow provider is connected.

### n8n Adapter

`N8nAutomationAdapter` is optional. It is only added when `N8N_WEBHOOK_URL` is present in the server environment.

To connect n8n later:

1. Create an n8n webhook workflow.
2. Set `N8N_WEBHOOK_URL` in `apps/web/.env.local`.
3. Optionally set `AUTOMATION_SECRET` and validate the `X-Automation-Secret` header in n8n.
4. Keep `ENABLE_AUTOMATIONS` unset or set it to `true`.

Example n8n payload:

```json
{
  "eventId": "lead_qualified-00000000-0000-0000-0000-000000000000",
  "eventType": "LEAD_QUALIFIED",
  "payload": {
    "sessionId": "session-id",
    "lead": {
      "name": "Dylan",
      "email": "contact@example.com",
      "company": "Example Co",
      "biggestPainPoint": "Leads wait too long for follow-up",
      "serviceInterest": "AI Lead Intake Systems"
    },
    "leadScore": {
      "score": 72,
      "confidence": 46,
      "temperature": "hot",
      "recommendedNextAction": "book_consultation",
      "reasons": ["Visitor shared contact details."]
    },
    "leadStatus": "qualified",
    "recommendedService": "AI Lead Intake Systems",
    "conversationSummary": "Lead details and recent conversation context.",
    "recommendedNextAction": "book_consultation",
    "sourceAgentId": "nova-rose",
    "timestamp": "2026-07-09T12:00:00.000Z"
  }
}
```

Future providers should be added as new adapters that implement `AutomationAdapter`, for example `ZapierAutomationAdapter`, `MakeAutomationAdapter`, `HubSpotAutomationAdapter`, `DiscordAutomationAdapter`, `GmailAutomationAdapter`, or `ResendAutomationAdapter`. The platform should continue to dispatch `AutomationEvent` objects and avoid provider-specific logic inside `ConversationManager`.

## Sprint 2

Sprint 2 built the Rose AI Engine on top of the marketing site:

- Config-driven agent profiles with `AgentConfig`.
- A reusable `ConversationManager` for conversation state and stage transitions.
- Lead extraction, scoring, temperature, and recommended next action logic.
- OpenAI Responses API support for real streamed responses.
- OpenAI embeddings retrieval over NovaRose service, use-case, process, problem, and solution knowledge.
- Explicit mock mode for local demos with `ENABLE_MOCK_AI=true`.
- A streamed `/api/conversations` route used by the floating Rose chat widget.

## Sprint 4

Sprint 4 built the provider-agnostic automation foundation:

- Typed automation events and payloads.
- Reusable automation engine and event router.
- Mock adapter for local demos and tests.
- Optional n8n webhook adapter.
- Conversation triggers for captured leads, qualified leads, consultation requests, and completed conversations.
- Browser CTA tracking through a server route that keeps secrets out of the client.

## Deferred Beyond Sprint 4

Do not add these yet:

- Supabase persistence.
- Authentication.
- Admin dashboards.
- CRM integrations.
- Payments.
