import {
    type SubscriberConfig,
    type SubscriberArgs,
} from "@medusajs/medusa"
import { GIFT_CARD_MODULE } from "../modules/gift-card"
import GiftCardModuleService from "../modules/gift-card/service"
import { ORDER_PROOF_MODULE } from "../modules/order-proof"
import OrderProofModuleService from "../modules/order-proof/service"

/**
 * Subscriber that generates gift cards when gift card products are purchased
 * Listens to order.placed event
 */
export default async function generateGiftCardsSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const giftCardService = container.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )
    const orderService = container.resolve<{ retrieve: (id: string, options?: any) => Promise<any> }>("orderService")

    try {
        // Retrieve the order with items and product information
        const order = await orderService.retrieve(data.id, {
            relations: ["items", "items.variant", "items.variant.product"],
        })

        // Check each line item to see if it's a gift card product
        for (const item of order.items || []) {
            const product = item.variant?.product
            
            if (!product) continue

            // Check if product is a gift card (via metadata)
            const isGiftCard = product.metadata?.is_gift_card === true || 
                              product.metadata?.is_gift_card === "true"
            
            if (!isGiftCard) continue

            const giftCardType = product.metadata?.gift_card_type || "digital"
            const customerId = order.customer_id || null

            // Get engraving text from line item metadata if it's a physical gift card
            const engravingText = item.metadata?.engraving_text || null
            const engravingMetadata = item.metadata?.engraving_metadata || null

            // Calculate gift card value from line item
            // Use unit_price if available, otherwise calculate from item total
            const value = item.unit_price || Math.round((item.total || 0) / (item.quantity || 1))

            // Create gift card for each quantity
            const createdGiftCards: any[] = []
            for (let i = 0; i < (item.quantity || 1); i++) {
                const giftCard = await giftCardService.createGiftCard({
                    value,
                    currency_code: order.currency_code || "usd",
                    type: giftCardType as "digital" | "physical",
                    customer_id: customerId,
                    order_id: order.id,
                    line_item_id: item.id,
                    engraving_text: engravingText,
                    engraving_metadata: engravingMetadata,
                })
                createdGiftCards.push(giftCard)
            }

            console.log(`Generated ${item.quantity || 1} gift card(s) for order ${order.id}, line item ${item.id}`)

            // For digital gift cards, send email with code
            if (giftCardType === "digital") {
                const { sendGiftCardEmailWorkflow } = await import("../workflows/send-gift-card-email.js")
                
                for (const giftCard of createdGiftCards) {
                    try {
                        if (order.email) {
                            await sendGiftCardEmailWorkflow(container).run({
                                input: {
                                    gift_card_code: giftCard.code,
                                    gift_card_value: giftCard.value,
                                    customer_email: order.email,
                                    customer_name: order.customer ? 
                                        `${order.customer.first_name || ""} ${order.customer.last_name || ""}`.trim() : 
                                        undefined,
                                },
                            })
                            console.log(`Sent gift card email to ${order.email} for code ${giftCard.code}`)
                        } else {
                            console.warn(`No email address for order ${order.id}, cannot send gift card email`)
                        }
                    } catch (emailError) {
                        console.error("Error sending gift card email:", emailError)
                        // Don't fail the order if email fails
                    }
                }
            }

            // For physical gift cards, create order proof for engraving approval
            if (giftCardType === "physical" && engravingText) {
                try {
                    const orderProofService = container.resolve<OrderProofModuleService>(ORDER_PROOF_MODULE)
                    if (orderProofService) {
                        // Create order proof for physical gift card engraving
                        await orderProofService.createOrderProofs({
                            order_id: order.id,
                            status: "pending",
                            customer_notes: `Gift card engraving: ${engravingText}`,
                        })
                        console.log(`Created order proof for physical gift card in order ${order.id}`)
                    }
                } catch (proofError) {
                    console.error("Error creating order proof for gift card:", proofError)
                    // Don't fail the order if proof creation fails
                }
            }
        }
    } catch (error) {
        console.error("Error generating gift cards:", error)
        // Don't throw - we don't want to fail the order if gift card generation fails
        // The order should still complete successfully
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
    context: {
        subscriberId: "generate-gift-cards-subscriber",
    },
}
