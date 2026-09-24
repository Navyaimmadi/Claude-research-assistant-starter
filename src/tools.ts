import type Anthropic from "@anthropic-ai/sdk";
import knowledge from "./data/knowledge.json" with { type: "json" };
import researchDb from "./data/research-db.json" with { type: "json" };

export const tools: Anthropic.Messages.Tool[] = [
  {
    name: "web_search",
    description: "Search Wikipedia and return short summaries for current background research.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Search phrase" } },
      required: ["query"]
    },
    cache_control: { type: "ephemeral" }
  },
  {
    name: "knowledge_lookup",
    description: "Look up relevant passages in the local knowledge base.",
    input_schema: {
      type: "object",
      properties: { query: { type: "string", description: "Words or topic to match" } },
      required: ["query"]
    }
  },
  {
    name: "research_db_query",
    description: "Query the local research comparison dataset by topic or team size.",
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string", description: "Optional topic filter" },
        team_size: { type: "string", description: "Optional team-size filter" }
      }
    }
  }
];

type JsonObject = Record<string, unknown>;

async function webSearch(input: JsonObject) {
  const query = String(input.query ?? "");
  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.search = new URLSearchParams({
    action: "query", list: "search", srsearch: query, format: "json", origin: "*", srlimit: "3"
  }).toString();
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) throw new Error(`Wikipedia search failed: ${searchResponse.status}`);
  const searchData = await searchResponse.json() as { query?: { search?: Array<{ title: string }> } };
  const titles = (searchData.query?.search ?? []).map(item => item.title);
  const summaries = await Promise.all(titles.map(async title => {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!response.ok) return { title, extract: "Summary unavailable" };
    const data = await response.json() as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } } };
    return { title: data.title, extract: data.extract, url: data.content_urls?.desktop?.page };
  }));
  return { query, results: summaries };
}

function knowledgeLookup(input: JsonObject) {
  const terms = String(input.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const matches = knowledge.filter(item => {
    const text = `${item.title} ${item.content} ${item.tags.join(" ")}`.toLowerCase();
    return terms.some(term => text.includes(term));
  });
  return { matches };
}

function researchDbQuery(input: JsonObject) {
  const topic = String(input.topic ?? "").toLowerCase();
  const teamSize = String(input.team_size ?? "").toLowerCase();
  const rows = researchDb.filter(row =>
    (!topic || row.topic.includes(topic)) && (!teamSize || row.team_size === teamSize)
  );
  return { rows, row_count: rows.length };
}

export async function executeTool(name: string, input: unknown) {
  const safeInput = (input && typeof input === "object" ? input : {}) as JsonObject;
  if (name === "web_search") return webSearch(safeInput);
  if (name === "knowledge_lookup") return knowledgeLookup(safeInput);
  if (name === "research_db_query") return researchDbQuery(safeInput);
  throw new Error(`Unknown tool: ${name}`);
}
