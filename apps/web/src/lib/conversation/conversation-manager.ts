import type { AgentConfig } from "@/agents";
import type {
  ConversationMessage,
  ConversationSessionState,
  ConversationStreamEvent,
  ConversationTurnResult
} from "@/types/conversation";
import type { AiService } from "./ai-service";
import { createAiService, getPublicAiErrorMessage } from "./ai-service";
import { extractLeadData } from "./extraction";
import { scoreLead } from "./scoring";
import { createInitialConversationState, createMessage } from "./state";
import { resolveConversationStage } from "./stages";

export type ConversationManagerOptions = {
  agent: AgentConfig;
  initialState?: ConversationSessionState;
  aiService?: AiService;
};

export class ConversationManager {
  private state: ConversationSessionState;
  private readonly aiService: AiService;

  constructor(private readonly options: ConversationManagerOptions) {
    this.state = options.initialState ?? createInitialConversationState(options.agent);
    this.aiService = options.aiService ?? createAiService();
  }

  getState() {
    return this.state;
  }

  async sendMessage(content: string): Promise<ConversationTurnResult> {
    const preparedState = this.applyUserMessage(content);
    const response = await this.aiService.complete({
      agent: this.options.agent,
      state: preparedState,
      messages: preparedState.messages
    });
    const assistantMessage = createMessage("assistant", response);

    this.state = this.finalizeAssistantMessage(assistantMessage);

    return {
      state: this.state,
      assistantMessage
    };
  }

  async *streamMessage(content: string): AsyncIterable<ConversationStreamEvent> {
    const preparedState = this.applyUserMessage(content);
    let response = "";

    try {
      for await (const chunk of this.aiService.stream({
        agent: this.options.agent,
        state: preparedState,
        messages: preparedState.messages
      })) {
        response += chunk;
        yield {
          type: "token",
          content: chunk
        };
      }

      const assistantMessage = createMessage("assistant", response);
      this.state = this.finalizeAssistantMessage(assistantMessage);

      yield {
        type: "final",
        state: this.state,
        assistantMessage
      };
    } catch (error) {
      console.error(error);
      yield {
        type: "error",
        message: getPublicAiErrorMessage(error)
      };
    }
  }

  private applyUserMessage(content: string): ConversationSessionState {
    const userMessage = createMessage("user", content);
    const messages = [...this.state.messages, userMessage];
    const lead = extractLeadData(content, this.state.lead);
    const leadScore = scoreLead(lead);
    const stage = resolveConversationStage({
      lead,
      leadScore,
      messages
    });

    this.state = {
      ...this.state,
      agentId: this.options.agent.id,
      stage,
      lead,
      leadScore,
      messages,
      updatedAt: new Date().toISOString()
    };

    return this.state;
  }

  private finalizeAssistantMessage(assistantMessage: ConversationMessage): ConversationSessionState {
    const messages = [...this.state.messages, assistantMessage];

    return {
      ...this.state,
      stage: resolveConversationStage({
        lead: this.state.lead,
        leadScore: this.state.leadScore,
        messages
      }),
      messages,
      updatedAt: new Date().toISOString()
    };
  }
}
