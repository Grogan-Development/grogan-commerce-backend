import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { sendNotificationsStep } from "@medusajs/medusa/core-flows"

type WorkflowInput = {
    email: string
    name: string
    subject: string
}

export const sendContactConfirmationWorkflow = createWorkflow(
    "send-contact-confirmation",
    (input: WorkflowInput) => {
        return sendNotificationsStep({
            to: input.email,
            channel: "email",
            content: {
                subject: "We've Received Your Message",
                html: `
                    <html>
                        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                                <h1 style="color: #c9a962;">Thank You for Contacting Us!</h1>
                                <p>Hi ${input.name},</p>
                                <p>We've received your message regarding "${input.subject}" and will get back to you within 24 hours.</p>
                                <p>In the meantime, feel free to browse our <a href="https://grogan-engrave.com/collections" style="color: #c9a962;">collections</a> or check out our <a href="https://grogan-engrave.com/studio" style="color: #c9a962;">design studio</a>.</p>
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
                subject: input.subject,
            },
        })
    }
)
