export const config = {
  port: 3000,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.7-flash',
  temperature: 0.3, // Low temperature for factual precision and adherence to knowledge base
  maxToolSteps: 4,
  appName: 'CoffeeAI',
  version: '1.0.0',
};
