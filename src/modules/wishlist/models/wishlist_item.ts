import { model } from "@medusajs/framework/utils"

/**
 * WishlistItem data model
 * Stores customer wishlist items
 */
const WishlistItem = model.define("wishlist_item", {
    id: model.id().primaryKey(),
    customer_id: model.text().index(), // Medusa customer ID
    product_id: model.text().index(), // Medusa product ID
    variant_id: model.text().nullable(), // Medusa variant ID
    metadata: model.json().nullable(),
})

export default WishlistItem
