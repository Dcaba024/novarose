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
