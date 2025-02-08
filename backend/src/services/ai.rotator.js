// services/ai.rotator.js
import gpt4allService from "./gpt4all.service.js";
import openaiService from "./openai.service.js";
import deepseekService from "./deepseek.service.js";

class AIServiceRotator {
  constructor() {
    this.services = [
      {
        name: "openai",
        service: openaiService,
        requestsLimit: 5,
        requestsCount: 0,
        resetTime: Date.now(),
        resetInterval: 60000,
        initialized: false,
      },
      {
        name: "gpt4all",
        service: gpt4allService,
        requestsLimit: 1,
        requestsCount: 0,
        resetTime: Date.now(),
        resetInterval: 60000,
        initialized: false,
      },
    ];

    this.currentIndex = 0;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      for (const service of this.services) {
        const initialized = await service.service.initialize();
        service.initialized = initialized;
        console.log(
          `Service ${service.name} initialization:`,
          initialized ? "success" : "failed"
        );
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error("Service rotator initialization failed:", error);
      return false;
    }
  }

  resetCounters() {
    const now = Date.now();
    this.services.forEach((svc) => {
      if (now - svc.resetTime >= svc.resetInterval) {
        svc.requestsCount = 0;
        svc.resetTime = now;
      }
    });
  }

  async getNextAvailableService() {
    if (!this.initialized) {
      await this.initialize();
    }

    this.resetCounters();

    let errors = [];

    for (let i = 0; i < this.services.length; i++) {
      const serviceIndex = (this.currentIndex + i) % this.services.length;
      const service = this.services[serviceIndex];

      if (!service.initialized) {
        try {
          const initialized = await service.service.initialize();
          service.initialized = initialized;
        } catch (error) {
          errors.push(`${service.name}: ${error.message}`);
          continue;
        }
      }

      if (
        service.initialized &&
        service.requestsCount < service.requestsLimit
      ) {
        this.currentIndex = serviceIndex;
        service.requestsCount++;
        return service.service;
      }
    }

    throw new Error(`No available services. Errors: ${errors.join(", ")}`);
  }

  get currentService() {
    return this.services[this.currentIndex].service;
  }

  async generateResponse(input, subject, context) {
    try {
      const service = await this.getNextAvailableService();

      if (!service) {
        throw new Error("No available AI service found");
      }

      console.log(`Using service: ${this.services[this.currentIndex].name}`);
      const response = await service.generateResponse(input, subject, context);

      if (!response) {
        throw new Error("No response from AI service");
      }

      return response;
    } catch (error) {
      console.error("Error generating response:", error);
      throw error;
    }
  }
}

export default new AIServiceRotator();
