import type { ConversationSessionState, LeadData, LeadScore, RecommendedNextAction } from "@/types/conversation";

export const automationEventTypes = [
  "LEAD_CAPTURED",
  "LEAD_QUALIFIED",
  "CONSULTATION_REQUESTED",
  "CONVERSATION_COMPLETED"
] as const;

export type AutomationEventType = (typeof automationEventTypes)[number];

export type LeadAutomationStatus = "captured" | "qualified" | "consultation_requested" | "completed";

export type AutomationPayload = {
  sessionId: string;
  lead: LeadData;
  leadScore: LeadScore;
  leadStatus: LeadAutomationStatus;
  recommendedService: string;
  conversationSummary: string;
  recommendedNextAction: RecommendedNextAction;
  sourceAgentId: string;
  timestamp: string;
};

export type AutomationEvent = {
  id: string;
  type: AutomationEventType;
  payload: AutomationPayload;
};

export type AutomationResult = {
  adapterId: string;
  adapterName: string;
  eventType: AutomationEventType;
  success: boolean;
  deliveredAt: string;
  message?: string;
  status?: number;
  error?: string;
};

export type AutomationAdapter = {
  id: string;
  name: string;
  isEnabled: () => boolean;
  handle: (event: AutomationEvent) => Promise<AutomationResult>;
};

export type AutomationTriggerContext = {
  previousState: ConversationSessionState;
  currentState: ConversationSessionState;
  userMessage?: string;
  requestedEventType?: AutomationEventType;
  timestamp: string;
};

export type AutomationTrigger = {
  eventType: AutomationEventType;
  shouldFire: (context: AutomationTriggerContext) => boolean;
};
