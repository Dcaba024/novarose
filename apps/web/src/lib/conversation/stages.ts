import type { ConversationMessage, ConversationStage, LeadData, LeadScore } from "@/types/conversation";

export function resolveConversationStage({
  lead,
  leadScore,
  messages
}: {
  lead: LeadData;
  leadScore: LeadScore;
  messages: ConversationMessage[];
}): ConversationStage {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const normalizedLastMessage = lastUserMessage?.content.toLowerCase() ?? "";
  const wantsConsultation = /\b(?:book|schedule|set up)\s+(?:a\s+)?(?:call|consultation|demo|meeting)\b/.test(
    normalizedLastMessage
  );

  if (/\b(booked|scheduled|thanks|thank you|done)\b/.test(normalizedLastMessage)) {
    return "COMPLETE";
  }

  const userMessageCount = messages.filter((message) => message.role === "user").length;

  if (userMessageCount === 0) {
    return "INTRODUCTION";
  }

  if ((wantsConsultation && lead.serviceInterest) || (lead.serviceInterest && lead.timeline && lead.budget)) {
    return "BOOKING";
  }

  if (lead.serviceInterest && (lead.biggestPainPoint || lead.desiredOutcome) && leadScore.score >= 45) {
    return "QUALIFICATION";
  }

  if ((lead.biggestPainPoint || lead.desiredOutcome) && (lead.industry || lead.company || lead.businessContext)) {
    return "SOLUTION_RECOMMENDATION";
  }

  if (!lead.biggestPainPoint && !lead.desiredOutcome) {
    return "PAIN_DISCOVERY";
  }

  return "DISCOVERY";
}
