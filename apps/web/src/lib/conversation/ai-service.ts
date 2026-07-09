import { AiServiceConfigurationError } from "./ai-errors";
import type { AiService } from "./ai-types";
import { MockAiService } from "./mock-ai-service";
import { OpenAiService } from "./openai-service";

export type { AiRequest, AiService } from "./ai-types";
export { AiServiceConfigurationError, AiServiceRequestError, getPublicAiErrorMessage } from "./ai-errors";

export function createAiService(apiKey = process.env.OPENAI_API_KEY): AiService {
  if (apiKey) {
    return new OpenAiService(apiKey);
  }

  if (process.env.ENABLE_MOCK_AI === "true") {
    return new MockAiService();
  }

  return new UnconfiguredAiService();
}

class UnconfiguredAiService implements AiService {
  async complete(): Promise<string> {
    throw new AiServiceConfigurationError("OPENAI_API_KEY is required unless ENABLE_MOCK_AI=true.");
  }

  async *stream() {
    throw new AiServiceConfigurationError("OPENAI_API_KEY is required unless ENABLE_MOCK_AI=true.");
  }
}
