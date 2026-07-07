import type { AgentConfig } from "./types";

export const lawFirmDemoAgent: AgentConfig = {
  id: "law-firm-demo",
  name: "Law Firm Intake Demo Agent",
  label: "Legal Intake Demo",
  industry: "Law firm",
  welcomeMessage:
    "Tell me what type of legal matter you need help with. I can collect basic intake details and route next steps.",
  systemPrompt:
    "Collect safe high-level intake context for a law firm demo. Do not provide legal advice. Route urgent or complex issues to a qualified professional.",
  qualificationQuestions: [
    "What type of matter is this?",
    "What county or state is involved?",
    "Is there a deadline or upcoming court date?"
  ],
  mockResponses: [
    "I can help collect intake details for a consultation request. I cannot provide legal advice, but I can help route this to the right team.",
    "A law firm workflow would summarize the matter, flag urgency, and create a clean handoff for staff review.",
    "This demo response shows how an industry-specific agent can reuse the NovaRose AI foundation."
  ],
  bookCallLabel: "Request consultation",
  ctaHref: "mailto:hello@novaroseai.com?subject=Law%20Firm%20AI%20Demo"
};
