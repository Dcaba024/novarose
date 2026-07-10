import type { AutomationAdapter, AutomationEvent, AutomationResult } from "../types";

export class MockAutomationAdapter implements AutomationAdapter {
  readonly id = "mock";
  readonly name = "Mock Automation Adapter";

  isEnabled() {
    return true;
  }

  async handle(event: AutomationEvent): Promise<AutomationResult> {
    return {
      adapterId: this.id,
      adapterName: this.name,
      eventType: event.type,
      success: true,
      deliveredAt: new Date().toISOString(),
      message: `Mock automation accepted ${event.type}.`
    };
  }
}
