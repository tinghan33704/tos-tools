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
            const craft = getCraftById(craftId)
            const craftName = craft?.nameFormat
                ? craft?.nameFormat.replace("{mode}", craft?.mode)
                : `${craft?.name}${craft?.mode}`
            title = `No.${craftId} ${craftName}`
        }

        setSrcPath(srcPath)
        setTitle(title)
    }, [path])

    const handleImageError = useCallback(() => {
        let errSrcPath = ""
        if (path.startsWith("monster")) {
            const monsterId = parseInt(path.split("/")[1])
            const monsterAttr = getMonsterById(monsterId)?.attribute
            const attrSuffix = monsterAttr ? `_${attrZhToEn[monsterAttr]}` : ""

            errSrcPath = `./src/img/monster/noname${attrSuffix}.png`
        } else if (path.startsWith("craft")) {
            const craftId = parseInt(path.split("/")[1])
            const craftName = getCraftById(craftId)?.name

            const imageName = srcPath
                ?.split("/")
                .slice(-1)?.[0]
                ?.replace(".png", "")

            if (!isNaN(Number(imageName))) {
                // if there's no image name with craft id, check if there's image name with craft name
                errSrcPath = `./src/img/craft/${craftName}.png`
            } else {
                errSrcPath = `./src/img/craft/noname.png`
            }
        }
        setSrcPath(errSrcPath)
    }, [path, srcPath])

    return (
        <img
            src={
                isLoaded
                    ? srcPath
                    : path.startsWith("monster")
                      ? `./src/img/monster/noname.png`
                      : path.startsWith("craft")
                        ? `./src/img/craft/noname.png`
                        : path.startsWith("rune")
                          ? `./src/img/rune/rune_none.png`
                          : path.startsWith("icon")
                            ? `./src/img/icon/icon_null.png`
                            : `./src/img/other/loading.png`
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
