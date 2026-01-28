import { Client } from "@notionhq/client"
import { Logger } from "@medusajs/framework/types"

type InjectedDependencies = {
    logger?: Logger
}

class NotionService {
    protected notion: Client
    protected databaseId: string
    protected logger?: Logger

    constructor(container: InjectedDependencies = {}) {
        this.logger = container.logger
        this.notion = new Client({
            auth: process.env.NOTION_API_KEY,
        })
        this.databaseId = process.env.NOTION_ORDERS_DATABASE_ID
    }

    async createOrder(order) {
        if (!this.databaseId) return

        const itemsContent = order.items.map(item =>
            `• ${item.quantity}x ${item.title} - ${item.unit_price}`
        ).join('\n')

        await this.notion.pages.create({
            parent: { database_id: this.databaseId },
            properties: {
                "Order ID": {
                    title: [
                        {
                            text: {
                                content: order.id,
                            },
                        },
                    ],
                },
                "Status": {
                    select: {
                        name: "New",
                    },
                },
                "Total": {
                    number: order.total / 100
                },
                "Customer": {
                    rich_text: [
                        {
                            text: {
                                content: `${order.email}`
                            }
                        }
                    ]
                }
            },
            children: [
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: itemsContent,
                                },
                            },
                        ],
                    },
                },
            ],
        })
    }
}

export default NotionService
