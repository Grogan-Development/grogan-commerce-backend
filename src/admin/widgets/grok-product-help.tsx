import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import type { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import { Button, Container, Heading, Input, Text, Textarea, Tooltip } from "@medusajs/ui"
import { Sparkles } from "@medusajs/icons"
import { sdk } from "../lib/sdk"

type GrokAnswer = {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  cost?: number
}

const GrokProductHelpWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<GrokAnswer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: productResult } = useQuery({
    queryKey: [["product", product.id, "grok"]],
    queryFn: () =>
      sdk.admin.product.retrieve(product.id, {
        fields:
          "+title,+subtitle,+handle,+description,+status,+collection.*,+type.*,+tags.*,+images.*,+options.*,+variants.*",
      }),
  })

  const productSummary = useMemo(() => {
    const details = productResult?.product || product
    return {
      id: details.id,
      title: details.title,
      subtitle: details.subtitle,
      handle: details.handle,
      status: details.status,
      description: details.description,
      collection: details.collection?.title,
      type: details.type?.value,
      tags: details.tags?.map((tag) => tag.value) || [],
      options: details.options?.map((option) => ({
        title: option.title,
        values: option.values?.map((value) => value.value) || [],
      })),
      variants: details.variants?.map((variant) => ({
        title: variant.title,
        sku: variant.sku,
      })),
      images: details.images?.map((image) => image.url) || [],
    }
  }, [productResult, product])

  const suggestionList = [
    "Write a short product description for this item",
    "Suggest 3 upsell bundle ideas for this product",
    "Identify key selling points and benefits",
    "Recommend pricing strategy adjustments",
  ]

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    setLoading(true)
    setError(null)
    setAnswer(null)

    try {
      const response = await fetch("/admin/grok/product-help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          question: question.trim(),
        }),
      })

      if (!response.ok) {
        const payload = await response.json()
        throw new Error(payload.error || "Failed to get Grok response")
      }

      const payload = (await response.json()) as GrokAnswer
      setAnswer(payload)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-ui-fg-interactive" />
          <Heading level="h2">Grok Product Assistant</Heading>
        </div>
        <Tooltip content="Uses Grok to generate merchandising help for this product.">
          <Text size="xsmall" className="text-ui-fg-subtle">
            AI merch help
          </Text>
        </Tooltip>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div className="space-y-2">
          <Text size="small" weight="plus">
            Ask Grok about this product
          </Text>
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask for positioning, copy, pricing, or bundle ideas..."
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestionList.map((suggestion) => (
            <Button
              key={suggestion}
              variant="secondary"
              size="small"
              type="button"
              onClick={() => setQuestion(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleAsk} isLoading={loading}>
            Ask Grok
          </Button>
          <Input
            value={productSummary.title || ""}
            disabled
            className="max-w-[240px]"
          />
        </div>

        {error && (
          <div className="rounded-md border border-ui-border-error bg-ui-bg-error p-3">
            <Text size="small" className="text-ui-fg-error">
              {error}
            </Text>
          </div>
        )}

        {answer && (
          <div className="rounded-md border border-ui-border-base bg-ui-bg-subtle p-4 space-y-2">
            <Text size="small" weight="plus">
              Grok says
            </Text>
            <Text size="small" className="whitespace-pre-wrap">
              {answer.content}
            </Text>
            {answer.usage && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                Tokens: {answer.usage.totalTokens} · Cost: ${answer.cost?.toFixed(6) ?? "0.000000"}
              </Text>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default GrokProductHelpWidget
