"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Bot, CalendarDays, MessageCircle, Send, X } from "lucide-react";
import { getAgentConfig } from "@/agents";
import { ButtonLink } from "@/components/ui";
import { getMockAgentResponse } from "@/lib/mock-agent";
import { cn } from "@/lib/cn";

type ChatMessage = {
  id: string;
  role: "agent" | "user";
  content: string;
};

export function AiSalesAgentWidget() {
  const defaultAgentId = process.env.NEXT_PUBLIC_DEFAULT_AGENT_ID ?? "nova-rose";
  const agent = useMemo(() => getAgentConfig(defaultAgentId), [defaultAgentId]);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: agent.welcomeMessage
    }
  ]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();

    if (!message) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message
    };
    const agentMessage: ChatMessage = {
      id: `agent-${Date.now()}`,
      role: "agent",
      content: getMockAgentResponse(agent, message)
    };

    setMessages((currentMessages) => [...currentMessages, userMessage, agentMessage]);
    setInput("");
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
                <p className="text-xs text-[var(--muted)]">Mock Sprint 1 assistant</p>
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
            {messages.map((message) => (
              <div
                className={cn(
                  "max-w-[88%] rounded-[8px] px-3.5 py-3 text-sm leading-6",
                  message.role === "agent"
                    ? "bg-white/[0.06] text-[var(--muted-strong)]"
                    : "ml-auto bg-[var(--aqua)] text-[var(--ink)]"
                )}
                key={message.id}
              >
                {message.content}
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
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a message..."
                value={input}
              />
              <button
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--aqua)] text-[var(--ink)] transition hover:bg-[#8df7d7]"
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
