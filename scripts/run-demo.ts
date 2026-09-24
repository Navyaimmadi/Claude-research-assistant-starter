import { mkdir, writeFile } from "node:fs/promises";
import { research } from "../src/agent.js";

const queries = [
  "Explain retrieval-augmented generation using the local knowledge base.",
  "Compare RAG and fine-tuning for a small support team. Use web search, the knowledge base, and the research database; give a justified recommendation.",
  "Compare RAG and fine-tuning for a small support team. Use web search, the knowledge base, and the research database; give a justified recommendation.",
  "Compare RAG and fine-tuning for a small support team. Use web search, the knowledge base, and the research database; give a justified recommendation."
];

await mkdir("outputs/generated", { recursive: true });
for (let index = 0; index < queries.length; index += 1) {
  const output = await research(queries[index]);
  await writeFile(`outputs/generated/query-${index + 1}.json`, JSON.stringify(output, null, 2));
  console.log(`Completed demo query ${index + 1}`);
}
