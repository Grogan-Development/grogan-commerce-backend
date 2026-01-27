import { model } from "@medusajs/framework/utils"

/**
 * SavedDesign data model
 * Stores customer saved designs/configurations
 */
const SavedDesign = model.define("saved_design", {
    id: model.id().primaryKey(),
    customer_id: model.text().index(), // Medusa customer ID
    name: model.text(), // User-given name for the design
    product_id: model.text().nullable(), // Medusa product ID
    variant_id: model.text().nullable(), // Medusa variant ID
    design_data: model.json(), // Full design configuration (text, fonts, colors, images, etc.)
    preview_image_url: model.text().nullable(), // Preview image URL
    metadata: model.json().nullable(),
})

export default SavedDesign
