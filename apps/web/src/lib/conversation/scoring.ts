import type { LeadData, LeadScore } from "@/types/conversation";

export function scoreLead(lead: LeadData): LeadScore {
  const reasons: string[] = [];
  let score = 0;

  if (lead.name) {
    score += 8;
    reasons.push("Visitor shared a name.");
  }

  if (lead.email || lead.phone) {
    score += 12;
    reasons.push("Visitor shared contact details.");
  }

  if (lead.company) {
    score += 10;
    reasons.push("Company context is available.");
  }

  if (lead.industry) {
    score += 10;
    reasons.push("Industry is identified.");
  }

  if (lead.employeeCount) {
    score += 8;
    reasons.push("Team size is known.");
  }

  if (lead.biggestPainPoint) {
    score += 18;
    reasons.push("Operational pain point is clear.");
  }

  if (lead.currentWorkflow) {
    score += 10;
    reasons.push("Current workflow context is available.");
  }

  if (lead.desiredOutcome) {
    score += 10;
    reasons.push("Desired business outcome is clear.");
  }

  if (lead.currentTools) {
    score += 8;
    reasons.push("Current tool stack is known.");
  }

  if (lead.volume) {
    score += 8;
    reasons.push("Lead or task volume is known.");
  }

  if (lead.serviceInterest) {
    score += 16;
    reasons.push("Service interest is present.");
  }

  if (lead.budget) {
    score += 12;
    reasons.push("Budget signal is present.");
  }

  if (lead.timeline) {
    score += 12;
    reasons.push("Timeline signal is present.");
  }

  const cappedScore = Math.min(score, 100);
  const completedFields = Object.values(lead).filter(Boolean).length;
  const confidence = Math.min(Math.round((completedFields / 15) * 100), 100);

  if (cappedScore >= 70) {
    return {
      score: cappedScore,
      confidence,
      temperature: "hot",
      recommendedNextAction: lead.budget && lead.timeline ? "book_consultation" : "qualify_budget_timeline",
      reasons
    };
  }

  if (cappedScore >= 40) {
    return {
      score: cappedScore,
      confidence,
      temperature: "warm",
      recommendedNextAction: lead.budget && lead.timeline ? "recommend_solution" : "qualify_budget_timeline",
      reasons
    };
  }

  return {
    score: cappedScore,
    confidence,
    temperature: "cold",
    recommendedNextAction: lead.biggestPainPoint ? "recommend_solution" : "ask_discovery_question",
    reasons
  };
}

export const emptyLeadScore: LeadScore = {
  score: 0,
  confidence: 0,
  temperature: "cold",
  recommendedNextAction: "ask_discovery_question",
  reasons: []
};
