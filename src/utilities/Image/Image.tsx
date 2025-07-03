import React, { useCallback, useEffect, useState } from "react"

import { attr_zh_to_en } from "src/constant/filterConstants"
import { getCraftById, getMonsterById } from "../utils"

export interface IImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    path: string
    alt?: string
    noTitle?: boolean
}

const Image: React.FC<IImageProps> = (props) => {
    const { path, alt, noTitle = false } = props

    const [isFocused, setIsFocused] = useState(false)
    const [srcPath, setSrcPath] = useState("")
    const [title, setTitle] = useState("")
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setImageSrc()
    }, [path, isFocused])

    const setImageSrc = useCallback(() => {
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

        setSrcPath(srcPath)
        setTitle(title)
    }, [isFocused, path])

    return (
        <img
            src={
                isLoaded
                    ? srcPath
                    : path.startsWith("monster")
                    ? require(`src/img/monster/noname.png`)
                    : path.startsWith("craft")
                    ? require(`src/img/craft/noname.png`)
                    : path.startsWith("rune")
                    ? require(`src/img/rune/rune_none.png`)
                    : path.startsWith("icon")
                    ? require(`src/img/icon/icon_undefined.png`)
                    : require(`src/img/craft/noname.png`)
            }
            alt={alt}
            tabIndex={0}
            loading='lazy'
            title={!noTitle ? title || props?.title : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onLoad={() => setIsLoaded(true)}
            {...props}
        />
    )
}

export default Image
