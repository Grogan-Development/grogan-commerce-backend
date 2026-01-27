import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_REQUEST_MODULE } from "../../../modules/quote-request"
import { sendQuoteConfirmationWorkflow } from "../../../workflows/send-quote-confirmation"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const quoteRequestService = req.scope.resolve(QUOTE_REQUEST_MODULE)

    const { name, email, phone, company, quantity, productType, occasion, message, deadline } = req.body

    const quoteRequest = await quoteRequestService.createQuoteRequests({
        name,
        email,
        phone: phone || null,
        company: company || null,
        quantity,
        product_type: productType,
        occasion: occasion || null,
        message: message || null,
        deadline: deadline || null,
        status: "pending",
    })

    // Send confirmation email via workflow
    try {
        await sendQuoteConfirmationWorkflow(req.scope).run({
            input: {
                email,
                name,
                quantity,
                product_type: productType,
            },
        })
    } catch (error) {
        console.error("Failed to send quote confirmation email:", error)
        // Don't fail the request if email fails
    }

    res.json({ quote_request: quoteRequest })
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const quoteRequestService = req.scope.resolve(QUOTE_REQUEST_MODULE)

    const quoteRequests = await quoteRequestService.listQuoteRequests()

    res.json({ quote_requests: quoteRequests })
}
