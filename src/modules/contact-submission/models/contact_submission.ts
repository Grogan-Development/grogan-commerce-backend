import { model } from "@medusajs/framework/utils"

/**
 * ContactSubmission data model
 * Stores contact form submissions
 */
const ContactSubmission = model.define("contact_submission", {
    id: model.id().primaryKey(),
    name: model.text(),
    email: model.text(),
    phone: model.text().nullable(),
    subject: model.text(),
    message: model.text(),
    status: model.enum(["new", "read", "replied", "archived"]).default("new"),
    metadata: model.json().nullable(),
})

export default ContactSubmission
