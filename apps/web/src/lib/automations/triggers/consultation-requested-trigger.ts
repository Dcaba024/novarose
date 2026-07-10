import type { AutomationTrigger, AutomationTriggerContext } from "../types";

const consultationRequestPattern =
  /\b(?:book|schedule|set up|request|start|plan)\s+(?:a\s+)?(?:call|consultation|demo|meeting|strategy session)\b/i;

export class ConsultationRequestedTrigger implements AutomationTrigger {
  readonly eventType = "CONSULTATION_REQUESTED" as const;

  shouldFire({ requestedEventType, userMessage }: AutomationTriggerContext) {
    if (requestedEventType === this.eventType) {
      return true;
    }

    return Boolean(userMessage && isConsultationRequest(userMessage));
  }
}

export function isConsultationRequest(message: string) {
  return consultationRequestPattern.test(message);
}
