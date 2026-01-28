import {
    type SubscriberConfig,
    type SubscriberArgs,
} from "@medusajs/medusa"
import { GIFT_CARD_MODULE } from "../modules/gift-card"
import GiftCardModuleService from "../modules/gift-card/service"

/**
 * Subscriber that applies store credit when an order is placed
 * Deducts the store credit balance that was applied to the cart
 */
export default async function applyStoreCreditOnOrderSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const giftCardService = container.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )
    const orderService = container.resolve<{ retrieve: (id: string, options?: any) => Promise<any> }>("orderService")

    try {
        // Retrieve the order
        const order = await orderService.retrieve(data.id, {
            relations: ["cart"],
        })

        // Check if store credit was applied (stored in cart metadata)
        const storeCreditApplied = order.cart?.metadata?.store_credit_applied
        const storeCreditCustomerId = order.cart?.metadata?.store_credit_customer_id

        if (storeCreditApplied && storeCreditCustomerId) {
            const amountInCents = Number(storeCreditApplied)
            
            // Deduct the store credit balance
            await giftCardService.applyStoreCredit(storeCreditCustomerId, amountInCents)
            
            console.log(`Applied $${amountInCents / 100} store credit to order ${order.id} for customer ${storeCreditCustomerId}`)
        }
    } catch (error) {
        console.error("Error applying store credit to order:", error)
        // Don't throw - we don't want to fail the order if store credit application fails
    }
}

export const config: SubscriberConfig = {
    event: "order.placed",
    context: {
        subscriberId: "apply-store-credit-on-order-subscriber",
    },
}
