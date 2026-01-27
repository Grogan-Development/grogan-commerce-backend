import { MedusaService } from "@medusajs/framework/utils"
import { ProductReview } from "./models"

/**
 * ProductReviewModuleService
 * Auto-generates CRUD methods for ProductReview
 */
class ProductReviewModuleService extends MedusaService({
    ProductReview,
}) {
    /**
     * Get reviews for a product
     */
    async getProductReviews(productId: string, options?: { approvedOnly?: boolean }) {
        const filters: any = { product_id: productId }
        if (options?.approvedOnly) {
            filters.status = "approved"
        }
        return await this.listProductReviews(filters)
    }

    /**
     * Get average rating for a product
     */
    async getAverageRating(productId: string) {
        const reviews = await this.getProductReviews(productId, { approvedOnly: true })
        if (reviews.length === 0) return 0
        
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
        return sum / reviews.length
    }

    /**
     * Get review count for a product
     */
    async getReviewCount(productId: string) {
        const reviews = await this.getProductReviews(productId, { approvedOnly: true })
        return reviews.length
    }
}

export default ProductReviewModuleService
