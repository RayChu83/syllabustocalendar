import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { makeCalendarTools } from "./tools";

export function makeGoogleCalendarAgent(accessToken: string) {
  const model = new ChatOpenAI({
    model: "gpt-5-mini",
    temperature: 1,
  });

  return createAgent({
    model,
    tools: makeCalendarTools({ accessToken }),
  });
}
