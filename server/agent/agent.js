import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

import { tool } from "@langchain/core/tools";

const weatherTool = tool(
  async ({ query }) => {
    console.log("query", query);
    return "The weather in kakinada is sunny";
  },
  {
    name: "weather",
    description: "Get the weather in a given location",
    schema: z.object({
      query: z.string().describe("The query to use in search"),
    }),
  }
);

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
});

const checkpointSaver = new MemorySaver();

const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});

const result = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "How  is it in Kakinada?",
      },
    ],
  },
  {
    configurable: { thread_id: 44 },
  }
);

const followup = await agent.invoke(
  {
    messages: [
      {
        role: "user",
        content: "What city is it for?",
      },
    ],
  },
  {
    configurable: { thread_id: 44 },
  }
);

console.log(result.messages.at(-1).content);
console.log(followup.messages.at(-1).content);
