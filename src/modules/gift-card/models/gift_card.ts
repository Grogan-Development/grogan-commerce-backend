import { model } from "@medusajs/framework/utils"

/**
 * GiftCard data model
 * Stores gift card information including codes, values, and redemption status
 * Complies with Washington State RCW 19.240 and federal CARD Act requirements
 */
const GiftCard = model.define("gift_card", {
    id: model.id().primaryKey(),
    code: model.text().unique(), // Unique gift card code (e.g., "GC-XXXX-XXXX-XXXX")
    value: model.number(), // Gift card value in cents
    currency_code: model.text().default("usd"),
    status: model.enum(["unused", "redeemed", "expired"]).default("unused"),
    type: model.enum(["digital", "physical"]), // Digital (email) or physical (engraved)
    
    // Customer and order tracking
    customer_id: model.text().nullable(), // Customer who purchased the gift card
    order_id: model.text().nullable(), // Order that generated this gift card
    line_item_id: model.text().nullable(), // Line item from the order
    
    // Physical gift card engraving
    engraving_text: model.text().nullable(), // Text to engrave on physical gift card
    engraving_metadata: model.json().nullable(), // Additional engraving configuration
    
    // Legal compliance fields (Washington State / Federal)
    purchased_at: model.dateTime(), // Required for abandoned property tracking (3-year rule)
    expires_at: model.dateTime().nullable(), // Set to 5+ years for federal compliance, but never enforced per WA state
    is_expirable: model.boolean().default(false), // False for purchased gift cards (WA state prohibits expiration)
    abandoned_at: model.dateTime().nullable(), // Calculated after 3 years of non-use
    abandoned_reported: model.boolean().default(false), // Track if reported to WA DOR
    
    // Redemption tracking
    redeemed_at: model.dateTime().nullable(),
    redeemed_by_customer_id: model.text().nullable(), // Customer who redeemed (may differ from purchaser)
    
    // Additional metadata
    metadata: model.json().nullable(),
})

export default GiftCard
