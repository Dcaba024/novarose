import type { FormEvent } from "react";
import { Bot, CalendarDays, Send, X } from "lucide-react";
import type { AgentConfig } from "@/agents";
import { ButtonLink } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ConversationSessionState } from "@/types/conversation";

type AgentChatPanelProps = {
  agent: AgentConfig;
  conversationState: ConversationSessionState;
  input: string;
  isResponding: boolean;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AgentChatPanel({
  agent,
  conversationState,
  input,
  isResponding,
  onClose,
  onInputChange,
  onSubmit
}: AgentChatPanelProps) {
  return (
    <section
      aria-label={agent.name}
      className="luxury-border glass-panel mb-4 flex h-[34rem] w-[calc(100vw-2.5rem)] max-w-[24rem] flex-col overflow-hidden rounded-[8px]"
    >
      <AgentChatHeader agent={agent} conversationState={conversationState} onClose={onClose} />
      <AgentMessageList conversationState={conversationState} />
      <AgentChatComposer
        agent={agent}
        input={input}
        isResponding={isResponding}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
      />
    </section>
  );
}

function AgentChatHeader({
  agent,
  conversationState,
  onClose
}: Pick<AgentChatPanelProps, "agent" | "conversationState" | "onClose">) {
  return (
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
        onClick={onClose}
        type="button"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  );
}

function AgentMessageList({ conversationState }: Pick<AgentChatPanelProps, "conversationState">) {
  return (
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
  );
}

function AgentChatComposer({
  agent,
  input,
  isResponding,
  onInputChange,
  onSubmit
}: Pick<AgentChatPanelProps, "agent" | "input" | "isResponding" | "onInputChange" | "onSubmit">) {
  return (
    <div className="border-t border-white/10 p-4">
      <ButtonLink className="mb-3 w-full" href={agent.ctaHref} size="sm" variant="secondary">
        <CalendarDays aria-hidden="true" size={16} />
        {agent.bookCallLabel}
      </ButtonLink>
      <form className="flex gap-2" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="agent-message">
          Message AI Sales Agent
        </label>
        <input
          className="min-h-11 flex-1 rounded-full border border-white/12 bg-white/[0.05] px-4 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[rgba(94,241,197,0.46)]"
          disabled={isResponding}
          id="agent-message"
          onChange={(event) => onInputChange(event.target.value)}
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
  );
}
