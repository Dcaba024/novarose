import type { AgentConfig } from "@/agents";
import type { ConversationMessage, ConversationSessionState } from "@/types/conversation";

export type AiRequest = {
  agent: AgentConfig;
  state: ConversationSessionState;
  messages: ConversationMessage[];
};

export type AiService = {
  complete(request: AiRequest): Promise<string>;
  stream(request: AiRequest): AsyncIterable<string>;
};
