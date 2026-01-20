import { MedusaService } from "@medusajs/framework/utils"
import { EngravingTemplate, EngravingZone } from "./models"

/**
 * EngravingModuleService
 * Auto-generates CRUD methods for EngravingTemplate and EngravingZone
 */
class EngravingModuleService extends MedusaService({
    EngravingTemplate,
    EngravingZone,
}) {
    /**
     * Find a template by product type
     */
    async findByProductType(productType: string) {
        const templates = await this.listEngravingTemplates({
            product_type: productType,
        })
        return templates[0] || null
    }
}

export default EngravingModuleService
