import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Get Stripe API key from environment
const stripeApiKey = process.env.STRIPE_API_KEY || process.env.STRIPE_SECRET_KEY

// Build modules array conditionally
const modules: any[] = [
  {
    resolve: "./src/modules/engraving",
  },
]

// Configure Redis workflow engine if Redis URL is available
// This fixes the deprecation warning by using redisUrl instead of the deprecated url option
const redisUrl = process.env.REDIS_URL || process.env.WE_REDIS_URL
if (redisUrl) {
  modules.push({
    resolve: "@medusajs/medusa/workflow-engine-redis",
    options: {
      redis: {
        redisUrl: redisUrl,
      },
    },
  })
}

// Only add Stripe payment provider if API key is available
if (stripeApiKey) {
  modules.push({
    resolve: "@medusajs/medusa/payment",
    options: {
      providers: [
        {
          resolve: "@medusajs/medusa/payment-stripe",
          id: "stripe",
          options: {
            apiKey: stripeApiKey,
          },
        },
      ],
    },
  })
} else {
  console.warn("⚠️  STRIPE_API_KEY not found. Stripe payment provider will not be available.")
  console.warn("   Set STRIPE_API_KEY or STRIPE_SECRET_KEY environment variable to enable Stripe payments.")
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules,
})
