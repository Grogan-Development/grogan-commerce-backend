import EngravingModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ENGRAVING_MODULE = "engraving"

export default Module(ENGRAVING_MODULE, {
    service: EngravingModuleService,
})
