import { problemPoints, processSteps, services, solutionPoints, useCases } from "@/config/company";
import type { ConversationMessage, LeadData } from "@/types/conversation";

export type ConversationKnowledgeSnippet = {
  title: string;
  content: string;
  tags: string[];
};

type RetrieveKnowledgeOptions = {
  apiKey: string;
  lead: LeadData;
  messages: ConversationMessage[];
  limit?: number;
  embeddingModel?: string;
};

type EmbeddingResponse = {
  data?: Array<{
    index: number;
    embedding: number[];
  }>;
  error?: {
    message?: string;
  };
};

type EmbeddedKnowledgeSnippet = ConversationKnowledgeSnippet & {
  embedding: number[];
};

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "for",
  "from",
  "have",
  "help",
  "i",
  "in",
  "is",
  "it",
  "my",
  "need",
  "of",
  "on",
  "or",
  "our",
  "that",
  "the",
  "their",
  "this",
  "to",
  "we",
  "with",
  "you",
  "your"
]);

const knowledgeBase: ConversationKnowledgeSnippet[] = [
  ...services.map((service) => ({
    title: service.title,
    content: `${service.description} Business outcome: ${service.outcome}.`,
    tags: tokenize(`${service.title} ${service.description} ${service.outcome}`)
  })),
  ...useCases.map((useCase) => ({
    title: `${useCase.industry} use case`,
    content: useCase.description,
    tags: tokenize(`${useCase.industry} ${useCase.description}`)
  })),
  ...processSteps.map((step) => ({
    title: step.title,
    content: step.description,
    tags: tokenize(`${step.title} ${step.description}`)
  })),
  ...problemPoints.map((problem) => ({
    title: "Common business problem",
    content: problem,
    tags: tokenize(problem)
  })),
  ...solutionPoints.map((solution) => ({
    title: "NovaRose solution pattern",
    content: solution,
    tags: tokenize(solution)
  })),
  {
    title: "Lead response workflow",
    content:
      "Best fit when leads are missed, responses are slow, or staff manually follow up. The workflow should qualify intent, urgency, service fit, and next step before routing the lead.",
    tags: ["lead", "leads", "response", "follow", "followup", "qualify", "sales", "website", "route", "routing"]
  },
  {
    title: "Customer support workflow",
    content:
      "Best fit when customers repeat the same questions or wait too long for basic answers. The workflow should answer routine questions, collect context, and escalate sensitive issues.",
    tags: ["support", "customer", "questions", "faq", "tickets", "escalate", "service", "answers"]
  },
  {
    title: "Booking workflow",
    content:
      "Best fit when the next step should be an appointment or consultation. The workflow should confirm intent, collect scheduling constraints, and reduce back-and-forth.",
    tags: ["booking", "appointment", "schedule", "calendar", "consultation", "call", "availability"]
  },
  {
    title: "Internal admin workflow",
    content:
      "Best fit when staff spend time copying data, summarizing requests, or coordinating handoffs. The workflow should create clean records and push summaries into the tools the team already uses.",
    tags: ["admin", "data", "entry", "handoff", "workflow", "crm", "email", "summary", "operations", "manual"]
  }
];

let embeddedKnowledgeModel: string | undefined;
let embeddedKnowledgePromise: Promise<EmbeddedKnowledgeSnippet[]> | undefined;

export async function retrieveConversationKnowledge({
  apiKey,
  lead,
  messages,
  limit = 4,
  embeddingModel = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small"
}: RetrieveKnowledgeOptions) {
  const query = buildKnowledgeQuery(lead, messages);

  if (!query) {
    return [];
  }

  const expandedQuery = expandQuery(query);
  const [queryEmbedding] = await createEmbeddings({
    apiKey,
    input: [expandedQuery],
    model: embeddingModel
  });
  const embeddedKnowledge = await getEmbeddedKnowledge(apiKey, embeddingModel);

  return embeddedKnowledge
    .map((snippet) => ({
      snippet,
      score: cosineSimilarity(queryEmbedding, snippet.embedding)
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ snippet }) => ({
      title: snippet.title,
      content: snippet.content,
      tags: snippet.tags
    }));
}

function buildKnowledgeQuery(lead: LeadData, messages: ConversationMessage[]) {
  const recentUserMessages = messages
    .filter((message) => message.role === "user")
    .slice(-3)
    .map((message) => message.content)
    .join(" ");

  return [
    lead.company,
    lead.industry,
    lead.businessContext,
    lead.biggestPainPoint,
    lead.currentWorkflow,
    lead.desiredOutcome,
    lead.currentTools,
    lead.volume,
    lead.serviceInterest,
    recentUserMessages
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function expandQuery(query: string) {
  const lowerQuery = query.toLowerCase();
  const expansions = [query];

  if (/\b(leads?|prospects?|sales|website|follow[- ]?up)\b/.test(lowerQuery)) {
    expansions.push("lead intake website sales response followup qualify route");
  }

  if (/\b(book|booking|appointment|calendar|schedule|consultation|call)\b/.test(lowerQuery)) {
    expansions.push("appointment booking scheduling calendar consultation");
  }

  if (/\b(customer|support|ticket|faq|question|questions|service)\b/.test(lowerQuery)) {
    expansions.push("customer support questions tickets escalation");
  }

  if (/\b(manual|admin|data entry|spreadsheet|crm|email|handoff|operations)\b/.test(lowerQuery)) {
    expansions.push("internal admin workflow crm email summary operations");
  }

  return expansions.join(" ");
}

async function getEmbeddedKnowledge(apiKey: string, embeddingModel: string) {
  if (!embeddedKnowledgePromise || embeddedKnowledgeModel !== embeddingModel) {
    embeddedKnowledgeModel = embeddingModel;
    embeddedKnowledgePromise = createEmbeddedKnowledge(apiKey, embeddingModel).catch((error: unknown) => {
      embeddedKnowledgePromise = undefined;
      throw error;
    });
  }

  return embeddedKnowledgePromise;
}

async function createEmbeddedKnowledge(apiKey: string, embeddingModel: string) {
  const embeddings = await createEmbeddings({
    apiKey,
    input: knowledgeBase.map(formatSnippetForEmbedding),
    model: embeddingModel
  });

  return knowledgeBase.map((snippet, index) => ({
    ...snippet,
    embedding: embeddings[index] ?? []
  }));
}

async function createEmbeddings({ apiKey, input, model }: { apiKey: string; input: string[]; model: string }) {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input,
      encoding_format: "float"
    })
  });

  const data = (await response.json().catch(() => ({}))) as EmbeddingResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `OpenAI embeddings request failed with status ${response.status}.`);
  }

  const embeddings = data.data
    ?.slice()
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);

  if (!embeddings?.length) {
    throw new Error("OpenAI embeddings response did not include vectors.");
  }

  return embeddings;
}

function cosineSimilarity(a: number[], b: number[]) {
  if (!a.length || !b.length || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let index = 0; index < a.length; index += 1) {
    const aValue = a[index] ?? 0;
    const bValue = b[index] ?? 0;
    dotProduct += aValue * bValue;
    aMagnitude += aValue * aValue;
    bMagnitude += bValue * bValue;
  }

  if (!aMagnitude || !bMagnitude) {
    return 0;
  }

  return dotProduct / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

function formatSnippetForEmbedding(snippet: ConversationKnowledgeSnippet) {
  return `${snippet.title}\n${snippet.content}\nTags: ${snippet.tags.join(", ")}`;
}

function tokenize(value: string) {
  return (
    value
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 2 && !stopWords.has(token)) ?? []
  );
}
