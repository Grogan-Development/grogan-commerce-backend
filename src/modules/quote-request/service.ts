import { MedusaService } from "@medusajs/framework/utils"
import { QuoteRequest } from "./models"

/**
 * QuoteRequestModuleService
 * Auto-generates CRUD methods for QuoteRequest
 */
class QuoteRequestModuleService extends MedusaService({
    QuoteRequest,
}) {}

export default QuoteRequestModuleService
