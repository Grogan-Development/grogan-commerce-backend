import OrderProofModule from "../modules/order-proof"
import OrderModule from "@medusajs/medusa/order"
import { defineLink } from "@medusajs/framework/utils"

/**
 * Link OrderProof to Order
 * Allows associating proof images with orders
 */
export default defineLink(
    OrderModule.linkable.order,
    OrderProofModule.linkable.orderProof,
    {
        isList: false, // One proof per order
        readOnly: true,
    }
)
