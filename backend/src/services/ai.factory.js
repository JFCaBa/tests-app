// services/ai.factory.js
import gpt4allService from "./gpt4all.service.js";
import openaiService from "./openai.service.js";
import deepseekService from "./deepseek.service.js";

const services = {
  gpt4all: gpt4allService,
  openai: openaiService,
  deepseek: deepseekService,
};

export const getAIService = async (
  type = process.env.AI_SERVICE || "deepseek"
) => {
  const service = services[type];
  if (!service) {
    console.error(`AI service ${type} not found`);
    throw new Error(`AI service ${type} not found`);
  }

  try {
    await service.initialize();
    return service;
  } catch (error) {
    console.error(`Failed to initialize ${type} service:`, error);
    throw error;
  }
};
