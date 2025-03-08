import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph";

import { tool } from "@langchain/core/tools";
import { response } from "express";

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

const jsExecutor = tool(
  async ({ code }) => {
    const response = await fetch(process.env.EXECUTOR_URL || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    return await response.json();
  },
  {
    name: "run_javascript_code_tool",
    description: `
      Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      The code should be written in a way that it can be executed with javascript eval in node environment.
      For weather fetch data from openweather api. api key is '270f17df34305bc532aa480a3cec14fe'.
    `,
    schema: z.object({
      code: z.string().describe("code to be executed"),
    }),
  }
);

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [jsExecutor],
  checkpointSaver,
});
