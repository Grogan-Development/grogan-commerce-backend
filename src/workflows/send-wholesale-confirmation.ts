import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
    email: string
    name: string
    company?: string
    quantity: string
    product_type: string
}

export const sendWholesaleConfirmationWorkflow = createWorkflow(
    "send-wholesale-confirmation",
    (input: WorkflowInput) => {
        sendNotificationsStep({
            to: input.email,
            channel: "email",
            content: {
                subject: "Wholesale Inquiry Received - We'll Be In Touch Soon!",
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h1 style="color: #c9a962;">Wholesale Inquiry Received!</h1>
                                <p>Hi ${input.name}${input.company ? ` from ${input.company}` : ""},</p>
                                <p>Thank you for your wholesale inquiry. We've received the following details:</p>
                                <ul>
                                    <li><strong>Quantity:</strong> ${input.quantity}</li>
                                    <li><strong>Product Type:</strong> ${input.product_type}</li>
                                    ${input.company ? `<li><strong>Company:</strong> ${input.company}</li>` : ""}
                                </ul>
                                <p>Our wholesale team will review your inquiry and get back to you soon with pricing and details.</p>
                                <p>In the meantime, feel free to explore our <a href="https://grogan-engrave.com/wholesale" style="color: #c9a962;">wholesale page</a> for more information.</p>
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
                name: input.name,
                company: input.company,
                quantity: input.quantity,
                product_type: input.product_type,
            },
        }])
    }
)
