import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../../modules/gift-card"
import GiftCardModuleService from "../../../../modules/gift-card/service"

/**
 * GET /admin/gift-cards/:id
 * Get a specific gift card by ID
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const { id } = req.params

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCards = await giftCardService.listGiftCards({ id })
        
        if (giftCards.length === 0) {
            res.status(404).json({
                message: "Gift card not found",
            })
            return
        }

        res.json({ gift_card: giftCards[0] })
    } catch (error) {
        console.error("Error fetching gift card:", error)
        res.status(500).json({
            message: "Failed to fetch gift card",
        })
    }
}

interface RedeemGiftCardRequestBody {
    customer_id: string;
}

/**
 * POST /admin/gift-cards/:id/redeem
 * Admin redeem a gift card for a customer
 */
export async function POST(
    req: MedusaRequest<RedeemGiftCardRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const { id } = req.params
    const { customer_id } = req.body

    if (!customer_id) {
        res.status(400).json({
            message: "customer_id is required",
        })
        return
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCards = await giftCardService.listGiftCards({ id })
        
        if (giftCards.length === 0) {
            res.status(404).json({
                message: "Gift card not found",
            })
            return
        }

        const giftCard = giftCards[0]
        
        if (giftCard.status === "redeemed") {
            res.status(400).json({
                message: "Gift card has already been redeemed",
            })
            return
        }

        await giftCardService.redeemGiftCard(giftCard.code, customer_id)

        res.json({
            message: "Gift card redeemed successfully",
            gift_card: await giftCardService.listGiftCards({ id }).then(cards => cards[0]),
        })
    } catch (error) {
        console.error("Error redeeming gift card:", error)
        res.status(500).json({
            message: "Failed to redeem gift card",
        })
    }
}
