import WholesaleInquiryModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const WHOLESALE_INQUIRY_MODULE = "wholesaleInquiry"

export default Module(WHOLESALE_INQUIRY_MODULE, {
    service: WholesaleInquiryModuleService,
})
