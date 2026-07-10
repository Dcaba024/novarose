import { MockAutomationAdapter } from "./adapters/mock-automation-adapter";
import { N8nAutomationAdapter } from "./adapters/n8n-automation-adapter";
import type { AutomationAdapter, AutomationEvent, AutomationResult } from "./types";

type AutomationEngineOptions = {
  adapters?: AutomationAdapter[];
  enabled?: boolean;
};

const disabledAutomationValues = new Set(["0", "false", "off", "disabled"]);

export class AutomationEngine {
  private readonly adapters: AutomationAdapter[];
  private readonly enabled: boolean;

  constructor(options: AutomationEngineOptions = {}) {
    this.adapters = options.adapters ?? createDefaultAutomationAdapters();
    this.enabled = options.enabled ?? isAutomationEnabled();
  }

  async dispatch(event: AutomationEvent): Promise<AutomationResult[]> {
    if (!this.enabled) {
      logAutomationAttempt(event, []);
      return [];
    }

    const enabledAdapters = this.adapters.filter((adapter) => adapter.isEnabled());

    logAutomationAttempt(event, enabledAdapters);

    const results = await Promise.all(enabledAdapters.map((adapter) => this.sendToAdapter(adapter, event)));

    logAutomationResults(event, results);

    return results;
  }

  private async sendToAdapter(adapter: AutomationAdapter, event: AutomationEvent): Promise<AutomationResult> {
    try {
      return await adapter.handle(event);
    } catch (error) {
      return {
        adapterId: adapter.id,
        adapterName: adapter.name,
        eventType: event.type,
        success: false,
        deliveredAt: new Date().toISOString(),
        error: getSafeAutomationError(error)
      };
    }
  }
}

export function createAutomationEngine() {
  return new AutomationEngine();
}

function createDefaultAutomationAdapters() {
  const adapters: AutomationAdapter[] = [new MockAutomationAdapter()];
  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL?.trim();

  if (n8nWebhookUrl) {
    adapters.push(
      new N8nAutomationAdapter({
        webhookUrl: n8nWebhookUrl,
        secret: process.env.AUTOMATION_SECRET
      })
    );
  }

  return adapters;
}

function isAutomationEnabled() {
  const value = process.env.ENABLE_AUTOMATIONS?.trim().toLowerCase();

  if (!value) {
    return true;
  }

  return !disabledAutomationValues.has(value);
}

function logAutomationAttempt(event: AutomationEvent, adapters: AutomationAdapter[]) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[automation] dispatch", {
    eventId: event.id,
    eventType: event.type,
    adapters: adapters.map((adapter) => adapter.id)
  });
}

function logAutomationResults(event: AutomationEvent, results: AutomationResult[]) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info("[automation] results", {
    eventId: event.id,
    eventType: event.type,
    results: results.map((result) => ({
      adapterId: result.adapterId,
      success: result.success,
      status: result.status
    }))
  });
}

function getSafeAutomationError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Automation adapter failed.";
  }

  return redactConfiguredSecrets(error.message);
}

function redactConfiguredSecrets(value: string) {
  let redactedValue = value;

  for (const secret of [process.env.N8N_WEBHOOK_URL, process.env.AUTOMATION_SECRET]) {
    if (secret) {
      redactedValue = redactedValue.replaceAll(secret, "[redacted]");
    }
  }

  return redactedValue;
}
