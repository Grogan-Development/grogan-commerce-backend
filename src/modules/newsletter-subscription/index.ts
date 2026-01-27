import NewsletterSubscriptionModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const NEWSLETTER_SUBSCRIPTION_MODULE = "newsletterSubscription"

export default Module(NEWSLETTER_SUBSCRIPTION_MODULE, {
    service: NewsletterSubscriptionModuleService,
})
