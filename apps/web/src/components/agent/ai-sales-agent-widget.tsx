"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Bot, CalendarDays, MessageCircle, Send, X } from "lucide-react";
import { getAgentConfig } from "@/agents";
import { ButtonLink } from "@/components/ui";
import { cn } from "@/lib/cn";
import { createInitialConversationState, createMessage } from "@/lib/conversation/state";
import type { ConversationSessionState, ConversationStreamEvent } from "@/types/conversation";

export function AiSalesAgentWidget() {
  const defaultAgentId = process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID ?? "nova-rose";
  const agent = useMemo(() => getAgentConfig(defaultAgentId), [defaultAgentId]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationSessionState>(() =>
    createInitialConversationState(agent)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message || isResponding) {
      return;
    }

    const userMessage = createMessage("user", message);
    const assistantDraft = createMessage("assistant", "");
    const requestState = conversationState;

    setInput("");
    setIsResponding(true);
    setConversationState((currentState) => ({
      ...currentState,
      messages: [...currentState.messages, userMessage, assistantDraft],
      updatedAt: new Date().toISOString()
    }));

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          agentId: agent.id,
          message,
          state: requestState,
          stream: true
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Conversation request failed.");
      }

      await readConversationStream(response.body, (event) => {
        if (event.type === "token") {
          setConversationState((currentState) => ({
            ...currentState,
            messages: currentState.messages.map((currentMessage) =>
              currentMessage.id === assistantDraft.id
                ? {
                    ...currentMessage,
                    content: `${currentMessage.content}${event.content}`
                  }
                : currentMessage
            ),
            updatedAt: new Date().toISOString()
          }));
        }

        if (event.type === "final") {
          setConversationState(event.state);
        }

        if (event.type === "error") {
          setConversationState((currentState) => ({
            ...currentState,
            messages: currentState.messages.map((currentMessage) =>
              currentMessage.id === assistantDraft.id
                ? {
                    ...currentMessage,
                    content: event.message
                  }
                : currentMessage
            ),
            updatedAt: new Date().toISOString()
          }));
        }
      });
    } catch {
      setConversationState((currentState) => ({
        ...currentState,
        messages: currentState.messages.map((currentMessage) =>
          currentMessage.id === assistantDraft.id
            ? {
                ...currentMessage,
                content: "Rose had trouble responding. Please try again."
              }
            : currentMessage
        ),
        updatedAt: new Date().toISOString()
      }));
    } finally {
      setIsResponding(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <section
          aria-label={agent.name}
          className="luxury-border glass-panel mb-4 flex h-[34rem] w-[calc(100vw-2.5rem)] max-w-[24rem] flex-col overflow-hidden rounded-[8px]"
        >
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(94,241,197,0.12)] text-[var(--aqua)]">
                <Bot aria-hidden="true" size={20} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[var(--foreground)]">{agent.label}</h2>
                <p className="text-xs text-[var(--muted)]">
                  {conversationState.stage.replaceAll("_", " ").toLowerCase()} • {conversationState.leadScore.temperature}
                </p>
              </div>
            </div>
            <button
              aria-label="Close AI Sales Agent"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[var(--muted-strong)] transition hover:bg-white/[0.08]"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {conversationState.messages.map((message) => (
              <div
                className={cn(
                  "max-w-[88%] rounded-[8px] px-3.5 py-3 text-sm leading-6",
                  message.role === "assistant"
                    ? "bg-white/[0.06] text-[var(--muted-strong)]"
                    : "ml-auto bg-[var(--aqua)] text-[var(--ink)]"
                )}
                key={message.id}
              >
                {message.content || "Rose is thinking..."}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 p-4">
            <ButtonLink className="mb-3 w-full" href={agent.ctaHref} size="sm" variant="secondary">
              <CalendarDays aria-hidden="true" size={16} />
              {agent.bookCallLabel}
            </ButtonLink>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="agent-message">
                Message AI Sales Agent
              </label>
              <input
                className="min-h-11 flex-1 rounded-full border border-white/12 bg-white/[0.05] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(94,241,197,0.46)]"
                id="agent-message"
                disabled={isResponding}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a message..."
                value={input}
              />
              <button
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--aqua)] text-[var(--ink)] transition hover:bg-[#8df7d7] disabled:cursor-not-allowed disabled:opacity-55"
                disabled={isResponding}
                type="submit"
              >
                <Send aria-hidden="true" size={17} />
              </button>
            </form>
          </div>
        </section>
      ) : null}

      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close AI Sales Agent" : "Open AI Sales Agent"}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(94,241,197,0.38)] bg-[var(--aqua)] text-[var(--ink)] shadow-[0_18px_55px_rgba(32,201,151,0.24)] transition hover:bg-[#8df7d7]"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        {isOpen ? <X aria-hidden="true" size={22} /> : <MessageCircle aria-hidden="true" size={23} />}
      </button>
    </div>
  );
}

async function readConversationStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: ConversationStreamEvent) => void
) {
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
      if (!line.trim()) {
        continue;
      }

      onEvent(JSON.parse(line) as ConversationStreamEvent);
    }
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as ConversationStreamEvent);
  }
}
