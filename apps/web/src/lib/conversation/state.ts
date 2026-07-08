import type { AgentConfig } from "@/agents";
import type { ConversationMessage, ConversationSessionState } from "@/types/conversation";
import { emptyLeadScore } from "./scoring";

export function createMessage(role: ConversationMessage["role"], content: string): ConversationMessage {
  return {
    id: createId(),
    role,
    content,
    createdAt: new Date().toISOString()
  };
}

export function createInitialConversationState(agent: AgentConfig, sessionId = createId()): ConversationSessionState {
  return {
    sessionId,
    agentId: agent.id,
    stage: "INTRODUCTION",
    lead: {},
    leadScore: emptyLeadScore,
    messages: [createMessage("assistant", agent.welcomeMessage)],
    updatedAt: new Date().toISOString()
  };
}

export function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
