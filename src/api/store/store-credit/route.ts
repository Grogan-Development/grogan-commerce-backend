import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../modules/gift-card"
import GiftCardModuleService from "../../../modules/gift-card/service"
import { Modules } from "@medusajs/framework/utils"

type QueryParams = {
    customer_id?: string
}

/**
 * GET /store/store-credit?customer_id=XXX
 * Get customer's store credit balance
 */
export async function GET(
    req: MedusaRequest<unknown, QueryParams>,
    res: MedusaResponse
) {
    const { customer_id } = req.query as QueryParams

    if (!customer_id) {
        return res.status(400).json({
            message: "customer_id is required",
        })
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const balance = await giftCardService.getStoreCredit(customer_id)

        return res.json({
            customer_id,
            balance,
            currency_code: "usd",
        })
    } catch (error) {
        console.error("Error fetching store credit:", error)
        return res.status(500).json({
            message: "Failed to fetch store credit",
        })
    }
}

/**
 * POST /store/store-credit/apply
 * Apply store credit to a cart
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { customer_id, cart_id, amount } = req.body

    if (!customer_id || amount === undefined) {
        return res.status(400).json({
            message: "customer_id and amount are required",
        })
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const amountInCents = Math.round(amount * 100) // Convert to cents
        const balance = await giftCardService.getStoreCredit(customer_id)
        const amountToApply = Math.min(amountInCents, balance)

        if (amountToApply <= 0 || balance <= 0) {
            return res.status(400).json({
                message: "Insufficient store credit balance",
            })
        }

        // If cart_id is provided, store the applied amount in cart metadata
        // We don't deduct the balance yet - that happens when the order is placed
        if (cart_id) {
            const cartModuleService = req.scope.resolve(Modules.CART)
            const cart = await cartModuleService.retrieveCart(cart_id)
            
            // Store applied store credit in cart metadata
            const currentMetadata = cart.metadata || {}
            await cartModuleService.updateCarts(cart_id, {
                metadata: {
                    ...currentMetadata,
                    store_credit_applied: amountToApply,
                    store_credit_customer_id: customer_id,
                },
            })
        }

        // Return the remaining balance (not yet deducted)
        // The balance will be deducted when the order is placed via subscriber
        const remainingBalance = balance - amountToApply

        res.json({
            applied: amountToApply / 100, // Convert back to dollars
            remaining_balance: remainingBalance / 100,
            currency_code: "usd",
        })
    } catch (error) {
        console.error("Error applying store credit:", error)
        res.status(500).json({
            message: "Failed to apply store credit",
        })
    }
}
