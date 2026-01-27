import { MedusaService } from "@medusajs/framework/utils"
import { SavedDesign } from "./models"

/**
 * SavedDesignModuleService
 * Auto-generates CRUD methods for SavedDesign
 */
class SavedDesignModuleService extends MedusaService({
    SavedDesign,
}) {
    /**
     * Get all saved designs for a customer
     */
    async getCustomerDesigns(customerId: string) {
        return await this.listSavedDesigns({
            customer_id: customerId,
        })
    }
}

export default SavedDesignModuleService
