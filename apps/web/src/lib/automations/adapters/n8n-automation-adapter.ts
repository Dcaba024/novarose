import type { AutomationAdapter, AutomationEvent, AutomationResult } from "../types";

type N8nAutomationAdapterOptions = {
  webhookUrl?: string;
  secret?: string;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 5000;

export class N8nAutomationAdapter implements AutomationAdapter {
  readonly id = "n8n";
  readonly name = "n8n Webhook Adapter";
  private readonly webhookUrl?: string;
  private readonly secret?: string;
  private readonly timeoutMs: number;

  constructor(options: N8nAutomationAdapterOptions = {}) {
    this.webhookUrl = options.webhookUrl?.trim();
    this.secret = options.secret?.trim();
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  isEnabled() {
    return Boolean(this.webhookUrl);
  }

  async handle(event: AutomationEvent): Promise<AutomationResult> {
    if (!this.webhookUrl) {
      return this.createResult(event, false, "n8n webhook URL is not configured.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.webhookUrl, {
        method: "POST",
        headers: this.createHeaders(),
        body: JSON.stringify({
          eventId: event.id,
          eventType: event.type,
          payload: event.payload
        }),
        signal: controller.signal
      });

      return this.createResult(
        event,
        response.ok,
        response.ok ? `n8n accepted ${event.type}.` : `n8n returned HTTP ${response.status}.`,
        response.status
      );
    } catch (error) {
      return this.createResult(event, false, getSafeErrorMessage(error));
    } finally {
      clearTimeout(timeout);
    }
  }

  private createHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.secret) {
      headers["X-Automation-Secret"] = this.secret;
    }

    return headers;
  }

  private createResult(event: AutomationEvent, success: boolean, message: string, status?: number): AutomationResult {
    return {
      adapterId: this.id,
      adapterName: this.name,
      eventType: event.type,
      success,
      deliveredAt: new Date().toISOString(),
      message,
      status,
      error: success ? undefined : message
    };
  }
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === "AbortError") {
    return "n8n webhook request timed out.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "n8n webhook request failed.";
}
