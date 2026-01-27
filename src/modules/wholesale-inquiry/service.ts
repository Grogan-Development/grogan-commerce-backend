import { MedusaService } from "@medusajs/framework/utils"
import { WholesaleInquiry } from "./models"

/**
 * WholesaleInquiryModuleService
 * Auto-generates CRUD methods for WholesaleInquiry
 */
class WholesaleInquiryModuleService extends MedusaService({
    WholesaleInquiry,
}) {}

export default WholesaleInquiryModuleService
