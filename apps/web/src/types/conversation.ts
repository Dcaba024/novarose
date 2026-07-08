export const conversationStages = [
  "INTRODUCTION",
  "DISCOVERY",
  "PAIN_DISCOVERY",
  "SOLUTION_RECOMMENDATION",
  "QUALIFICATION",
  "BOOKING",
  "COMPLETE"
] as const;

export type ConversationStage = (typeof conversationStages)[number];

export type MessageRole = "assistant" | "user" | "system";

export type ConversationMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
};

export type LeadData = {
  name?: string;
  company?: string;
  industry?: string;
  employeeCount?: string;
  biggestPainPoint?: string;
  businessContext?: string;
  currentWorkflow?: string;
  desiredOutcome?: string;
  currentTools?: string;
  volume?: string;
  budget?: string;
  timeline?: string;
  serviceInterest?: string;
};

export type LeadTemperature = "hot" | "warm" | "cold";

export type RecommendedNextAction =
  | "ask_discovery_question"
  | "identify_pain"
  | "recommend_solution"
  | "qualify_budget_timeline"
  | "book_consultation"
  | "conversation_complete";

export type LeadScore = {
  score: number;
  confidence: number;
  temperature: LeadTemperature;
  recommendedNextAction: RecommendedNextAction;
  reasons: string[];
};

export type ConversationSessionState = {
  sessionId: string;
  agentId: string;
  stage: ConversationStage;
  lead: LeadData;
  leadScore: LeadScore;
  messages: ConversationMessage[];
  updatedAt: string;
};

export type ConversationRequest = {
  agentId: string;
  message: string;
  sessionId?: string;
  state?: ConversationSessionState;
  stream?: boolean;
};

export type ConversationTurnResult = {
  state: ConversationSessionState;
  assistantMessage: ConversationMessage;
};

export type ConversationStreamEvent =
  | {
      type: "token";
      content: string;
    }
  | {
      type: "final";
      state: ConversationSessionState;
      assistantMessage: ConversationMessage;
    }
  | {
      type: "error";
      message: string;
    };
