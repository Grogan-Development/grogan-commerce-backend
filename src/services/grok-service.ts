import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { Logger } from '@medusajs/framework/types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  messages: ChatMessage[];
  tools?: any[];
  images?: string[]; // Base64 encoded images
}

interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost?: number;
}

export class GrokService {
  private apiKey: string;
  private model: string;
  private logger: Logger;
  
  // Cost tracking (per 1M tokens)
  private readonly inputCostPerMillion = 0.20;
  private readonly outputCostPerMillion = 0.50;

  constructor(container: { logger: Logger }) {
    this.logger = container.logger;
    this.apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY || '';
    this.model = process.env.GROK_MODEL || 'grok-4-1-fast-reasoning';

    // Set XAI_API_KEY for @ai-sdk/xai if we have GROK_API_KEY
    if (this.apiKey && !process.env.XAI_API_KEY) {
      process.env.XAI_API_KEY = this.apiKey;
    }

    if (!this.apiKey) {
      this.logger.warn('Grok API key not configured. Set GROK_API_KEY or XAI_API_KEY environment variable.');
    } else {
      this.logger.info('Grok service initialized with model: ' + this.model);
    }
  }

  /**
   * Send a chat message to Grok
   */
  async chat(options: ChatOptions): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error('Grok API key not configured');
    }

    try {
      // Convert messages to prompt format
      // For now, we'll use the last user message as the prompt
      // In the future, we can support full conversation history
      const lastUserMessage = options.messages
        .filter(m => m.role === 'user')
        .pop();

      if (!lastUserMessage) {
        throw new Error('No user message provided');
      }

      const prompt = lastUserMessage.content;

      // Call Grok API
      // Note: The xai provider reads API key from XAI_API_KEY environment variable
      // We set it from GROK_API_KEY for consistency
      if (!process.env.XAI_API_KEY && this.apiKey) {
        process.env.XAI_API_KEY = this.apiKey;
      }

      // Note: For images, we'll need to use the messages format with content array
      // For now, supporting text-only. Images can be added later with proper format.
      const result = await generateText({
        model: xai(this.model),
        prompt: prompt,
        // Tools support will be added in future update
        // tools: options.tools,
        // Images support will be added in future update
        // The @ai-sdk/xai package supports images via the messages format
      });

      // Calculate cost
      const usage = result.usage;
      const cost = this.calculateCost(
        usage?.promptTokens || 0,
        usage?.completionTokens || 0
      );

      this.logger.info(
        `Grok API call: ${usage?.totalTokens || 0} tokens, $${cost.toFixed(6)}`
      );

      return {
        content: result.text,
        usage: usage ? {
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
        } : undefined,
        cost,
      };
    } catch (error: any) {
      this.logger.error(`Grok API error: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Analyze an image using Grok's vision capabilities
   */
  async analyzeImage(imageBase64: string, task: string): Promise<string> {
    const response = await this.chat({
      messages: [
        {
          role: 'user',
          content: `Analyze this image and ${task}. Be specific and detailed.`,
        },
      ],
      images: [imageBase64],
    });

    return response.content;
  }

  /**
   * Calculate API cost for a request
   */
  /**
   * Calculate API cost for a request
   */
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * this.inputCostPerMillion;
    const outputCost = (outputTokens / 1_000_000) * this.outputCostPerMillion;
    return inputCost + outputCost;
  }
}

export { GrokService };
export default GrokService;
