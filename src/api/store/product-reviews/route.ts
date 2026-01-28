import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import ProductReviewModuleService from "../../../modules/product-review/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type QueryParams = {
    product_id?: string
    approved_only?: string
}

/**
 * GET /store/product-reviews
 * Get reviews for a product
 */
export async function GET(
    req: MedusaRequest<unknown, QueryParams>,
    res: MedusaResponse
): Promise<void> {
    const { product_id, approved_only } = req.query as QueryParams

    if (!product_id) {
        res.status(400).json({
            message: "product_id is required",
        })
        return
    }

    const reviewService = req.scope.resolve<ProductReviewModuleService>(
        PRODUCT_REVIEW_MODULE
    )

    try {
        const reviews = await reviewService.getProductReviews(product_id, {
            approvedOnly: approved_only === "true",
        })

        const averageRating = await reviewService.getAverageRating(product_id)
        const reviewCount = await reviewService.getReviewCount(product_id)

        res.json({
            reviews,
            average_rating: averageRating,
            review_count: reviewCount,
        })
    } catch (error) {
        console.error("Error fetching reviews:", error)
        res.status(500).json({
            message: "Failed to fetch reviews",
        })
    }
}

interface ProductReviewRequestBody {
    product_id: string;
    customer_id?: string;
    order_id?: string;
    rating: number;
    title?: string;
    comment?: string;
}

/**
 * POST /store/product-reviews
 * Create a new product review
 */
export async function POST(
    req: MedusaRequest<ProductReviewRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const { product_id, customer_id, order_id, rating, title, comment } = req.body

    if (!product_id || !rating) {
        res.status(400).json({
            message: "product_id and rating are required",
        })
        return
    }

    if (rating < 1 || rating > 5) {
        res.status(400).json({
            message: "rating must be between 1 and 5",
        })
        return
    }

    const reviewService = req.scope.resolve<ProductReviewModuleService>(
        PRODUCT_REVIEW_MODULE
    )

    try {
        const review = await reviewService.createProductReviews({
            product_id,
            customer_id: customer_id || null,
            order_id: order_id || null,
            rating,
            title: title || null,
            comment: comment || null,
            status: "pending", // Requires moderation
            helpful_count: 0,
        })

        res.status(201).json({ review })
    } catch (error) {
        console.error("Error creating review:", error)
        res.status(500).json({
            message: "Failed to create review",
        })
    }
}
