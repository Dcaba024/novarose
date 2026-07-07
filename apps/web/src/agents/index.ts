import { lawFirmDemoAgent } from "./law-firm-demo";
import { novaRoseAgent } from "./nova-rose";
import type { AgentConfig } from "./types";

export const agentConfigs = [novaRoseAgent, lawFirmDemoAgent] as const;

export function getAgentConfig(agentId = "nova-rose"): AgentConfig {
  return agentConfigs.find((agent) => agent.id === agentId) ?? novaRoseAgent;
}

export type { AgentConfig } from "./types";
