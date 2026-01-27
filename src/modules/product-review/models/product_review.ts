import { model } from "@medusajs/framework/utils"

/**
 * ProductReview data model
 * Stores customer product reviews
 */
const ProductReview = model.define("product_review", {
    id: model.id().primaryKey(),
    product_id: model.text().index(), // Medusa product ID
    customer_id: model.text().index().nullable(), // Medusa customer ID (nullable for guest reviews)
    order_id: model.text().nullable(), // Order ID if review is from purchase
    rating: model.number(), // 1-5 stars
    title: model.text().nullable(),
    comment: model.text().nullable(),
    status: model.enum(["pending", "approved", "rejected"]).default("pending"),
    helpful_count: model.number().default(0),
    metadata: model.json().nullable(),
})

export default ProductReview
