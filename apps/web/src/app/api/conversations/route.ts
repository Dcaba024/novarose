import { getAgentConfig } from "@/agents";
import { getPublicAiErrorMessage } from "@/lib/conversation/ai-service";
import { ConversationManager } from "@/lib/conversation/conversation-manager";
import type { ConversationRequest, ConversationStreamEvent } from "@/types/conversation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ConversationRequest>;
  const message = body.message?.trim();

  if (!message) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const agent = getAgentConfig(body.agentId);
  const manager = new ConversationManager({
    agent,
    initialState: body.state
  });

  if (body.stream) {
    return streamConversation(manager, message);
  }

  try {
    const result = await manager.sendMessage(message);

    return Response.json(result);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: getPublicAiErrorMessage(error)
      },
      { status: 503 }
    );
  }
}

function streamConversation(manager: ConversationManager, message: string) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of manager.streamMessage(message)) {
          controller.enqueue(encoder.encode(serializeEvent(event)));
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            serializeEvent({
              type: "error",
              message: "Rose had trouble responding. Please try again."
            })
          )
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "Content-Type": "application/x-ndjson; charset=utf-8"
    }
  });
}

function serializeEvent(event: ConversationStreamEvent) {
  return `${JSON.stringify(event)}\n`;
}
