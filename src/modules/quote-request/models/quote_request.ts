import { model } from "@medusajs/framework/utils"

/**
 * QuoteRequest data model
 * Stores quote request form submissions
 */
const QuoteRequest = model.define("quote_request", {
    id: model.id().primaryKey(),
    name: model.text(),
    email: model.text(),
    phone: model.text().nullable(),
    company: model.text().nullable(),
    quantity: model.text(),
    product_type: model.text(),
    occasion: model.text().nullable(),
    message: model.text().nullable(),
    deadline: model.text().nullable(),
    status: model.enum(["pending", "quoted", "accepted", "declined"]).default("pending"),
    quoted_price: model.number().nullable(),
    metadata: model.json().nullable(),
})

export default QuoteRequest
