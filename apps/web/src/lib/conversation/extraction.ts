import type { LeadData } from "@/types/conversation";

const serviceInterests: Array<[string, string]> = [
  ["appointment", "Appointment Booking Automations"],
  ["booking", "Appointment Booking Automations"],
  ["lead", "AI Lead Intake Systems"],
  ["intake", "AI Lead Intake Systems"],
  ["sales agent", "AI Website Sales Agents"],
  ["website", "AI Website Sales Agents"],
  ["support", "AI Customer Support Agents"],
  ["customer service", "AI Customer Support Agents"],
  ["crm", "CRM + Email Automations"],
  ["email", "CRM + Email Automations"],
  ["workflow", "Custom AI Workflow Automation"],
  ["automation", "Custom AI Workflow Automation"]
];

const industries = [
  "law firm",
  "legal",
  "roofing",
  "hvac",
  "dental",
  "medical",
  "accounting",
  "real estate",
  "restaurant",
  "ecommerce",
  "home services",
  "marketing",
  "consulting",
  "construction",
  "insurance"
];

export function extractLeadData(message: string, previousLead: LeadData): LeadData {
  const normalizedMessage = message.trim();
  const lowerMessage = normalizedMessage.toLowerCase();

  return removeEmptyFields({
    ...previousLead,
    name: previousLead.name ?? extractName(normalizedMessage),
    company: previousLead.company ?? extractCompany(normalizedMessage),
    industry: previousLead.industry ?? extractIndustry(lowerMessage),
    employeeCount: previousLead.employeeCount ?? extractEmployeeCount(lowerMessage),
    biggestPainPoint: extractPainPoint(normalizedMessage) ?? previousLead.biggestPainPoint,
    businessContext: previousLead.businessContext ?? extractBusinessContext(normalizedMessage),
    currentWorkflow: extractCurrentWorkflow(normalizedMessage) ?? previousLead.currentWorkflow,
    desiredOutcome: extractDesiredOutcome(normalizedMessage) ?? previousLead.desiredOutcome,
    currentTools: extractCurrentTools(normalizedMessage) ?? previousLead.currentTools,
    volume: previousLead.volume ?? extractVolume(normalizedMessage),
    budget: previousLead.budget ?? extractBudget(normalizedMessage),
    timeline: previousLead.timeline ?? extractTimeline(lowerMessage),
    serviceInterest: extractServiceInterest(lowerMessage) ?? previousLead.serviceInterest
  });
}

function extractName(message: string) {
  const match = message.match(/\b(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  return match?.[1]?.replace(/\s+(and|but|with|from|at)$/i, "").trim();
}

function extractCompany(message: string) {
  const explicitMatch = message.match(/\b(?:company is|business is|work at|work for|run|own)\s+([A-Z][A-Za-z0-9&'. -]{2,48})/);

  if (explicitMatch?.[1]) {
    return cleanEntity(explicitMatch[1]);
  }

  const atMatch = message.match(/\bat\s+([A-Z][A-Za-z0-9&'. -]{2,48})/);
  return atMatch?.[1] ? cleanEntity(atMatch[1]) : undefined;
}

function extractIndustry(message: string) {
  const explicitMatch = message.match(
    /\b(?:industry is|we are a|we're a|we run a|we own a|i run a|i own a)\s+([a-z][a-z -]{2,48})/
  );

  if (explicitMatch?.[1]) {
    return cleanIndustry(explicitMatch[1]);
  }

  const industryPhraseMatch = message.match(/\bin the\s+([a-z][a-z -]{2,36})\s+industry\b/);

  if (industryPhraseMatch?.[1]) {
    return cleanIndustry(industryPhraseMatch[1]);
  }

  return industries.find((industry) => message.includes(industry));
}

function extractEmployeeCount(message: string) {
  const employeeMatch = message.match(/\b(?:team of|staff of|about|around|we have)?\s*(\d{1,5})\s*(?:employees|people|staff|team members)\b/);
  return employeeMatch?.[1] ? `${employeeMatch[1]} employees` : undefined;
}

function extractPainPoint(message: string) {
  const painWords = [
    "struggle",
    "problem",
    "pain",
    "slow",
    "manual",
    "miss",
    "repetitive",
    "missed",
    "overwhelmed",
    "waste",
    "wasting",
    "bottleneck",
    "backlog",
    "friction",
    "drop",
    "dropped",
    "lost",
    "lose",
    "too long",
    "can't keep up",
    "cannot keep up",
    "follow up",
    "response"
  ];

  if (!painWords.some((word) => message.toLowerCase().includes(word))) {
    return undefined;
  }

  const painSegment = message
    .split(/(?<=[.!?])\s+|;\s+|\s+and\s+|\s+but\s+/i)
    .map((segment) => segment.trim())
    .find((segment) => painWords.some((word) => segment.toLowerCase().includes(word)));

  return painSegment ? trimSentence(painSegment) : trimSentence(message);
}

function extractBusinessContext(message: string) {
  const contextMatch = message.match(
    /\b(?:we are|we're|i run|i own|our company is|my company is|our business is|my business is)\s+(?:a|an|the)?\s*([^.!?]{8,160})/i
  );

  return contextMatch?.[1] ? cleanDetail(contextMatch[1]) : undefined;
}

function extractCurrentWorkflow(message: string) {
  return extractSentenceByKeywords(message, [
    "currently",
    "right now",
    "today",
    "we use",
    "using",
    "process",
    "workflow",
    "handle",
    "manage",
    "comes in",
    "come in",
    "inbox",
    "form",
    "forms",
    "spreadsheet",
    "crm"
  ]);
}

function extractDesiredOutcome(message: string) {
  const desiredOutcome = extractSentenceByKeywords(message, [
    "want",
    "need",
    "looking for",
    "goal",
    "trying to",
    "would like",
    "hoping",
    "so that",
    "automate",
    "improve",
    "reduce",
    "increase",
    "faster",
    "better"
  ]);

  return desiredOutcome ? cleanDesiredOutcome(desiredOutcome) : undefined;
}

function extractCurrentTools(message: string) {
  const knownTools = [
    "hubspot",
    "salesforce",
    "gohighlevel",
    "highlevel",
    "pipedrive",
    "zoho",
    "clio",
    "lawmatics",
    "servicetitan",
    "housecall pro",
    "jobber",
    "calendly",
    "acuity",
    "google sheets",
    "excel",
    "gmail",
    "outlook",
    "slack",
    "zapier",
    "make",
    "n8n",
    "notion",
    "airtable"
  ];
  const lowerMessage = message.toLowerCase();
  const foundTools = knownTools.filter((tool) => lowerMessage.includes(tool));
  const explicitMatch = message.match(
    /\b(?:we use|we're using|we are using|currently use|currently using|our crm is|crm is|software is|tool is|tools are)\s+([A-Za-z0-9+&'. -]{2,80})/i
  );

  if (explicitMatch?.[1]) {
    foundTools.push(...splitToolList(cleanDetail(explicitMatch[1])));
  }

  return uniqueTools(foundTools.map(toDisplayToolName)).join(", ") || undefined;
}

function extractVolume(message: string) {
  const volumeMatch = message.match(
    /\b(?:about|around|roughly|over|under|nearly|almost)?\s*(\d{1,6})\s*(?:new\s+)?(leads|calls|messages|appointments|requests|tickets|cases|clients|customers)\s*(?:per|a|\/)\s*(day|week|month|year)\b/i
  );

  if (!volumeMatch?.[1] || !volumeMatch[2] || !volumeMatch[3]) {
    return undefined;
  }

  return `${volumeMatch[1]} ${volumeMatch[2].toLowerCase()} per ${volumeMatch[3].toLowerCase()}`;
}

function extractBudget(message: string) {
  const explicitBudget = message.match(
    /\b(?:budget is|budget of|budget around|spend|can spend|can invest|investment is)\s*(\$?\d[\d,]*(?:k|K)?(?:\s*-\s*\$?\d[\d,]*(?:k|K)?)?)/
  );
  const currency = message.match(/\$\s?\d[\d,]*(?:k|K)?(?:\s*-\s*\$?\d[\d,]*(?:k|K)?)?/);
  return explicitBudget?.[1] ?? currency?.[0];
}

function extractTimeline(message: string) {
  const timelineMatch = message.match(
    /\b(asap|urgent|immediately|this week|this month|next month|this quarter|next quarter|30 days|60 days|90 days|by [a-z]+|before [a-z]+)\b/
  );

  return timelineMatch?.[0];
}

function extractServiceInterest(message: string) {
  return serviceInterests.find(([keyword]) => message.includes(keyword))?.[1];
}

function removeEmptyFields(lead: LeadData): LeadData {
  return Object.fromEntries(Object.entries(lead).filter(([, value]) => Boolean(value))) as LeadData;
}

function cleanEntity(value: string) {
  return trimSentence(value).replace(/\b(?:and|because|with|where|that|for)\b.*$/i, "").trim();
}

function cleanIndustry(value: string) {
  return cleanEntity(value).replace(/\s+(?:company|business|firm|practice|agency|clinic|office)$/i, "").trim();
}

function cleanDetail(value: string) {
  return trimSentence(value)
    .replace(/\s+/g, " ")
    .replace(/\b(?:and|but|because|where|that)\b\s*$/i, "")
    .trim()
    .slice(0, 180);
}

function cleanDesiredOutcome(value: string) {
  return cleanDetail(value)
    .replace(
      /^(?:i|we)\s+(?:want|need|would like|are looking for|are trying to|hope|are hoping)\s+(?:an?\s+)?/i,
      ""
    )
    .replace(/^(?:goal is|our goal is|my goal is)\s+(?:to\s+)?/i, "")
    .replace(/^ai\s+workflow\s+that\s+/i, "")
    .replace(/^workflow\s+that\s+/i, "")
    .replace(/\bqualifies\b/i, "qualify")
    .replace(/\bbooks\b/i, "book")
    .replace(/\bsends\b/i, "send")
    .trim();
}

function extractSentenceByKeywords(message: string, keywords: string[]) {
  const segments = message
    .split(/(?<=[.!?])\s+|;\s+|\n+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const segment = segments.find((currentSegment) => {
    const lowerSegment = currentSegment.toLowerCase();
    return keywords.some((keyword) => lowerSegment.includes(keyword));
  });

  return segment ? cleanDetail(segment) : undefined;
}

function trimSentence(value: string) {
  return value.split(/[.!?]/)[0]?.trim() ?? value.trim();
}

function uniqueTools(values: string[]) {
  const tools = new Map<string, string>();

  for (const value of values) {
    if (!value) {
      continue;
    }

    tools.set(value.toLowerCase(), value);
  }

  return Array.from(tools.values());
}

function splitToolList(value: string) {
  return value
    .split(/\s*(?:,|\+|\/|\band\b)\s*/i)
    .map((tool) => tool.trim())
    .filter(Boolean);
}

function toDisplayToolName(value: string) {
  const knownDisplayNames: Record<string, string> = {
    gohighlevel: "GoHighLevel",
    highlevel: "GoHighLevel",
    hubspot: "HubSpot",
    salesforce: "Salesforce",
    pipedrive: "Pipedrive",
    zoho: "Zoho",
    clio: "Clio",
    lawmatics: "Lawmatics",
    servicetitan: "ServiceTitan",
    "housecall pro": "Housecall Pro",
    jobber: "Jobber",
    calendly: "Calendly",
    acuity: "Acuity",
    "google sheets": "Google Sheets",
    excel: "Excel",
    gmail: "Gmail",
    outlook: "Outlook",
    slack: "Slack",
    zapier: "Zapier",
    make: "Make",
    n8n: "n8n",
    notion: "Notion",
    airtable: "Airtable"
  };
  const normalizedValue = value.toLowerCase().trim();

  return knownDisplayNames[normalizedValue] ?? value.trim();
}
