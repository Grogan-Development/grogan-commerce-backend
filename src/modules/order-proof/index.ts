import OrderProofModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ORDER_PROOF_MODULE = "orderProof"

export default Module(ORDER_PROOF_MODULE, {
    service: OrderProofModuleService,
})
