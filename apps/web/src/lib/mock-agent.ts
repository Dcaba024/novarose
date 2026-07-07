import type { AgentConfig } from "@/agents";

export function getMockAgentResponse(agent: AgentConfig, message: string) {
  const normalizedMessage = message.trim().toLowerCase();

  if (normalizedMessage.includes("price") || normalizedMessage.includes("cost")) {
    return "Pricing depends on workflow scope, integrations, and launch timeline. Most first projects start with one high-value lead or automation workflow.";
  }

  if (normalizedMessage.includes("crm") || normalizedMessage.includes("hubspot") || normalizedMessage.includes("salesforce")) {
    return "CRM routing is a strong Sprint 2 candidate. NovaRose AI would map the fields first, then connect the agent output to your CRM through a provider adapter.";
  }

  const responseIndex = Math.min(message.length % agent.mockResponses.length, agent.mockResponses.length - 1);

  return agent.mockResponses[responseIndex];
}
