import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { NEWSLETTER_SUBSCRIPTION_MODULE } from "../../../modules/newsletter-subscription"
import { sendNewsletterWelcomeWorkflow } from "../../../workflows/send-newsletter-welcome"

interface NewsletterSubscriptionRequestBody {
    email: string;
}

export async function POST(
    req: MedusaRequest<NewsletterSubscriptionRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const newsletterService = req.scope.resolve(NEWSLETTER_SUBSCRIPTION_MODULE)

    const { email } = req.body

    const subscription = await newsletterService.subscribe(email)

    // Send welcome email via workflow (only if new subscription)
    if (subscription) {
        try {
            await sendNewsletterWelcomeWorkflow(req.scope).run({
                input: {
                    email,
                },
            })
        } catch (error) {
            console.error("Failed to send newsletter welcome email:", error)
            // Don't fail the request if email fails
        }
    }

    res.json({ newsletter_subscription: subscription })
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const newsletterService = req.scope.resolve(NEWSLETTER_SUBSCRIPTION_MODULE)

    const subscriptions = await newsletterService.listNewsletterSubscriptions()

    res.json({ newsletter_subscriptions: subscriptions })
}
