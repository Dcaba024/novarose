import { getAgentConfig } from "@/agents";
import { ConversationManager } from "@/lib/conversation/conversation-manager";
import type { AutomationEventType } from "@/lib/automations/types";
import { automationEventTypes } from "@/lib/automations/types";
import type { ConversationSessionState } from "@/types/conversation";

export const dynamic = "force-dynamic";

type AutomationTrackingRequest = {
  agentId?: string;
  eventType?: AutomationEventType;
  state?: ConversationSessionState;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<AutomationTrackingRequest>;

  if (!isAutomationEventType(body.eventType)) {
    return Response.json({ error: "A valid automation event type is required." }, { status: 400 });
  }

  const agent = getAgentConfig(body.agentId);
  const manager = new ConversationManager({
    agent,
    initialState: body.state
  });
  const results = await manager.trackAutomationEvent(body.eventType);

  return Response.json(
    {
      results
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}

function isAutomationEventType(value: unknown): value is AutomationEventType {
  return typeof value === "string" && automationEventTypes.includes(value as AutomationEventType);
}
