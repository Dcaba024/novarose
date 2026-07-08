import type { AgentConfig } from "@/agents";
import type { ConversationMessage, ConversationSessionState, LeadData } from "@/types/conversation";
import type { ConversationKnowledgeSnippet } from "./knowledge";
import { retrieveConversationKnowledge } from "./knowledge";
import { buildSystemPrompt } from "./prompt";

export type AiRequest = {
  agent: AgentConfig;
  state: ConversationSessionState;
  messages: ConversationMessage[];
};

export type AiService = {
  complete(request: AiRequest): Promise<string>;
  stream(request: AiRequest): AsyncIterable<string>;
};

export function createAiService(apiKey = process.env.OPENAI_API_KEY): AiService {
  if (apiKey) {
    return new OpenAiService(apiKey);
  }

  if (process.env.ENABLE_MOCK_AI === "true") {
    return new MockAiService();
  }

  return new UnconfiguredAiService();
}

export class AiServiceConfigurationError extends Error {}

export class AiServiceRequestError extends Error {}

export function getPublicAiErrorMessage(error: unknown) {
  if (error instanceof AiServiceConfigurationError) {
    return "Rose is not connected to OpenAI yet. Add OPENAI_API_KEY to apps/web/.env.local and restart the dev server.";
  }

  if (error instanceof AiServiceRequestError) {
    return "Rose had trouble reaching OpenAI. Please check the server logs and try again.";
  }

  return "Rose had trouble responding. Please try again.";
}

class UnconfiguredAiService implements AiService {
  async complete(): Promise<string> {
    throw new AiServiceConfigurationError("OPENAI_API_KEY is required unless ENABLE_MOCK_AI=true.");
  }

  async *stream() {
    throw new AiServiceConfigurationError("OPENAI_API_KEY is required unless ENABLE_MOCK_AI=true.");
  }
}

class MockAiService implements AiService {
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

class OpenAiService implements AiService {
  constructor(private readonly apiKey: string) {}

  async complete(request: AiRequest) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(await this.createResponsesPayload(request, false))
    });

    if (!response.ok) {
      throw await createOpenAiRequestError(response, "OpenAI Responses request failed");
    }

    const data = (await response.json()) as OpenAiResponse;
    const content = getResponseText(data);

    if (!content) {
      throw new AiServiceRequestError("OpenAI Responses request did not return text.");
    }

    return content;
  }

  async *stream(request: AiRequest) {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(await this.createResponsesPayload(request, true))
    });

    if (!response.ok || !response.body) {
      throw await createOpenAiRequestError(response, "OpenAI Responses stream failed");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine.startsWith("data:")) {
          continue;
        }

        const payload = trimmedLine.replace(/^data:\s*/, "");

        if (payload === "[DONE]") {
          return;
        }

        let event: OpenAiResponseStreamEvent;

        try {
          event = JSON.parse(payload) as OpenAiResponseStreamEvent;
        } catch {
          continue;
        }

        if (event.type === "response.failed") {
          throw new AiServiceRequestError(event.response?.error?.message ?? "OpenAI Responses stream failed.");
        }

        const content = getStreamTextDelta(event);

        if (content) {
          yield content;
        }
      }
    }
  }

  private async createResponsesPayload(request: AiRequest, stream: boolean) {
    const relevantKnowledge = await retrieveConversationKnowledge({
      apiKey: this.apiKey,
      lead: request.state.lead,
      messages: request.state.messages
    });

    return {
      model: request.agent.model.name,
      instructions: buildSystemPrompt(request.agent, request.state, relevantKnowledge),
      input: toResponseInput(request),
      temperature: request.agent.model.temperature,
      max_output_tokens: 260,
      store: false,
      stream,
      metadata: {
        agent_id: request.agent.id,
        session_id: request.state.sessionId,
        retrieval: "openai_embeddings"
      }
    };
  }
}

type OpenAiResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

type OpenAiResponseStreamEvent = {
  type?: string;
  delta?: string;
  response?: {
    error?: {
      message?: string;
    };
  };
};

function toResponseInput(request: AiRequest) {
  return request.messages
    .filter((message) => message.role !== "system")
    .slice(-12)
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content
    }));
}

function getResponseText(response: OpenAiResponse) {
  if (response.output_text) {
    return response.output_text;
  }

  return (
    response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === "output_text" && content.text)
      .map((content) => content.text)
      .join("") ?? ""
  );
}

function getStreamTextDelta(event: OpenAiResponseStreamEvent) {
  if (event.type === "response.output_text.delta") {
    return event.delta ?? "";
  }

  return "";
}

async function createOpenAiRequestError(response: Response, fallbackMessage: string) {
  const body = (await response.json().catch(() => ({}))) as OpenAiResponse;
  return new AiServiceRequestError(body.error?.message ?? `${fallbackMessage} with status ${response.status}.`);
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
