import GrokProductHelpWidget, { config as grokProductHelpConfig } from "./widgets/grok-product-help"
import GrokChatPage, { config as grokChatRouteConfig } from "./routes/grok/page"

export default {
  widgets: [
    {
      identifier: "grok-product-help",
      component: GrokProductHelpWidget,
      config: grokProductHelpConfig,
    },
  ],
  routes: [
    {
      identifier: "grok-chat",
      component: GrokChatPage,
      config: grokChatRouteConfig,
    },
  ],
}
