import { MedusaService } from "@medusajs/framework/utils"
import { NewsletterSubscription } from "./models"

/**
 * NewsletterSubscriptionModuleService
 * Auto-generates CRUD methods for NewsletterSubscription
 */
class NewsletterSubscriptionModuleService extends MedusaService({
    NewsletterSubscription,
}) {
    /**
     * Find subscription by email
     */
    async findByEmail(email: string) {
        const subscriptions = await this.listNewsletterSubscriptions({
            email: email,
        })
        return subscriptions[0] || null
    }

    /**
     * Subscribe email (create or reactivate)
     */
    async subscribe(email: string) {
        const existing = await this.findByEmail(email)
        
        if (existing) {
            if (existing.status === "active") {
                return existing // Already subscribed
            }
            // Reactivate subscription
            return await this.updateNewsletterSubscriptions(existing.id, {
                status: "active",
                subscribed_at: new Date(),
                unsubscribed_at: null,
            })
        }

        // Create new subscription
        return await this.createNewsletterSubscriptions({
            email,
            status: "active",
            subscribed_at: new Date(),
        })
    }

    /**
     * Unsubscribe email
     */
    async unsubscribe(email: string) {
        const existing = await this.findByEmail(email)
        if (!existing) {
            return null
        }

        return await this.updateNewsletterSubscriptions(existing.id, {
            status: "unsubscribed",
            unsubscribed_at: new Date(),
        })
    }
}

export default NewsletterSubscriptionModuleService
