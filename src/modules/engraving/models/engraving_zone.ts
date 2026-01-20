import { model } from "@medusajs/framework/utils"
import EngravingTemplate from "./engraving_template"

/**
 * EngravingZone data model
 * Defines engraving areas within a template
 */
const EngravingZone = model.define("engraving_zone", {
    id: model.id().primaryKey(),
    name: model.text(), // e.g., "Front", "Back", "Side"
    position: model.json(), // { left, top, width, height } as percentages
    type: model.enum(["text", "image", "both"]),
    constraints: model.json().nullable(), // Zone-specific constraints
    template: model.belongsTo(() => EngravingTemplate, {
        mappedBy: "zones",
    }),
})

export default EngravingZone
