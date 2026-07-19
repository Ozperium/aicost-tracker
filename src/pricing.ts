// Pricing data for AI models (per 1K tokens, in USD)
// Updated 2026-07-19. These are public list prices.

export interface ModelPricing {
  input_per_1k: number;
  output_per_1k: number;
}

export const PRICING: Record<string, ModelPricing> = {
  // OpenAI
  'gpt-4o': { input_per_1k: 0.0025, output_per_1k: 0.01 },
  'gpt-4o-mini': { input_per_1k: 0.00015, output_per_1k: 0.0006 },
  'gpt-4-turbo': { input_per_1k: 0.01, output_per_1k: 0.03 },
  'gpt-4': { input_per_1k: 0.03, output_per_1k: 0.06 },
  'gpt-3.5-turbo': { input_per_1k: 0.0005, output_per_1k: 0.0015 },
  'o1': { input_per_1k: 0.015, output_per_1k: 0.06 },
  'o1-mini': { input_per_1k: 0.003, output_per_1k: 0.012 },

  // Anthropic
  'claude-3.5-sonnet': { input_per_1k: 0.003, output_per_1k: 0.015 },
  'claude-3.5-haiku': { input_per_1k: 0.0008, output_per_1k: 0.004 },
  'claude-3-opus': { input_per_1k: 0.015, output_per_1k: 0.075 },
  'claude-3-sonnet': { input_per_1k: 0.003, output_per_1k: 0.015 },
  'claude-3-haiku': { input_per_1k: 0.00025, output_per_1k: 0.00125 },

  // Google
  'gemini-1.5-pro': { input_per_1k: 0.00125, output_per_1k: 0.005 },
  'gemini-1.5-flash': { input_per_1k: 0.000075, output_per_1k: 0.0003 },

  // Local (free)
  'ollama': { input_per_1k: 0, output_per_1k: 0 },
  'local': { input_per_1k: 0, output_per_1k: 0 },
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = PRICING[model.toLowerCase()] || PRICING['gpt-4o-mini']; // default to cheap
  const inputCost = (inputTokens / 1000) * pricing.input_per_1k;
  const outputCost = (outputTokens / 1000) * pricing.output_per_1k;
  return inputCost + outputCost;
}

export function listModels(): string[] {
  return Object.keys(PRICING);
}