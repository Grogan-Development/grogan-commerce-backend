import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_PROOF_MODULE } from "../../../modules/order-proof"
import OrderProofModuleService from "../../../modules/order-proof/service"

interface OrderProofRequestBody {
    order_id: string;
    proof_image_url: string;
    status?: string;
    customer_notes?: string;
    admin_notes?: string;
    metadata?: any;
}

export async function POST(
    req: MedusaRequest<OrderProofRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve<OrderProofModuleService>(ORDER_PROOF_MODULE)

    const { order_id, proof_image_url, status, customer_notes, admin_notes, metadata } = req.body

    if (!proof_image_url) {
        res.status(400).json({ error: "proof_image_url is required" });
        return;
    }

    const proof = await orderProofService.upsertProof({
        order_id,
        proof_image_url,
        status: status as "pending" | "approved" | "revision_requested" | undefined,
        customer_notes: customer_notes || undefined,
        admin_notes: admin_notes || undefined,
        metadata,
    })

    res.json({ order_proof: proof })
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve<OrderProofModuleService>(ORDER_PROOF_MODULE)

    const { order_id } = req.query

    if (order_id) {
        const proof = await orderProofService.findByOrderId(order_id as string)
        res.json({ order_proof: proof })
    } else {
        const proofs = await orderProofService.listOrderProofs()
        res.json({ order_proofs: proofs })
    }
}

interface UpdateOrderProofRequestBody {
    status?: string;
    customer_notes?: string;
    admin_notes?: string;
}

export async function PATCH(
    req: MedusaRequest<UpdateOrderProofRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve<OrderProofModuleService>(ORDER_PROOF_MODULE)

    const { id } = req.params
    const { status, customer_notes, admin_notes } = req.body

    if (status === "approved") {
        await orderProofService.approveProof(id)
    } else if (status === "revision_requested") {
        await orderProofService.requestRevision(id, customer_notes)
    } else {
        await orderProofService.updateOrderProofs(id, {
            status: status as "pending" | "approved" | "revision_requested" | undefined,
            customer_notes,
            admin_notes,
        })
    }

    const proof = await orderProofService.retrieveOrderProof(id)
    res.json({ order_proof: proof })
}
