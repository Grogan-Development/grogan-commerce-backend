import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_SUBMISSION_MODULE } from "../../../modules/contact-submission"
import { sendContactConfirmationWorkflow } from "../../../workflows/send-contact-confirmation"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const contactSubmissionService = req.scope.resolve(CONTACT_SUBMISSION_MODULE)

    const { name, email, phone, subject, message } = req.body

    const submission = await contactSubmissionService.createContactSubmissions({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "new",
    })

    // Send confirmation email via workflow
    try {
        await sendContactConfirmationWorkflow(req.scope).run({
            input: {
                email,
                name,
                subject,
            },
        })
    } catch (error) {
        console.error("Failed to send contact confirmation email:", error)
        // Don't fail the request if email fails
    }

    res.json({ contact_submission: submission })
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const contactSubmissionService = req.scope.resolve(CONTACT_SUBMISSION_MODULE)

    const submissions = await contactSubmissionService.listContactSubmissions()

    res.json({ contact_submissions: submissions })
}
