import type { AgentConfig } from "@/agents";
import type { ConversationSessionState, LeadData } from "@/types/conversation";
import type { ConversationKnowledgeSnippet } from "./knowledge";

export function buildSystemPrompt(
  agent: AgentConfig,
  state: ConversationSessionState,
  relevantKnowledge: ConversationKnowledgeSnippet[]
) {
  const latestUserMessage = getLatestUserMessage(state);
  const customerContext = formatLeadData(state.lead);

  return [
    agent.systemPrompt,
    "",
    `Role: ${agent.role}`,
    `Works for: ${agent.worksFor}`,
    `Mission: ${agent.mission}`,
    "",
    "Primary objectives:",
    ...agent.primaryObjectives.map((objective) => `- ${objective}`),
    "",
    "Communication style:",
    ...agent.communicationStyle.map((style) => `- ${style}`),
    "",
    "Conversation rules:",
    ...agent.conversationRules.map((rule) => `- ${rule}`),
    "",
    "Current customer context Rose must use:",
    ...(customerContext.length ? customerContext : ["- No confirmed customer details yet."]),
    latestUserMessage ? `- Latest customer message: ${latestUserMessage}` : "",
    "",
    "Relevant NovaRose knowledge for this turn:",
    ...(relevantKnowledge.length
      ? relevantKnowledge.map((snippet) => `- ${snippet.title}: ${snippet.content}`)
      : ["- No specific knowledge match yet. Use discovery before recommending a system."]),
    "",
    `Current conversation stage: ${state.stage}`,
    `Current lead data: ${JSON.stringify(state.lead)}`,
    `Current lead score: ${state.leadScore.score}/100 (${state.leadScore.temperature})`,
    `Recommended next action: ${state.leadScore.recommendedNextAction}`,
    "",
    "Turn response requirements:",
    "- Respond as Rose, not as a generic chatbot.",
    "- Start by acknowledging one or two specific details from the customer's latest message or stored context.",
    "- If the customer gave enough detail, recommend one practical workflow tied to their pain, desired outcome, tools, or volume.",
    "- Do not ask for information the customer already provided.",
    "- If the customer asks a direct question, answer it before asking anything else.",
    "- Ask exactly one next-step question, choosing the biggest missing detail: current tools, volume, timeline, budget, decision process, or booking interest.",
    "- Keep the response natural, specific, and under 140 words unless the customer asks for depth.",
    "- Focus on business problems and outcomes before technology."
  ]
    .filter(Boolean)
    .join("\n");
}

function getLatestUserMessage(state: ConversationSessionState) {
  const latestMessage = [...state.messages].reverse().find((message) => message.role === "user");
  return latestMessage?.content ? truncate(latestMessage.content, 1200) : undefined;
}

function formatLeadData(lead: LeadData) {
  const fields: Array<[keyof LeadData, string]> = [
    ["name", "Name"],
    ["company", "Company"],
    ["industry", "Industry"],
    ["employeeCount", "Team size"],
    ["businessContext", "Business context"],
    ["biggestPainPoint", "Pain point"],
    ["currentWorkflow", "Current workflow"],
    ["desiredOutcome", "Desired outcome"],
    ["currentTools", "Current tools"],
    ["volume", "Volume"],
    ["budget", "Budget"],
    ["timeline", "Timeline"],
    ["serviceInterest", "Service interest"]
  ];

  return fields
    .map(([field, label]) => (lead[field] ? `- ${label}: ${lead[field]}` : ""))
    .filter(Boolean);
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}
