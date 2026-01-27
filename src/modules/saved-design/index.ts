import SavedDesignModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SAVED_DESIGN_MODULE = "savedDesign"

export default Module(SAVED_DESIGN_MODULE, {
    service: SavedDesignModuleService,
})
