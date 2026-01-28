import { MedusaService, MedusaError } from "@medusajs/framework/utils"
import { GiftCard, StoreCredit } from "./models"
import { randomBytes } from "crypto"

/**
 * GiftCardModuleService
 * Manages gift cards and store credit with legal compliance
 */
class GiftCardModuleService extends MedusaService({
    GiftCard,
    StoreCredit,
}) {
    /**
     * Generate a unique gift card code
     * Format: GC-XXXX-XXXX-XXXX (12 alphanumeric characters)
     */
    async generateGiftCardCode(): Promise<string> {
        let code: string
        let attempts = 0
        const maxAttempts = 10

        do {
            // Generate 12 random alphanumeric characters
            const randomPart = randomBytes(6).toString("hex").toUpperCase()
            code = `GC-${randomPart.slice(0, 4)}-${randomPart.slice(4, 8)}-${randomPart.slice(8, 12)}`
            
            // Check if code already exists
            const existing = await this.listGiftCards({ code })
            if (existing.length === 0) {
                return code
            }
            
            attempts++
        } while (attempts < maxAttempts)

        throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            "Failed to generate unique gift card code after multiple attempts"
        )
    }

    /**
     * Create a gift card from an order line item
     */
    async createGiftCard(data: {
        value: number // in cents
        currency_code?: string
        type: "digital" | "physical"
        customer_id?: string
        order_id?: string
        line_item_id?: string
        engraving_text?: string
        engraving_metadata?: Record<string, any>
    }) {
        const code = await this.generateGiftCardCode()
        const now = new Date()
        
        // Set expiration to 5+ years for federal compliance, but never enforce per WA state
        const expiresAt = new Date(now)
        expiresAt.setFullYear(expiresAt.getFullYear() + 5)

        return await this.createGiftCards({
            code,
            value: data.value,
            currency_code: data.currency_code || "usd",
            type: data.type,
            status: "unused",
            customer_id: data.customer_id || null,
            order_id: data.order_id || null,
            line_item_id: data.line_item_id || null,
            engraving_text: data.engraving_text || null,
            engraving_metadata: data.engraving_metadata || null,
            purchased_at: now,
            expires_at: expiresAt,
            is_expirable: false, // WA state prohibits expiration for purchased gift cards
            abandoned_at: null,
            abandoned_reported: false,
            redeemed_at: null,
            redeemed_by_customer_id: null,
        })
    }

    /**
     * Validate a gift card code before redemption
     */
    async validateGiftCardCode(code: string): Promise<any | null> {
        const giftCards = await this.listGiftCards({ code })
        
        if (giftCards.length === 0) {
            return null
        }

        const giftCard = giftCards[0]

        // Check if already redeemed
        if (giftCard.status === "redeemed") {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                "This gift card has already been redeemed"
            )
        }

        // Note: We don't enforce expiration per Washington State law
        // Even if expires_at is set, we allow redemption

        return giftCard
    }

    /**
     * Redeem a gift card and add value to store credit
     */
    async redeemGiftCard(code: string, customerId: string) {
        const giftCard = await this.validateGiftCardCode(code)
        
        if (!giftCard) {
            throw new MedusaError(
                MedusaError.Types.NOT_FOUND,
                "Gift card not found"
            )
        }

        // Mark gift card as redeemed
        await this.updateGiftCards({
            id: giftCard.id,
            status: "redeemed",
            redeemed_at: new Date(),
            redeemed_by_customer_id: customerId,
        })

        // Add to store credit
        await this.addStoreCredit(customerId, giftCard.value, giftCard.currency_code)

        return giftCard
    }

    /**
     * Get or create store credit account for a customer
     */
    async getOrCreateStoreCredit(customerId: string, currencyCode: string = "usd") {
        const credits = await this.listStoreCredits({ customer_id: customerId })
        
        if (credits.length > 0) {
            return credits[0]
        }

        // Create new store credit account
        return await this.createStoreCredits({
            customer_id: customerId,
            balance: 0,
            currency_code: currencyCode,
        })
    }

    /**
     * Get store credit balance for a customer
     */
    async getStoreCredit(customerId: string): Promise<number> {
        const credit = await this.getOrCreateStoreCredit(customerId)
        return credit.balance || 0
    }

    /**
     * Add store credit to a customer's account
     */
    async addStoreCredit(customerId: string, amount: number, currencyCode: string = "usd") {
        const credit = await this.getOrCreateStoreCredit(customerId, currencyCode)
        const newBalance = (credit.balance || 0) + amount

        await this.updateStoreCredits({
            id: credit.id,
            balance: newBalance,
        })

        return newBalance
    }

    /**
     * Apply store credit to a cart/order
     * Returns the amount applied (may be less than requested if balance is insufficient)
     */
    async applyStoreCredit(customerId: string, amount: number): Promise<number> {
        const balance = await this.getStoreCredit(customerId)
        const amountToApply = Math.min(amount, balance)

        if (amountToApply > 0) {
            const credit = await this.getOrCreateStoreCredit(customerId)
            const newBalance = (credit.balance || 0) - amountToApply

            await this.updateStoreCredits({
                id: credit.id,
                balance: Math.max(0, newBalance), // Ensure balance never goes negative
            })
        }

        return amountToApply
    }

    /**
     * Check for abandoned gift cards (3 years after purchase, per WA state law)
     */
    async checkAbandonedGiftCards() {
        const threeYearsAgo = new Date()
        threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)

        const abandoned = await this.listGiftCards({
            status: "unused",
            purchased_at: { $lt: threeYearsAgo },
            abandoned_at: null,
        })

        // Mark as abandoned
        for (const giftCard of abandoned) {
            await this.updateGiftCards({
                id: giftCard.id,
                abandoned_at: new Date(),
            })
        }

        return abandoned
    }

    /**
     * Get abandoned gift cards that haven't been reported yet
     */
    async getUnreportedAbandonedGiftCards() {
        return await this.listGiftCards({
            abandoned_at: { $ne: null },
            abandoned_reported: false,
        })
    }
}

export default GiftCardModuleService
