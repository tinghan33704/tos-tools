import React from "react"

import { attr_zh_to_en } from "src/constant/filterConstants"
import { getCraftById, getMonsterById } from "../utils"

export interface IImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    path: string
    alt?: string
    noTitle?: boolean
}

const Image: React.FC<IImageProps> = (props) => {
    const { path, alt, noTitle = false } = props

    let srcPath
    try {
        srcPath = require(`src/img/${path}.png`)
    } catch (err) {
        if (path.startsWith("monster")) {
            const monsterId = parseInt(path.split("/")[1])
            const monsterAttr = getMonsterById(monsterId)?.attribute
            const attrSuffix = monsterAttr
                ? `_${attr_zh_to_en[monsterAttr]}`
                : ""

            srcPath = require(`src/img/monster/noname${attrSuffix}.png`)
        } else if (path.startsWith("craft")) {
            srcPath = require(`src/img/craft/noname.png`)
        }
    }

    let title = ""
    if (path.startsWith("monster")) {
        const monsterId = parseInt(path.split("/")[1])
        const monsterName = getMonsterById(monsterId)?.name || ""
        title = `No.${monsterId} ${monsterName}`
    } else if (path.startsWith("craft")) {
        const craftId = parseInt(path.split("/")[1])
        const craftName = getCraftById(craftId)?.name || ""
        title = `No.${craftId} ${craftName}`
    }

    return (
        <img
            src={srcPath}
            alt={alt}
            loading='lazy'
            title={!noTitle ? title || props?.title : ""}
            {...props}
        />
    )
}

export default Image
