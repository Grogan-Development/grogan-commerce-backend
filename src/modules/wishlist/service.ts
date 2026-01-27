import { MedusaService } from "@medusajs/framework/utils"
import { WishlistItem } from "./models"

/**
 * WishlistModuleService
 * Auto-generates CRUD methods for WishlistItem
 */
class WishlistModuleService extends MedusaService({
    WishlistItem,
}) {
    /**
     * Get all wishlist items for a customer
     */
    async getCustomerWishlist(customerId: string) {
        return await this.listWishlistItems({
            customer_id: customerId,
        })
    }

    /**
     * Check if product is in wishlist
     */
    async isInWishlist(customerId: string, productId: string) {
        const items = await this.listWishlistItems({
            customer_id: customerId,
            product_id: productId,
        })
        return items.length > 0
    }

    /**
     * Add to wishlist
     */
    async addToWishlist(customerId: string, productId: string, variantId?: string) {
        const existing = await this.isInWishlist(customerId, productId)
        if (existing) {
            return null // Already in wishlist
        }

        return await this.createWishlistItems({
            customer_id: customerId,
            product_id: productId,
            variant_id: variantId,
        })
    }

    /**
     * Remove from wishlist
     */
    async removeFromWishlist(customerId: string, productId: string) {
        const items = await this.listWishlistItems({
            customer_id: customerId,
            product_id: productId,
        })
        
        if (items.length === 0) {
            return null
        }

        return await this.deleteWishlistItems(items[0].id)
    }
}

export default WishlistModuleService
