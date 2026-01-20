import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ENGRAVING_MODULE } from "../modules/engraving"
import EngravingModuleService from "../modules/engraving/service"

/**
 * Seed engraving templates for different product types
 * Run with: npx medusa exec ./src/scripts/seed-engraving-templates.ts
 */
export default async function seedEngravingTemplates({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const engravingService = container.resolve<EngravingModuleService>(ENGRAVING_MODULE)

    logger.info("Seeding engraving templates...")

    // Default template configurations based on product types
    const templateConfigs = [
        {
            name: "Default Template",
            product_type: "default",
            canvas_config: {
                scale: 0.9,
                background_color: "#0f0f0f",
            },
            constraints: {
                max_text_length: 50,
                allowed_fonts: ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana", "Impact"],
                min_font_size: 12,
                max_font_size: 72,
            },
            zones: [
                {
                    name: "Front",
                    position: { left: 50, top: 50, width: 45, height: 45 },
                    type: "both" as const,
                },
            ],
        },
        {
            name: "Tumbler Template",
            product_type: "tumbler",
            canvas_config: {
                scale: 0.85,
                background_color: "#1a1a1a",
            },
            constraints: {
                max_text_length: 40,
                allowed_fonts: ["Arial", "Georgia", "Times New Roman", "Courier New", "Verdana"],
                min_font_size: 14,
                max_font_size: 60,
            },
            zones: [
                {
                    name: "Front",
                    position: { left: 50, top: 45, width: 50, height: 40 },
                    type: "both" as const,
                },
            ],
        },
        {
            name: "Flask Template",
            product_type: "flask",
            canvas_config: {
                scale: 0.9,
                background_color: "#0f0f0f",
            },
            constraints: {
                max_text_length: 30,
                allowed_fonts: ["Arial", "Georgia", "Times New Roman"],
                min_font_size: 12,
                max_font_size: 48,
            },
            zones: [
                {
                    name: "Front",
                    position: { left: 50, top: 50, width: 60, height: 50 },
                    type: "both" as const,
                },
            ],
        },
        {
            name: "Water Bottle Template",
            product_type: "water-bottle",
            canvas_config: {
                scale: 0.85,
                background_color: "#0f0f0f",
            },
            constraints: {
                max_text_length: 35,
                allowed_fonts: ["Arial", "Georgia", "Verdana", "Impact"],
                min_font_size: 14,
                max_font_size: 56,
            },
            zones: [
                {
                    name: "Front",
                    position: { left: 50, top: 40, width: 45, height: 35 },
                    type: "both" as const,
                },
            ],
        },
        {
            name: "Pint Glass Template",
            product_type: "pint-glass",
            canvas_config: {
                scale: 0.9,
                background_color: "#1a1a1a",
            },
            constraints: {
                max_text_length: 25,
                allowed_fonts: ["Arial", "Georgia", "Times New Roman"],
                min_font_size: 16,
                max_font_size: 48,
            },
            zones: [
                {
                    name: "Front",
                    position: { left: 50, top: 55, width: 55, height: 40 },
                    type: "both" as const,
                },
            ],
        },
        {
            name: "Decanter Template",
            product_type: "decanter",
            canvas_config: {
                scale: 0.85,
                background_color: "#0f0f0f",
            },
            constraints: {
                max_text_length: 20,
                allowed_fonts: ["Georgia", "Times New Roman"],
                min_font_size: 18,
                max_font_size: 42,
            },
            zones: [
                {
                    name: "Front",
                    position: { left: 50, top: 50, width: 50, height: 35 },
                    type: "both" as const,
                },
            ],
        },
    ]

    for (const config of templateConfigs) {
        // Check if template already exists
        const existing = await engravingService.listEngravingTemplates({
            product_type: config.product_type,
        })

        if (existing.length > 0) {
            logger.info(`Template for ${config.product_type} already exists, skipping...`)
            continue
        }

        // Create template
        const template = await engravingService.createEngravingTemplates({
            name: config.name,
            product_type: config.product_type,
            canvas_config: config.canvas_config,
            constraints: config.constraints,
        })

        // Create zones for the template
        for (const zone of config.zones) {
            await engravingService.createEngravingZones({
                name: zone.name,
                position: zone.position,
                type: zone.type,
                template_id: template.id,
            })
        }

        logger.info(`✓ Created template: ${config.name} (${config.product_type})`)
    }

    logger.info("Finished seeding engraving templates.")
}
