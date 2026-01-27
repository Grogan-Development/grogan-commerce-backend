import {
    type SubscriberConfig,
    type SubscriberArgs,
} from "@medusajs/medusa"

export default async function notionOrderSubscriber({
    data,
    eventName,
    container,
    pluginOptions,
}: SubscriberArgs<Record<string, any>>) {
    const notionService = container.resolve("notionService")
    const orderService = container.resolve("orderService")

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
