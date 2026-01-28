import NotionService from "../../services/notion"
import { Module } from "@medusajs/framework/utils"

export const NOTION_MODULE = "notion"

export default Module(NOTION_MODULE, {
    service: NotionService,
})
