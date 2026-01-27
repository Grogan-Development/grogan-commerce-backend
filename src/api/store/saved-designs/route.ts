import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SAVED_DESIGN_MODULE } from "../../../modules/saved-design"
import SavedDesignModuleService from "../../../modules/saved-design/service"

type QueryParams = {
    customer_id?: string
}

/**
 * GET /store/saved-designs
 * Get saved designs for a customer
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

    const savedDesignService = req.scope.resolve<SavedDesignModuleService>(
        SAVED_DESIGN_MODULE
    )

    try {
        const designs = await savedDesignService.listSavedDesigns({
            customer_id,
        })

        return res.json({ designs })
    } catch (error) {
        console.error("Error fetching saved designs:", error)
        return res.status(500).json({
            message: "Failed to fetch saved designs",
        })
    }
}

/**
 * POST /store/saved-designs
 * Create a new saved design
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
) {
    const { customer_id, design_data, product_id, name } = req.body

    if (!customer_id || !design_data) {
        return res.status(400).json({
            message: "customer_id and design_data are required",
        })
    }

    const savedDesignService = req.scope.resolve<SavedDesignModuleService>(
        SAVED_DESIGN_MODULE
    )

    try {
        const design = await savedDesignService.createSavedDesigns({
            customer_id,
            design_data,
            product_id: product_id || null,
            name: name || "Untitled Design",
        })

        return res.status(201).json({ design })
    } catch (error) {
        console.error("Error creating saved design:", error)
        return res.status(500).json({
            message: "Failed to create saved design",
        })
    }
}

/**
 * DELETE /store/saved-designs?id=design_id
 * Delete a saved design
 */
export async function DELETE(
    req: MedusaRequest<unknown, { id?: string }>,
    res: MedusaResponse
) {
    const { id } = req.query as { id?: string }

    if (!id) {
        return res.status(400).json({
            message: "id is required",
        })
    }

    const savedDesignService = req.scope.resolve<SavedDesignModuleService>(
        SAVED_DESIGN_MODULE
    )

    try {
        await savedDesignService.deleteSavedDesigns(id)
        return res.status(204).send()
    } catch (error) {
        console.error("Error deleting saved design:", error)
        return res.status(500).json({
            message: "Failed to delete saved design",
        })
    }
}
