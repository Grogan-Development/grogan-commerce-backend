import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WHOLESALE_INQUIRY_MODULE } from "../../../modules/wholesale-inquiry"
import { sendWholesaleConfirmationWorkflow } from "../../../workflows/send-wholesale-confirmation"

interface WholesaleInquiryRequestBody {
    name: string;
    company?: string;
    email: string;
    phone?: string;
    quantity: string;
    productType: string;
    timeline?: string;
    message?: string;
}

export async function POST(
    req: MedusaRequest<WholesaleInquiryRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const wholesaleInquiryService = req.scope.resolve(WHOLESALE_INQUIRY_MODULE)

    const { name, company, email, phone, quantity, productType, timeline, message } = req.body

    const inquiry = await wholesaleInquiryService.createWholesaleInquiries({
        name,
        company: company || null,
        email,
        phone: phone || null,
        quantity,
        product_type: productType,
        timeline,
        message: message || null,
        status: "pending",
    })

    // Send confirmation email via workflow
    try {
        await sendWholesaleConfirmationWorkflow(req.scope).run({
            input: {
                email,
                name,
                company: company || null,
                quantity,
                product_type: productType,
            },
        })
    } catch (error) {
        console.error("Failed to send wholesale confirmation email:", error)
        // Don't fail the request if email fails
    }

    res.json({ wholesale_inquiry: inquiry })
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const wholesaleInquiryService = req.scope.resolve(WHOLESALE_INQUIRY_MODULE)

    const inquiries = await wholesaleInquiryService.listWholesaleInquiries()

    res.json({ wholesale_inquiries: inquiries })
}
