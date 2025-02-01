import { GPT4All } from "gpt4all";

const gpt4all = new GPT4All("gpt4all-j-v1.3-groovy");
await gpt4all.init();
await gpt4all.open();

export const generateCoachResponse = async (prompt) => {
  const response = await gpt4all.prompt(prompt);
  return response;
};
