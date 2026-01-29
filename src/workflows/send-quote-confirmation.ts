import { createWorkflow, transform } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
    email: string
    name: string
    quantity: string
    product_type: string
}

export const sendQuoteConfirmationWorkflow = createWorkflow(
    "send-quote-confirmation",
    (input: WorkflowInput) => {
        const notifications = transform({ input }, (data) => [
            {
                to: data.input.email,
                channel: "email",
                content: {
                    subject: "Quote Request Received - We'll Get Back to You Soon!",
                    html: `
                        <html>
                            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                    <h1 style="color: #c9a962;">Quote Request Received!</h1>
                                    <p>Hi ${data.input.name},</p>
                                    <p>Thank you for your quote request. We've received the following details:</p>
                                    <ul>
                                        <li><strong>Quantity:</strong> ${data.input.quantity}</li>
                                        <li><strong>Product Type:</strong> ${data.input.product_type}</li>
                                    </ul>
                                    <p>Our team will review your request and get back to you within 24 hours with a custom quote.</p>
                                    <p>In the meantime, feel free to explore our <a href="https://grogan-engrave.com/products" style="color: #c9a962;">products</a> or visit our <a href="https://grogan-engrave.com/studio" style="color: #c9a962;">design studio</a>.</p>
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
                    name: data.input.name,
                    quantity: data.input.quantity,
                    product_type: data.input.product_type,
                },
            },
        ])

        sendNotificationsStep(notifications)
    }
)
