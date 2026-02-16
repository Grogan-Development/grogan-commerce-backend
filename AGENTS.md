# Project Agent Guide (AGENTS.md)

This file is auto-discovered by Windsurf and applies to the entire repo. Keep it updated whenever the project stack changes.

## Stack Profile (check only what this repo uses)

### Backend / Infra
- [x] MedusaJS v2 (e-commerce backend)
- [x] MedusaJS Cloud (deployment target)
- [x] PostgreSQL (via Medusa Cloud)
- [x] Redis (via Medusa Cloud)
- [x] Notion API (integration)

### AI / Integrations
- [x] xAI API (Grok) - via @ai-sdk/xai
- [x] AI SDK (Vercel AI SDK)

### Frontend (Admin)
- [x] React (Medusa Admin)

## Key Scripts
- `npm run dev` - Start development server with Medusa
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Run database seed script
- `npm run upload-products` - Upload products via Medusa exec
- `npm run test:unit` - Run unit tests
- `npm run test:integration:http` - Run HTTP integration tests

## Skill Map (use only when stack item is checked)
- MedusaJS Cloud: `medusa-cloud`
- xAI API: `xai-docs`, `xai-script-runner`
- Notion API: `notion-api`

## Required Behavior
- Always read this file before selecting skills or recommending infra.
- If the stack changes, update the checkboxes and Skill Map immediately.
- Keep guidance concise and specific to the checked stack.
- Node.js >= 20 required.
