import { MedusaService } from "@medusajs/framework/utils"
import { ContactSubmission } from "./models"

/**
 * ContactSubmissionModuleService
 * Auto-generates CRUD methods for ContactSubmission
 */
class ContactSubmissionModuleService extends MedusaService({
    ContactSubmission,
}) {}

export default ContactSubmissionModuleService
