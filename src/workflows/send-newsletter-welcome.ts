import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
    email: string
}

export const sendNewsletterWelcomeWorkflow = createWorkflow(
    "send-newsletter-welcome",
    (input: WorkflowInput) => {
        sendNotificationsStep({
            to: input.email,
            channel: "email",
            content: {
                subject: "Welcome to Grogan Engrave!",
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h1 style="color: #c9a962;">Welcome to Grogan Engrave!</h1>
                                <p>Thank you for subscribing to our newsletter!</p>
                                <p>You'll now receive:</p>
                                <ul>
                                    <li>Design tips and inspiration</li>
                                    <li>Exclusive offers and promotions</li>
                                    <li>New product announcements</li>
                                    <li>Seasonal collection highlights</li>
                                </ul>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="https://grogan-engrave.com/studio" 
                                       style="background-color: #c9a962; color: white; padding: 12px 24px; 
                                              text-decoration: none; border-radius: 4px; display: inline-block;">
                                        Start Designing
                                    </a>
                                </div>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="font-size: 12px; color: #666;">
                                    Don't want to receive these emails? <a href="https://grogan-engrave.com/unsubscribe?email=${input.email}" style="color: #c9a962;">Unsubscribe here</a>
                                </p>
                            </div>
                        </body>
                    </html>
                `,
            },
            data: {
                email: input.email,
            },
        })
    }
)
