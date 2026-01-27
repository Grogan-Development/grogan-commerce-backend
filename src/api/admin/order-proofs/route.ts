import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_PROOF_MODULE } from "../../../modules/order-proof"

export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve(ORDER_PROOF_MODULE)

    const { order_id, proof_image_url, status, customer_notes, admin_notes, metadata } = req.body

    const proof = await orderProofService.upsertProof({
        order_id,
        proof_image_url,
        status,
        customer_notes,
        admin_notes,
        metadata,
    })

    res.json({ order_proof: proof })
}

export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve(ORDER_PROOF_MODULE)

    const { order_id } = req.query

    if (order_id) {
        const proof = await orderProofService.findByOrderId(order_id as string)
        res.json({ order_proof: proof })
    } else {
        const proofs = await orderProofService.listOrderProofs()
        res.json({ order_proofs: proofs })
    }
}

export async function PATCH(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve(ORDER_PROOF_MODULE)

    const { id } = req.params
    const { status, customer_notes, admin_notes } = req.body

    if (status === "approved") {
        await orderProofService.approveProof(id)
    } else if (status === "revision_requested") {
        await orderProofService.requestRevision(id, customer_notes)
    } else {
        await orderProofService.updateOrderProofs(id, {
            status,
            customer_notes,
            admin_notes,
        })
    }

    const proof = await orderProofService.retrieveOrderProof(id)
    res.json({ order_proof: proof })
}
