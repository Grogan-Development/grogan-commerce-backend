import { MedusaService } from "@medusajs/framework/utils"
import { OrderProof } from "./models"

/**
 * OrderProofModuleService
 * Auto-generates CRUD methods for OrderProof
 */
class OrderProofModuleService extends MedusaService({
    OrderProof,
}) {
    /**
     * Find proof by order ID
     */
    async findByOrderId(orderId: string) {
        const proofs = await this.listOrderProofs({
            order_id: orderId,
        })
        return proofs[0] || null
    }

    /**
     * Create or update proof for an order
     */
    async upsertProof(data: {
        order_id: string
        proof_image_url: string
        status?: "pending" | "approved" | "revision_requested"
        customer_notes?: string
        admin_notes?: string
        metadata?: Record<string, any>
    }) {
        const existing = await this.findByOrderId(data.order_id)
        
        if (existing) {
            return await this.updateOrderProofs(existing.id, {
                proof_image_url: data.proof_image_url,
                status: data.status || existing.status,
                revision_count: data.status === "revision_requested" 
                    ? existing.revision_count + 1 
                    : existing.revision_count,
                customer_notes: data.customer_notes ?? existing.customer_notes,
                admin_notes: data.admin_notes ?? existing.admin_notes,
                metadata: data.metadata ?? existing.metadata,
            })
        }

        return await this.createOrderProofs({
            order_id: data.order_id,
            proof_image_url: data.proof_image_url,
            status: data.status || "pending",
            revision_count: 0,
            customer_notes: data.customer_notes,
            admin_notes: data.admin_notes,
            metadata: data.metadata,
        })
    }

    /**
     * Approve proof
     */
    async approveProof(proofId: string) {
        return await this.updateOrderProofs(proofId, {
            status: "approved",
        })
    }

    /**
     * Request revision
     */
    async requestRevision(proofId: string, customerNotes?: string) {
        const proof = await this.retrieveOrderProof(proofId)
        return await this.updateOrderProofs(proofId, {
            status: "revision_requested",
            revision_count: proof.revision_count + 1,
            customer_notes: customerNotes,
        })
    }
}

export default OrderProofModuleService
