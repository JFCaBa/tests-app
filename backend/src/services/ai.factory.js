// services/ai.factory.js
import gpt4allService from "./gpt4all.service.js";
import openaiService from "./openai.service.js";
import deepseekService from "./deepseek.service.js";

const services = {
  gpt4all: gpt4allService,
  openai: openaiService,
  deepseek: deepseekService,
};

export const getAIService = (type = process.env.AI_SERVICE || "deepseek") => {
  const service = services[type];
  if (!service) {
    throw new Error(`AI service ${type} not found`);
  }
  return service;
};
