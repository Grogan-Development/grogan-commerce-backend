import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ORDER_PROOF_MODULE } from "../../../modules/order-proof"
import OrderProofModuleService from "../../../modules/order-proof/service"
import { Modules } from "@medusajs/framework/utils"

/**
 * Store API route for customers to view and approve proofs
 */
export async function GET(
    req: AuthenticatedMedusaRequest,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve<OrderProofModuleService>(ORDER_PROOF_MODULE)
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    const { order_id } = req.query

    if (!order_id) {
        res.status(400).json({ message: "order_id is required" })
        return
    }

    // Verify customer is authenticated
    const customerId = req.auth_context?.actor_id
    if (!customerId) {
        res.status(401).json({ message: "Authentication required" })
        return
    }

    // Verify customer owns this order
    try {
        const order = await orderModuleService.retrieveOrder(order_id as string)
        if (order.customer_id !== customerId) {
            res.status(403).json({ message: "Access denied: Order does not belong to authenticated customer" })
            return
        }
    } catch (error) {
        res.status(404).json({ message: "Order not found" })
        return
    }

    const proof = await orderProofService.findByOrderId(order_id as string)

    if (!proof) {
        res.status(404).json({ message: "Proof not found" })
        return
    }

    res.json({ order_proof: proof })
}

interface OrderProofActionRequestBody {
    order_id: string;
    action: string;
    customer_notes?: string;
}

/**
 * Store API route for customers to approve or request revision
 */
export async function POST(
    req: AuthenticatedMedusaRequest<OrderProofActionRequestBody>,
    res: MedusaResponse
): Promise<void> {
    const orderProofService = req.scope.resolve<OrderProofModuleService>(ORDER_PROOF_MODULE)
    const orderModuleService = req.scope.resolve(Modules.ORDER)

    const { order_id, action, customer_notes } = req.body

    if (!order_id || !action) {
        res.status(400).json({ message: "order_id and action are required" })
        return
    }

    // Verify customer is authenticated
    const customerId = req.auth_context?.actor_id
    if (!customerId) {
        res.status(401).json({ message: "Authentication required" })
        return
    }

    // Verify customer owns this order
    try {
        const order = await orderModuleService.retrieveOrder(order_id)
        if (order.customer_id !== customerId) {
            res.status(403).json({ message: "Access denied: Order does not belong to authenticated customer" })
            return
        }
    } catch (error) {
        res.status(404).json({ message: "Order not found" })
        return
    }

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
