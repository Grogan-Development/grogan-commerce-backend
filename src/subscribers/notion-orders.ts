import {
    type SubscriberConfig,
    type SubscriberArgs,
} from "@medusajs/medusa"
import { NOTION_MODULE } from "../modules/notion"
import NotionService from "../services/notion"

export default async function notionOrderSubscriber({
    event: { data },
    container,
}: SubscriberArgs<{ id: string }>) {
    const notionService = container.resolve<NotionService>(NOTION_MODULE)
    const orderService = container.resolve<{ retrieve: (id: string, options?: any) => Promise<any> }>("orderService")

    const order = await orderService.retrieve(data.id, {
        relations: ["items", "shipping_address"],
    })

    await notionService.createOrder(order)
}

export const config: SubscriberConfig = {
    event: "order.placed",
    context: {
        subscriberId: "notion-order-subscriber",
    },
}
