import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../../modules/gift-card"
import GiftCardModuleService from "../../../../modules/gift-card/service"

/**
 * GET /admin/gift-cards/:id
 * Get a specific gift card by ID
 */
export async function GET(
    req: MedusaRequest<{ id: string }>,
    res: MedusaResponse
) {
    const { id } = req.params

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCards = await giftCardService.listGiftCards({ id })
        
        if (giftCards.length === 0) {
            return res.status(404).json({
                message: "Gift card not found",
            })
        }

        return res.json({ gift_card: giftCards[0] })
    } catch (error) {
        console.error("Error fetching gift card:", error)
        return res.status(500).json({
            message: "Failed to fetch gift card",
        })
    }
}

/**
 * POST /admin/gift-cards/:id/redeem
 * Admin redeem a gift card for a customer
 */
export async function POST(
    req: MedusaRequest<{ id: string }>,
    res: MedusaResponse
) {
    const { id } = req.params
    const { customer_id } = req.body

    if (!customer_id) {
        return res.status(400).json({
            message: "customer_id is required",
        })
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCards = await giftCardService.listGiftCards({ id })
        
        if (giftCards.length === 0) {
            return res.status(404).json({
                message: "Gift card not found",
            })
        }

        const giftCard = giftCards[0]
        
        if (giftCard.status === "redeemed") {
            return res.status(400).json({
                message: "Gift card has already been redeemed",
            })
        }

        await giftCardService.redeemGiftCard(giftCard.code, customer_id)

        return res.json({
            message: "Gift card redeemed successfully",
            gift_card: await giftCardService.listGiftCards({ id }).then(cards => cards[0]),
        })
    } catch (error) {
        console.error("Error redeeming gift card:", error)
        return res.status(500).json({
            message: "Failed to redeem gift card",
        })
    }
}
