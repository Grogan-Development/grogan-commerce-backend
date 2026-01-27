import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
    order_id: string
    customer_email: string
    proof_url: string
    customer_name?: string
}

export const sendProofNotificationWorkflow = createWorkflow(
    "send-proof-notification",
    (input: WorkflowInput) => {
        sendNotificationsStep({
            to: input.customer_email,
            channel: "email",
            content: {
                subject: "Your Design Proof is Ready for Review",
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h1 style="color: #c9a962;">Your Design Proof is Ready!</h1>
                                <p>Hi ${input.customer_name || "there"},</p>
                                <p>We've prepared your custom design proof and it's ready for your review.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${input.proof_url}" 
                                       style="background-color: #c9a962; color: white; padding: 12px 24px; 
                                              text-decoration: none; border-radius: 4px; display: inline-block;">
                                        Review Your Proof
                                    </a>
                                </div>
                                <p>Please review your proof carefully. Once approved, we'll begin production immediately.</p>
                                <p>Your card will not be charged until you approve the proof.</p>
                                <p>If you need any changes, please request a revision through the proof review page.</p>
                                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                                <p style="font-size: 12px; color: #666;">
                                    Order ID: ${input.order_id}<br>
                                    Questions? Reply to this email or contact us at hello@groganengrave.com
                                </p>
                            </div>
                        </body>
                    </html>
                `,
            },
            data: {
                order_id: input.order_id,
                proof_url: input.proof_url,
            },
        })
    }
)
