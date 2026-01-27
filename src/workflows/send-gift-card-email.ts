import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
    gift_card_code: string
    gift_card_value: number
    customer_email: string
    customer_name?: string
}

/**
 * Workflow to send gift card code via email
 * Uses Medusa's notification system
 */
export const sendGiftCardEmailWorkflow = createWorkflow(
    "send-gift-card-email",
    (input: WorkflowInput) => {
        return sendNotificationsStep({
            to: input.customer_email,
            channel: "email",
            content: {
                subject: "Your Gift Card from Grogan Engrave",
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h1 style="color: #c9a962;">Your Gift Card is Ready!</h1>
                                <p>Hi ${input.customer_name || "there"},</p>
                                <p>Thank you for your purchase! Your gift card code is below.</p>
                                <div style="background-color: #f5f5f5; border: 2px dashed #c9a962; padding: 20px; 
                                            text-align: center; margin: 30px 0; border-radius: 8px;">
                                    <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Gift Card Code</p>
                                    <p style="margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 2px; 
                                             color: #c9a962; font-family: monospace;">
                                        ${input.gift_card_code}
                                    </p>
                                    <p style="margin: 10px 0 0 0; font-size: 18px; color: #333;">
                                        Value: $${(input.gift_card_value / 100).toFixed(2)}
                                    </p>
                                </div>
                                <div style="background-color: #fff3cd; border-left: 4px solid #c9a962; padding: 15px; 
                                            margin: 20px 0; border-radius: 4px;">
                                    <p style="margin: 0; font-size: 14px; color: #856404;">
                                        <strong>Important:</strong> This gift card does not expire and has no fees, 
                                        in accordance with Washington State law.
                                    </p>
                                </div>
                                <p>You can redeem this gift card at checkout or in your account settings.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="https://groganengrave.com/account/gift-cards" 
                                       style="background-color: #c9a962; color: white; padding: 12px 24px; 
                                              text-decoration: none; border-radius: 4px; display: inline-block;">
                                        Redeem Gift Card
                                    </a>
                                </div>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="font-size: 12px; color: #666;">
                                    Questions? Reply to this email or contact us at hello@groganengrave.com
                                </p>
                            </div>
                        </body>
                    </html>
                `,
            },
            data: {
                gift_card_code: input.gift_card_code,
                gift_card_value: input.gift_card_value,
            },
        })
    }
)

export default sendGiftCardEmailWorkflow
