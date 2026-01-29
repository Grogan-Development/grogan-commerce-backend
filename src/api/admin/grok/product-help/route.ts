import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import GrokService from "../../../../services/grok-service"

interface GrokProductHelpRequestBody {
  product_id?: string
  question?: string
}

export async function POST(
  req: MedusaRequest<GrokProductHelpRequestBody>,
  res: MedusaResponse
): Promise<void> {
  const logger: Logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const grokService = new GrokService({ logger })

  try {
    const { product_id, question } = req.body

    if (!product_id || !question) {
      res.status(400).json({
        error: "product_id and question are required",
      })
      return
    }

    const productModuleService = req.scope.resolve(Modules.PRODUCT)
    const product = await productModuleService.retrieveProduct(product_id, {
      relations: [
        "variants",
        "options",
        "collection",
        "type",
        "tags",
        "images",
      ],
    })

    const productContext = {
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      handle: product.handle,
      status: product.status,
      description: product.description,
      collection: product.collection?.title,
      type: product.type?.value,
      tags: product.tags?.map((tag) => tag.value) || [],
      options: product.options?.map((option) => ({
        title: option.title,
        values: option.values?.map((value) => value.value) || [],
      })),
      variants: product.variants?.map((variant) => ({
        title: variant.title,
        sku: variant.sku,
      })),
      images: product.images?.map((image) => image.url) || [],
    }

    const response = await grokService.chat({
      system:
        "You are Grok, the merchandising assistant for Grogan commerce. Use the provided product context to give clear, actionable guidance for e-commerce operators. Offer concise suggestions first, then supporting details.",
      messages: [
        {
          role: "user",
          content: `Product context:\n${JSON.stringify(
            productContext,
            null,
            2
          )}\n\nQuestion: ${question}`,
        },
      ],
    })

    res.json({
      content: response.content,
      usage: response.usage,
      cost: response.cost,
    })
  } catch (error: any) {
    logger.error(`Error in Grok product help API: ${error.message}`, error)
    res.status(500).json({
      error: error.message || "Failed to process Grok product request",
    })
  }
}
