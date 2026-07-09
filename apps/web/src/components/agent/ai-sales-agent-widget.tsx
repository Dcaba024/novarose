"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { getAgentConfig } from "@/agents";
import { createInitialConversationState, createMessage } from "@/lib/conversation/state";
import type { ConversationSessionState } from "@/types/conversation";
import { AgentChatPanel } from "./agent-chat-panel";
import { readConversationStream } from "./conversation-stream";

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
        <AgentChatPanel
          agent={agent}
          conversationState={conversationState}
          input={input}
          isResponding={isResponding}
          onClose={() => setIsOpen(false)}
          onInputChange={setInput}
          onSubmit={handleSubmit}
        />
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
