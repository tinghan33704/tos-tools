import React, { useCallback, useEffect, useState } from "react"

import { attrZhToEn } from "src/constant/filterConstants"
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
        const srcPath = `./src/img/${path}.png`

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
    }, [path])

    const handleImageError = useCallback(() => {
        let srcPath = ""
        if (path.startsWith("monster")) {
            const monsterId = parseInt(path.split("/")[1])
            const monsterAttr = getMonsterById(monsterId)?.attribute
            const attrSuffix = monsterAttr ? `_${attrZhToEn[monsterAttr]}` : ""

            // srcPath = require(`src/img/monster/noname${attrSuffix}.png`)
            srcPath = `./src/img/monster/noname${attrSuffix}.png`
        } else if (path.startsWith("craft")) {
            // srcPath = require(`src/img/craft/noname.png`)
            srcPath = `./src/img/craft/noname.png`
        }
        setSrcPath(srcPath)
    }, [path])

    return (
        <img
            src={
                isLoaded
                    ? srcPath
                    : path.startsWith("monster")
                    ? // ? require(`src/img/monster/noname.png`)
                      `./src/img/monster/noname.png`
                    : path.startsWith("craft")
                    ? // ? require(`src/img/craft/noname.png`)
                      `./src/img/craft/noname.png`
                    : path.startsWith("rune")
                    ? // ? require(`src/img/rune/rune_none.png`)
                      `./src/img/rune/rune_none.png`
                    : path.startsWith("icon")
                    ? // ? require(`src/img/icon/icon_undefined.png`)
                      `./src/img/icon/icon_undefined.png`
                    : // : require(`src/img/other/loading.png`)
                      `./src/img/other/loading.png`
            }
            alt={alt}
            tabIndex={0}
            loading='lazy'
            title={!noTitle ? title || props?.title : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onLoad={() => setIsLoaded(true)}
            onError={handleImageError}
            {...props}
        />
    )
}

export default Image
