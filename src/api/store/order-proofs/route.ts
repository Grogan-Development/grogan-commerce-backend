import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_PROOF_MODULE } from "../../../modules/order-proof"

/**
 * Store API route for customers to view and approve proofs
 */
export async function GET(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve(ORDER_PROOF_MODULE)

    const { order_id } = req.query

    if (!order_id) {
        res.status(400).json({ message: "order_id is required" })
        return
    }

    // TODO: Verify customer owns this order
    const proof = await orderProofService.findByOrderId(order_id as string)

    if (!proof) {
        res.status(404).json({ message: "Proof not found" })
        return
    }

    res.json({ order_proof: proof })
}

/**
 * Store API route for customers to approve or request revision
 */
export async function POST(
    req: MedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve(ORDER_PROOF_MODULE)

    const { order_id, action, customer_notes } = req.body

    if (!order_id || !action) {
        res.status(400).json({ message: "order_id and action are required" })
        return
    }

    // TODO: Verify customer owns this order
    const proof = await orderProofService.findByOrderId(order_id)

    if (!proof) {
        res.status(404).json({ message: "Proof not found" })
        return
    }

    if (action === "approve") {
        await orderProofService.approveProof(proof.id)
    } else if (action === "request_revision") {
        await orderProofService.requestRevision(proof.id, customer_notes)
    } else {
        res.status(400).json({ message: "Invalid action. Use 'approve' or 'request_revision'" })
        return
    }

    const updatedProof = await orderProofService.retrieveOrderProof(proof.id)
    res.json({ order_proof: updatedProof })
}
