# NovaRose AI Architecture

NovaRose AI starts with a focused public website and the Rose AI Engine. The code is organized so future agents and client demos can be added by configuration first, not by rewriting the page.

## Current Scope

- Next.js App Router application in `apps/web`.
- Config-driven company, services, pricing, FAQ, and use-case content.
- Reusable UI components in `apps/web/src/components/ui`.
- Marketing components in `apps/web/src/components/marketing`.
- Agent widget in `apps/web/src/components/agent`.
- Agent configs in `apps/web/src/agents`.
- Conversation engine in `apps/web/src/lib/conversation`.
- Conversation API route in `apps/web/src/app/api/conversations`.

## Rose AI Engine

The engine is centered on `ConversationManager`. It owns conversation history, session state, stage transitions, lead extraction, lead scoring, AI requests, and responses.

The current stages are:

- `INTRODUCTION`
- `DISCOVERY`
- `PAIN_DISCOVERY`
- `SOLUTION_RECOMMENDATION`
- `QUALIFICATION`
- `BOOKING`
- `COMPLETE`

Lead extraction runs on every user message and updates name, company, industry, employee count, business context, current workflow, biggest pain point, desired outcome, tools, volume, budget, timeline, and service interest whenever the data can be inferred naturally.

Lead scoring returns score, confidence, hot/warm/cold temperature, and recommended next action.

Vector retrieval runs on each turn against NovaRose service, use-case, process, problem, and solution knowledge. The engine embeds the current customer context with OpenAI embeddings, compares it against cached knowledge chunk embeddings, and injects the most relevant chunks into Rose's prompt.

The AI service calls OpenAI's Responses API when `OPENAI_API_KEY` exists. Without a key, Rose returns a configuration error unless `ENABLE_MOCK_AI=true` is explicitly set for local demos.

The API route streams newline-delimited events so the UI is not coupled to a specific provider protocol.

## Extension Rule

When adding a new demo agent, create a new config in `src/agents` and register it in `src/agents/index.ts`. Avoid hardcoding industry-specific behavior in UI components.

## Deferred

Do not add provider SDKs directly to page components. n8n, Supabase, Resend, CRM providers, dashboards, authentication, and persistent document/vector storage should be introduced behind typed service boundaries in later sprints.
