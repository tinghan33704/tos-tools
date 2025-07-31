import { toolConfig } from "src/constant/toolConfig"

export const setFavIconAndTitle = (toolId: string) => {
    const link: any = document.querySelector("link[rel~='icon']")

    const tool = toolConfig[toolId]

    if (link) link.href = `./src/img/favicon/${tool.icon}.png`

    document.title = tool.title
}
