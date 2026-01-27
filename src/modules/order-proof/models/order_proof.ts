import { model } from "@medusajs/framework/utils"

/**
 * OrderProof data model
 * Stores proof images and approval status for custom orders
 */
const OrderProof = model.define("order_proof", {
    id: model.id().primaryKey(),
    order_id: model.text().index(), // Medusa order ID
    proof_image_url: model.text(), // URL from File Module (managed S3)
    status: model.enum(["pending", "approved", "revision_requested"]).default("pending"),
    revision_count: model.number().default(0),
    customer_notes: model.text().nullable(),
    admin_notes: model.text().nullable(),
    metadata: model.json().nullable(),
})

export default OrderProof
