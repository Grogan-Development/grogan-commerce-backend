import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { GIFT_CARD_MODULE } from "../../../modules/gift-card"
import GiftCardModuleService from "../../../modules/gift-card/service"

type QueryParams = {
    id?: string
    customer_id?: string
    status?: string
    limit?: number
    offset?: number
}

/**
 * GET /admin/gift-cards
 * List all gift cards with optional filtering
 */
export async function GET(
    req: MedusaRequest<unknown, QueryParams>,
    res: MedusaResponse
) {
    const { id, customer_id, status, limit, offset } = req.query as QueryParams

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const filters: any = {}
        if (id) filters.id = id
        if (customer_id) filters.customer_id = customer_id
        if (status) filters.status = status

        const giftCards = await giftCardService.listGiftCards(filters)

        return res.json({ gift_cards: giftCards })
    } catch (error) {
        console.error("Error fetching gift cards:", error)
        return res.status(500).json({
            message: "Failed to fetch gift cards",
        })
    }
}

interface GiftCardRequestBody {
    value: number;
    currency_code?: string;
    type: string;
    customer_id?: string;
    engraving_text?: string;
    engraving_metadata?: any;
}

/**
 * POST /admin/gift-cards
 * Create a gift card manually (admin only)
 */
export async function POST(
    req: MedusaRequest<GiftCardRequestBody>,
    res: MedusaResponse
) {
    const {
        value,
        currency_code,
        type,
        customer_id,
        engraving_text,
        engraving_metadata,
    } = req.body

    if (!value || !type) {
        return res.status(400).json({
            message: "value and type are required",
        })
    }

    const giftCardService = req.scope.resolve<GiftCardModuleService>(
        GIFT_CARD_MODULE
    )

    try {
        const giftCard = await giftCardService.createGiftCard({
            value: Math.round(value * 100), // Convert to cents
            currency_code: currency_code || "usd",
            type,
            customer_id,
            engraving_text,
            engraving_metadata,
        })

        return res.status(201).json({ gift_card: giftCard })
    } catch (error) {
        console.error("Error creating gift card:", error)
        return res.status(500).json({
            message: "Failed to create gift card",
        })
    }
}
