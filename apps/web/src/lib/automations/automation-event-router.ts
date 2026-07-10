import type { ConversationMessage, ConversationSessionState, LeadData } from "@/types/conversation";
import { createAutomationEngine } from "./automation-engine";
import { ConsultationRequestedTrigger } from "./triggers/consultation-requested-trigger";
import { LeadQualifiedTrigger } from "./triggers/lead-qualified-trigger";
import type {
  AutomationEvent,
  AutomationEventType,
  AutomationPayload,
  AutomationResult,
  AutomationTrigger,
  AutomationTriggerContext,
  LeadAutomationStatus
} from "./types";

type AutomationDispatcher = {
  dispatch: (event: AutomationEvent) => Promise<AutomationResult[]>;
};

type AutomationEventRouterOptions = {
  engine?: AutomationDispatcher;
  triggers?: AutomationTrigger[];
};

const defaultTriggers: AutomationTrigger[] = [new LeadQualifiedTrigger(), new ConsultationRequestedTrigger()];

export class AutomationEventRouter {
  private readonly engine: AutomationDispatcher;
  private readonly triggers: AutomationTrigger[];

  constructor(options: AutomationEventRouterOptions = {}) {
    this.engine = options.engine ?? createAutomationEngine();
    this.triggers = options.triggers ?? defaultTriggers;
  }

  async route(context: Omit<AutomationTriggerContext, "timestamp">): Promise<AutomationResult[]> {
    const timestamp = new Date().toISOString();
    const events = this.createEvents({
      ...context,
      timestamp
    });

    const results = await Promise.all(events.map((event) => this.engine.dispatch(event)));

    return results.flat();
  }

  private createEvents(context: AutomationTriggerContext) {
    const eventTypes = [
      ...this.createStateTransitionEventTypes(context),
      ...this.triggers.filter((trigger) => trigger.shouldFire(context)).map((trigger) => trigger.eventType)
    ];

    return uniqueEventTypes(eventTypes).map((eventType) => createAutomationEvent(eventType, context.currentState, context.timestamp));
  }

  private createStateTransitionEventTypes(context: AutomationTriggerContext): AutomationEventType[] {
    const eventTypes: AutomationEventType[] = [];

    if (!hasBasicContactInfo(context.previousState.lead) && hasBasicContactInfo(context.currentState.lead)) {
      eventTypes.push("LEAD_CAPTURED");
    }

    if (context.previousState.stage !== "COMPLETE" && context.currentState.stage === "COMPLETE") {
      eventTypes.push("CONVERSATION_COMPLETED");
    }

    return eventTypes;
  }
}

export function createAutomationEventRouter() {
  return new AutomationEventRouter();
}

export function createAutomationEvent(
  type: AutomationEventType,
  state: ConversationSessionState,
  timestamp: string
): AutomationEvent {
  return {
    id: createEventId(type),
    type,
    payload: createAutomationPayload(type, state, timestamp)
  };
}

function createAutomationPayload(
  type: AutomationEventType,
  state: ConversationSessionState,
  timestamp: string
): AutomationPayload {
  return {
    sessionId: state.sessionId,
    lead: state.lead,
    leadScore: state.leadScore,
    leadStatus: getLeadStatus(type),
    recommendedService: state.lead.serviceInterest ?? "Needs discovery",
    conversationSummary: summarizeConversation(state),
    recommendedNextAction: state.leadScore.recommendedNextAction,
    sourceAgentId: state.agentId,
    timestamp
  };
}

function getLeadStatus(type: AutomationEventType): LeadAutomationStatus {
  if (type === "LEAD_CAPTURED") {
    return "captured";
  }

  if (type === "LEAD_QUALIFIED") {
    return "qualified";
  }

  if (type === "CONSULTATION_REQUESTED") {
    return "consultation_requested";
  }

  return "completed";
}

function hasBasicContactInfo(lead: LeadData) {
  return Boolean(lead.email || lead.phone || lead.name || lead.company);
}

function summarizeConversation(state: ConversationSessionState) {
  const leadSummary = summarizeLead(state.lead);
  const recentMessages = state.messages.slice(-6).map(formatMessage).join(" ");

  return truncate([leadSummary, recentMessages].filter(Boolean).join(" "), 1800);
}

function summarizeLead(lead: LeadData) {
  const details = [
    lead.name ? `Name: ${lead.name}.` : "",
    lead.email ? `Email: ${lead.email}.` : "",
    lead.phone ? `Phone: ${lead.phone}.` : "",
    lead.company ? `Company: ${lead.company}.` : "",
    lead.industry ? `Industry: ${lead.industry}.` : "",
    lead.biggestPainPoint ? `Pain point: ${lead.biggestPainPoint}.` : "",
    lead.desiredOutcome ? `Desired outcome: ${lead.desiredOutcome}.` : "",
    lead.currentTools ? `Tools: ${lead.currentTools}.` : "",
    lead.budget ? `Budget: ${lead.budget}.` : "",
    lead.timeline ? `Timeline: ${lead.timeline}.` : ""
  ].filter(Boolean);

  return details.length ? `Lead details: ${details.join(" ")}` : "";
}

function formatMessage(message: ConversationMessage) {
  return `${message.role}: ${truncate(message.content.replace(/\s+/g, " ").trim(), 240)}`;
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function uniqueEventTypes(eventTypes: AutomationEventType[]) {
  return Array.from(new Set(eventTypes));
}

function createEventId(type: AutomationEventType) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${type.toLowerCase()}-${crypto.randomUUID()}`;
  }

  return `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
