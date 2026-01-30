require("ts-node/register/transpile-only")

const path = require("path")
const { build } = require("@medusajs/admin-bundler")
const { getResolvedPlugins } = require("@medusajs/utils")
const config = require("../medusa-config.ts")

async function run() {
  const plugins = await getResolvedPlugins(process.cwd(), config, true)
  const adminSources = plugins
    .map((plugin) => (plugin.admin?.type === "local" ? plugin.admin.resolve : undefined))
    .filter(Boolean)
  const adminPlugins = plugins
    .map((plugin) => (plugin.admin?.type === "package" ? plugin.admin.resolve : undefined))
    .filter(Boolean)

  const adminConfig = config?.admin ?? {}
  const outDir = path.join(process.cwd(), ".medusa/server/public/admin")

  await build({
    path: adminConfig.path || "/app",
    backendUrl: adminConfig.backendUrl,
    storefrontUrl: adminConfig.storefrontUrl,
    vite: adminConfig.vite,
    sources: adminSources,
    plugins: adminPlugins,
    outDir,
  })
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
