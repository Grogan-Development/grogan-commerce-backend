import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import EngravingModule from "../modules/engraving"

/**
 * Link between Product and EngravingTemplate
 * Allows optional product-specific template overrides
 */
export default defineLink(
    ProductModule.linkable.product,
    {
        linkable: EngravingModule.linkable.engravingTemplate,
        isList: false, // One template per product (optional override)
    }
)
