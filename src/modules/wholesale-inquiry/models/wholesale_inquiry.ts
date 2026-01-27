import { model } from "@medusajs/framework/utils"

/**
 * WholesaleInquiry data model
 * Stores wholesale inquiry form submissions
 */
const WholesaleInquiry = model.define("wholesale_inquiry", {
    id: model.id().primaryKey(),
    name: model.text(),
    company: model.text().nullable(),
    email: model.text(),
    phone: model.text().nullable(),
    quantity: model.text(),
    product_type: model.text(),
    timeline: model.text(),
    message: model.text().nullable(),
    status: model.enum(["pending", "contacted", "quoted", "converted", "archived"]).default("pending"),
    metadata: model.json().nullable(),
})

export default WholesaleInquiry
