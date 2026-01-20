import { model } from "@medusajs/framework/utils"
import EngravingZone from "./engraving_zone"

/**
 * EngravingTemplate data model
 * Stores template configurations for different product types
 */
const EngravingTemplate = model.define("engraving_template", {
    id: model.id().primaryKey(),
    name: model.text(),
    product_type: model.text(), // e.g., "tumbler", "flask", "water-bottle"
    canvas_config: model.json(), // { scale: number, background_color?: string }
    constraints: model.json().nullable(), // { max_text_length, allowed_fonts, etc. }
    metadata: model.json().nullable(),
    zones: model.hasMany(() => EngravingZone, {
        mappedBy: "template",
    }),
})

export default EngravingTemplate
