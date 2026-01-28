/**
 * Script to create gift card products
 * Run with: npx medusa exec ./src/scripts/create-gift-card-products.ts
 */

import { createProductsWorkflow, createProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

async function createGiftCardProducts() {
    const container = global as any

    // Digital Gift Card Product
    const digitalGiftCard = {
        title: "Digital Gift Card",
        description: "Give the gift of choice with a digital gift card. Perfect for any occasion! This gift card does not expire and has no fees.",
        handle: "digital-gift-card",
        status: ProductStatus.PUBLISHED,
        metadata: {
            is_gift_card: true,
            gift_card_type: "digital",
        },
        options: [
            {
                title: "Amount",
            },
        ],
        variants: [
            {
                title: "$25 Digital Gift Card",
                sku: "GC-DIGITAL-25",
                prices: [{ amount: 2500, currency_code: "usd" }],
                options: { Amount: "$25" },
                inventory_quantity: 9999,
            },
            {
                title: "$50 Digital Gift Card",
                sku: "GC-DIGITAL-50",
                prices: [{ amount: 5000, currency_code: "usd" }],
                options: { Amount: "$50" },
                inventory_quantity: 9999,
            },
            {
                title: "$100 Digital Gift Card",
                sku: "GC-DIGITAL-100",
                prices: [{ amount: 10000, currency_code: "usd" }],
                options: { Amount: "$100" },
                inventory_quantity: 9999,
            },
            {
                title: "$250 Digital Gift Card",
                sku: "GC-DIGITAL-250",
                prices: [{ amount: 25000, currency_code: "usd" }],
                options: { Amount: "$250" },
                inventory_quantity: 9999,
            },
            {
                title: "$500 Digital Gift Card",
                sku: "GC-DIGITAL-500",
                prices: [{ amount: 50000, currency_code: "usd" }],
                options: { Amount: "$500" },
                inventory_quantity: 9999,
            },
        ],
    }

    // Physical Engraved Gift Card Product
    const physicalGiftCard = {
        title: "Engraved Gift Card",
        description: "A beautifully engraved physical gift card. Perfect for special occasions! Customize with your own message. This gift card does not expire and has no fees.",
        handle: "engraved-gift-card",
        status: ProductStatus.PUBLISHED,
        metadata: {
            is_gift_card: true,
            gift_card_type: "physical",
        },
        options: [
            {
                title: "Amount",
            },
        ],
        variants: [
            {
                title: "$25 Engraved Gift Card",
                sku: "GC-PHYSICAL-25",
                prices: [{ amount: 2500, currency_code: "usd" }],
                options: { Amount: "$25" },
                inventory_quantity: 9999,
            },
            {
                title: "$50 Engraved Gift Card",
                sku: "GC-PHYSICAL-50",
                prices: [{ amount: 5000, currency_code: "usd" }],
                options: { Amount: "$50" },
                inventory_quantity: 9999,
            },
            {
                title: "$100 Engraved Gift Card",
                sku: "GC-PHYSICAL-100",
                prices: [{ amount: 10000, currency_code: "usd" }],
                options: { Amount: "$100" },
                inventory_quantity: 9999,
            },
            {
                title: "$250 Engraved Gift Card",
                sku: "GC-PHYSICAL-250",
                prices: [{ amount: 25000, currency_code: "usd" }],
                options: { Amount: "$250" },
                inventory_quantity: 9999,
            },
            {
                title: "$500 Engraved Gift Card",
                sku: "GC-PHYSICAL-500",
                prices: [{ amount: 50000, currency_code: "usd" }],
                options: { Amount: "$500" },
                inventory_quantity: 9999,
            },
        ],
    }

    try {
        console.log("Creating digital gift card product...")
        const { result: digitalProduct } = await createProductsWorkflow(container).run({
            input: {
                products: [digitalGiftCard],
            },
        })

        console.log("Digital gift card product created:", digitalProduct[0]?.id)

        console.log("Creating physical gift card product...")
        const { result: physicalProduct } = await createProductsWorkflow(container).run({
            input: {
                products: [physicalGiftCard],
            },
        })

        console.log("Physical gift card product created:", physicalProduct[0]?.id)

        console.log("Gift card products created successfully!")
    } catch (error) {
        console.error("Error creating gift card products:", error)
        throw error
    }
}

export default createGiftCardProducts
