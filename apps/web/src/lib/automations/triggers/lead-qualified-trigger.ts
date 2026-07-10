import type { AutomationTrigger, AutomationTriggerContext } from "../types";

const qualifiedTemperatures = new Set(["warm", "hot"]);

export class LeadQualifiedTrigger implements AutomationTrigger {
  readonly eventType = "LEAD_QUALIFIED" as const;

  shouldFire({ previousState, currentState }: AutomationTriggerContext) {
    const wasQualified = qualifiedTemperatures.has(previousState.leadScore.temperature);
    const isQualified = qualifiedTemperatures.has(currentState.leadScore.temperature);

    return !wasQualified && isQualified;
  }
}
