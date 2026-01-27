import QuoteRequestModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const QUOTE_REQUEST_MODULE = "quoteRequest"

export default Module(QUOTE_REQUEST_MODULE, {
    service: QuoteRequestModuleService,
})
