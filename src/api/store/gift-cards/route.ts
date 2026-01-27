import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../modules/gift-card"
import GiftCardModuleService from "../../../modules/gift-card/service"

type QueryParams = {
    code?: string
}

/**
 * GET /store/gift-cards?code=XXX
 * Get gift card information by code (without redeeming)
 */
export async function GET(
    req: MedusaRequest<unknown, QueryParams>,
    res: MedusaResponse
): Promise<void> {
    const { code } = req.query as QueryParams

    if (!code) {
        res.status(400).json({
            message: "code is required",
        })
        return
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCards = await giftCardService.listGiftCards({ code })
        
        if (giftCards.length === 0) {
            res.status(404).json({
                message: "Gift card not found",
            })
            return
        }

        const giftCard = giftCards[0]

        // Return limited information (don't expose full details)
        res.json({
            code: giftCard.code,
            value: giftCard.value,
            currency_code: giftCard.currency_code,
            status: giftCard.status,
            type: giftCard.type,
        })
    } catch (error) {
        console.error("Error fetching gift card:", error)
        res.status(500).json({
            message: "Failed to fetch gift card",
        })
    }
}

interface RedeemGiftCardRequestBody {
    code: string;
    customer_id: string;
}

/**
 * POST /store/gift-cards/redeem
 * Redeem a gift card code and add to store credit
 */
export async function POST(
    req: MedusaRequest<RedeemGiftCardRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const { code, customer_id } = req.body

    if (!code || !customer_id) {
        res.status(400).json({
            message: "code and customer_id are required",
        })
        return
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCard = await giftCardService.redeemGiftCard(code, customer_id)
        const storeCredit = await giftCardService.getStoreCredit(customer_id)

        res.json({
            message: "Gift card redeemed successfully",
            gift_card: {
                code: giftCard.code,
                value: giftCard.value,
            },
            store_credit: storeCredit,
        })
    } catch (error: any) {
        console.error("Error redeeming gift card:", error)
        
        if (error.type === "not_found") {
            res.status(404).json({
                message: error.message || "Gift card not found",
            })
            return
        }
        
        if (error.type === "invalid_data") {
            res.status(400).json({
                message: error.message || "Invalid gift card",
            })
            return
        }

        res.status(500).json({
            message: "Failed to redeem gift card",
        })
    }
}
