import { research } from "./agent.js";

const question = process.argv.slice(2).join(" ").trim();
if (!question) {
  console.error('Usage: npm run dev -- "your research question"');
  process.exit(1);
}

research(question)
  .then(output => console.log(JSON.stringify(output, null, 2)))
  .catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
