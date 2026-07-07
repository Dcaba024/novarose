import type { AgentConfig } from "./types";

export const novaRoseAgent: AgentConfig = {
  id: "nova-rose",
  name: "NovaRose AI Sales Agent",
  label: "AI Sales Agent",
  industry: "AI automation",
  welcomeMessage:
    "Welcome to NovaRose AI. Tell me what repetitive work or lead follow-up problem you want to automate.",
  systemPrompt:
    "Qualify the visitor's automation need, identify the business outcome, and guide qualified prospects toward booking a call.",
  qualificationQuestions: [
    "What type of business do you run?",
    "Where are leads or customers waiting too long today?",
    "Which tools should the automation eventually connect to?"
  ],
  mockResponses: [
    "That sounds like a strong fit for an AI lead intake or website sales agent. The next step is mapping the exact handoff from conversation to booked call.",
    "NovaRose AI would start by defining the lead questions, routing rules, and follow-up workflow so the agent creates business value from day one.",
    "For Sprint 1 this is a mock response, but the production version will route qualified leads into your automation stack."
  ],
  bookCallLabel: "Book a call",
  ctaHref: "mailto:hello@novaroseai.com?subject=NovaRose%20AI%20Automation%20Call"
};
