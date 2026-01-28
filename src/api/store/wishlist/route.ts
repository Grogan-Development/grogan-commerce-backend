import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"

type QueryParams = {
    customer_id?: string
}

/**
 * GET /store/wishlist
 * Get wishlist items for a customer
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

    const wishlistService = req.scope.resolve<WishlistModuleService>(
        WISHLIST_MODULE
    )

    try {
        const items = await wishlistService.listWishlistItems({
            customer_id,
        })

        return res.json({ items })
    } catch (error) {
        console.error("Error fetching wishlist:", error)
        return res.status(500).json({
            message: "Failed to fetch wishlist",
        })
    }
}

interface WishlistItemRequestBody {
    customer_id: string;
    product_id: string;
    variant_id?: string;
}

/**
 * POST /store/wishlist
 * Add item to wishlist
 */
export async function POST(
    req: MedusaRequest<WishlistItemRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const { customer_id, product_id, variant_id } = req.body

    if (!customer_id || !product_id) {
        res.status(400).json({
            message: "customer_id and product_id are required",
        })
        return
    }

    const wishlistService = req.scope.resolve<WishlistModuleService>(
        WISHLIST_MODULE
    )

    try {
        // Check if item already exists
        const existing = await wishlistService.listWishlistItems({
            customer_id,
            product_id,
            variant_id: variant_id || null,
        })

        if (existing.length > 0) {
            res.status(409).json({
                message: "Item already in wishlist",
                item: existing[0],
            })
            return
        }

        const item = await wishlistService.createWishlistItems({
            customer_id,
            product_id,
            variant_id: variant_id || null,
        })

        res.status(201).json({ item })
    } catch (error) {
        console.error("Error adding to wishlist:", error)
        res.status(500).json({
            message: "Failed to add to wishlist",
        })
    }
}

/**
 * DELETE /store/wishlist?id=item_id
 * Remove item from wishlist
 */
export async function DELETE(
    req: MedusaRequest<unknown, { id?: string }>,
    res: MedusaResponse
): Promise<void> {
    const { id } = req.query as { id?: string }

    if (!id) {
        res.status(400).json({
            message: "id is required",
        })
        return
    }

    const wishlistService = req.scope.resolve<WishlistModuleService>(
        WISHLIST_MODULE
    )

    try {
        await wishlistService.deleteWishlistItems(id)
        res.status(204).send()
    } catch (error) {
        console.error("Error removing from wishlist:", error)
        res.status(500).json({
            message: "Failed to remove from wishlist",
        })
    }
}
