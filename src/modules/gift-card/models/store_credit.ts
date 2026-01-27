import { model } from "@medusajs/framework/utils"

/**
 * StoreCredit data model
 * Tracks store credit balance for each customer
 * Store credit never expires per Washington State law
 */
const StoreCredit = model.define("store_credit", {
    id: model.id().primaryKey(),
    customer_id: model.text().unique(), // One store credit account per customer
    balance: model.number().default(0), // Balance in cents
    currency_code: model.text().default("usd"),
    metadata: model.json().nullable(),
})

export default StoreCredit
