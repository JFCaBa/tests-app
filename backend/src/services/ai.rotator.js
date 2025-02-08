import gpt4allService from "./gpt4all.service.js";
import openaiService from "./openai.service.js";
import deepseekService from "./deepseek.service.js";

class AIServiceRotator {
  constructor() {
    this.services = [
      //   {
      //     name: "openai",
      //     service: openaiService,
      //     requestsLimit: 5,
      //     requestsCount: 0,
      //     resetTime: Date.now(),
      //     resetInterval: 60000, // 1 minute
      //   },
      {
        name: "gpt4all",
        service: gpt4allService,
        requestsLimit: 1,
        requestsCount: 0,
        resetTime: Date.now(),
        resetInterval: 60000,
      },
      {
        name: "deepseek",
        service: deepseekService,
        requestsLimit: 5,
        requestsCount: 0,
        resetTime: Date.now(),
        resetInterval: 60000,
      },
    ];

    this.currentIndex = 0;
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

  getNextAvailableService() {
    this.resetCounters();

    for (let i = 0; i < this.services.length; i++) {
      const serviceIndex = (this.currentIndex + i) % this.services.length;
      const service = this.services[serviceIndex];

      if (service.requestsCount < service.requestsLimit) {
        this.currentIndex = serviceIndex;
        service.requestsCount++;
        return service.service;
      }
    }

    throw new Error("All services have reached their rate limits");
  }

  get currentService() {
    return this.services[this.currentIndex].service;
  }

  get isInitialized() {
    return this.currentService.isInitialized;
  }

  async generateResponse(input, subject, context) {
    const service = this.getNextAvailableService();
    return service.generateResponse(input, subject, context);
  }
}

export default new AIServiceRotator();
