import GiftCardModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const GIFT_CARD_MODULE = "giftCard"

export default Module(GIFT_CARD_MODULE, {
    service: GiftCardModuleService,
})
