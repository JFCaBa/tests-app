// services/ai.factory.js
import gpt4allService from "./gpt4all.service.js";
import openaiService from "./openai.service.js";

const services = {
  gpt4all: gpt4allService,
  openai: openaiService,
};

export const getAIService = (type = process.env.AI_SERVICE || "openai") => {
  const service = services[type];
  if (!service) {
    throw new Error(`AI service ${type} not found`);
  }
  return service;
};
