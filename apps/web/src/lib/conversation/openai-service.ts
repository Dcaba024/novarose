import { AiServiceRequestError } from "./ai-errors";
import type { AiRequest, AiService } from "./ai-types";
import { retrieveConversationKnowledge } from "./knowledge";
import { buildSystemPrompt } from "./prompt";

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

export class OpenAiService implements AiService {
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

    for await (const event of readServerSentEvents(response.body)) {
      if (event.type === "response.failed") {
        throw new AiServiceRequestError(event.response?.error?.message ?? "OpenAI Responses stream failed.");
      }

      const content = getStreamTextDelta(event);

      if (content) {
        yield content;
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

async function* readServerSentEvents(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
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
      const event = parseResponseStreamLine(line);

      if (event) {
        yield event;
      }
    }
  }
}

function parseResponseStreamLine(line: string) {
  const trimmedLine = line.trim();

  if (!trimmedLine.startsWith("data:")) {
    return undefined;
  }

  const payload = trimmedLine.replace(/^data:\s*/, "");

  if (payload === "[DONE]") {
    return undefined;
  }

  try {
    return JSON.parse(payload) as OpenAiResponseStreamEvent;
  } catch {
    return undefined;
  }
}
