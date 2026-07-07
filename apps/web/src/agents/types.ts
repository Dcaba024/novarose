export type AgentConfig = {
  id: string;
  name: string;
  label: string;
  industry: string;
  welcomeMessage: string;
  systemPrompt: string;
  qualificationQuestions: string[];
  mockResponses: string[];
  bookCallLabel: string;
  ctaHref: string;
};
