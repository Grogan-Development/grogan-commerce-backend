import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { GrokService } from '../../../services';
import { Logger } from '@medusajs/framework/types';

interface GrokChatRequestBody {
  message?: string;
  messages?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  images?: string[];
}

export async function POST(
  req: MedusaRequest<GrokChatRequestBody>,
  res: MedusaResponse
): Promise<void> {
  const logger: Logger = req.scope.resolve('logger');
  const grokService = new GrokService({ logger });

  try {
    const { message, messages, images } = req.body;

    if (!message && (!messages || messages.length === 0)) {
      res.status(400).json({
        error: 'Message or messages array is required',
      });
      return;
    }

    // Convert single message to messages array if needed
    const chatMessages = messages || [
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call Grok service
    const response = await grokService.chat({
      messages: chatMessages,
      images: images, // Array of base64 encoded images
    });

    res.json({
      content: response.content,
      usage: response.usage,
      cost: response.cost,
    });
  } catch (error: any) {
    logger.error(`Error in Grok chat API: ${error.message}`, error);
    res.status(500).json({
      error: error.message || 'Failed to process Grok chat request',
    });
  }
}
