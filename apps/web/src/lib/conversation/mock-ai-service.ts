import type { LeadData } from "@/types/conversation";
import type { AiRequest, AiService } from "./ai-types";
import type { ConversationKnowledgeSnippet } from "./knowledge";

export class MockAiService implements AiService {
  async complete(request: AiRequest) {
    return createMockResponse(request);
  }

  async *stream(request: AiRequest) {
    const response = createMockResponse(request);
    const words = response.split(/(\s+)/);

    for (const word of words) {
      yield word;
    }
  }
}

function createMockResponse({ state }: AiRequest) {
  const lead = state.lead;
  const knowledge = getMockKnowledge(lead);
  const primaryKnowledge = knowledge[0];
  const recommendation = lead.serviceInterest ?? primaryKnowledge?.title ?? "Custom AI Workflow Automation";
  const customer = describeCustomer(lead);
  const need = describeNeed(lead);
  const nextQuestion = chooseNextQuestion(lead);

  if (state.stage === "BOOKING" || state.leadScore.recommendedNextAction === "book_consultation") {
    return `This sounds like a strong fit for a consultation. Based on ${customer} and ${need}, I would map the first workflow around the bottleneck with the clearest revenue impact. Would you like to book a call so we can outline that system?`;
  }

  if ((state.stage === "SOLUTION_RECOMMENDATION" || state.stage === "QUALIFICATION") && need) {
    return `Based on ${customer} and ${need}, I would start with ${recommendation}: ${summarizeKnowledge(primaryKnowledge)} ${nextQuestion}`;
  }

  if (!lead.industry && !lead.company && !lead.businessContext) {
    return "That helps. To make the recommendation specific, what kind of business do you run?";
  }

  if (!lead.biggestPainPoint && !lead.desiredOutcome) {
    return "Understood. Where does your team lose the most time right now: responding to leads, answering repeat questions, scheduling, follow-up, or internal admin?";
  }

  return `That gives me a clearer picture. A focused first automation should address ${need} before expanding into more systems. ${nextQuestion}`;
}

function describeCustomer(lead: LeadData) {
  if (lead.company && lead.industry) {
    return `${lead.company}, your ${lead.industry} business`;
  }

  if (lead.company) {
    return lead.company;
  }

  if (lead.industry) {
    return `your ${lead.industry} business`;
  }

  if (lead.businessContext) {
    return lead.businessContext;
  }

  return "your business";
}

function describeNeed(lead: LeadData) {
  if (lead.desiredOutcome) {
    return `your goal: "${lead.desiredOutcome}"`;
  }

  if (lead.biggestPainPoint) {
    return `the bottleneck around "${lead.biggestPainPoint}"`;
  }

  const value = lead.currentWorkflow;

  if (!value) {
    return "";
  }

  return `the workflow you described: "${value}"`;
}

function summarizeKnowledge(snippet: ConversationKnowledgeSnippet | undefined) {
  if (!snippet) {
    return "the workflow should collect the right context, qualify the next step, and reduce manual handoffs.";
  }

  return snippet.content;
}

function chooseNextQuestion(lead: LeadData) {
  if (!lead.currentTools) {
    return "What tool, inbox, CRM, or calendar does your team use to manage that today?";
  }

  if (!lead.volume) {
    return "About how many of these requests or leads does your team handle each week or month?";
  }

  if (!lead.timeline) {
    return "How soon would you want a first version of this workflow live if the scope made sense?";
  }

  if (!lead.budget) {
    return "Do you already have a budget range in mind for solving this, or should we size it around the first workflow?";
  }

  return "Would you like to book a call so we can map the first version together?";
}

function getMockKnowledge(lead: LeadData): ConversationKnowledgeSnippet[] {
  if (lead.serviceInterest) {
    return [
      {
        title: lead.serviceInterest,
        content: "A focused workflow should collect context, qualify intent, route the next step, and reduce manual handoffs.",
        tags: []
      }
    ];
  }

  return [];
}
