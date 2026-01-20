import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ENGRAVING_MODULE } from "../../../modules/engraving"
import EngravingModuleService from "../../../modules/engraving/service"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type QueryParams = {
    product_id?: string
    variant_id?: string
    product_type?: string
}

/**
 * GET /store/engraving-templates
 * 
 * Resolves an engraving template based on:
 * 1. Product-specific link (if product_id provided and linked)
 * 2. Product type fallback
 * 3. Default template as last resort
 */
export async function GET(
    req: MedusaRequest<unknown, QueryParams>,
    res: MedusaResponse
) {
    const { product_id, variant_id, product_type } = req.query as QueryParams

    const engravingService = req.scope.resolve<EngravingModuleService>(
        ENGRAVING_MODULE
    )
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    let template: Record<string, unknown> | null = null

    // 1. Try to find product-specific template via link
    if (product_id) {
        try {
            const { data: linkedData } = await query.graph({
                entity: "product",
                fields: ["id", "engraving_template.*", "engraving_template.zones.*"],
                filters: { id: product_id },
            })

            // Type assertion needed for linked module data
            const productData = linkedData?.[0] as Record<string, unknown> | undefined
            if (productData?.engraving_template) {
                template = productData.engraving_template as Record<string, unknown>
            }
        } catch (error) {
            // Link may not exist yet, continue to fallback
            console.warn("Product link query failed:", error)
        }
    }

    // 2. Fallback to product type
    if (!template && product_type) {
        const templates = await engravingService.listEngravingTemplates(
            { product_type },
            { relations: ["zones"] }
        )
        template = templates[0] || null
    }

    // 3. If still no template, try "default" type
    if (!template) {
        const templates = await engravingService.listEngravingTemplates(
            { product_type: "default" },
            { relations: ["zones"] }
        )
        template = templates[0] || null
    }

    if (!template) {
        return res.status(404).json({
            message: "No engraving template found",
            template: null,
        })
    }

    return res.json({ template })
}
