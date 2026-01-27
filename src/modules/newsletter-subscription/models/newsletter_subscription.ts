import { model } from "@medusajs/framework/utils"

/**
 * NewsletterSubscription data model
 * Stores newsletter subscription emails
 */
const NewsletterSubscription = model.define("newsletter_subscription", {
    id: model.id().primaryKey(),
    email: model.text().index(),
    status: model.enum(["active", "unsubscribed", "bounced"]).default("active"),
    subscribed_at: model.dateTime(),
    unsubscribed_at: model.dateTime().nullable(),
    metadata: model.json().nullable(),
})

export default NewsletterSubscription
