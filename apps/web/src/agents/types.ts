export type AgentConfig = {
  id: string;
  name: string;
  label: string;
  industry: string;
  role: string;
  worksFor: string;
  mission: string;
  primaryObjectives: string[];
  communicationStyle: string[];
  conversationRules: string[];
  welcomeMessage: string;
  systemPrompt: string;
  qualificationQuestions: string[];
  mockResponses: string[];
  bookCallLabel: string;
  ctaHref: string;
  model: {
    provider: "openai" | "mock";
    name: string;
    temperature: number;
  };
};
