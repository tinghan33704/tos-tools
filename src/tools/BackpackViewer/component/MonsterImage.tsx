import React, { useCallback } from "react"

import { monsterData } from "src/constant/monsterData"
import Image from "src/utilities/Image"

import "./style.scss"

interface IMonsterImageProps {
    playerData: IObject
    id: number
    notInInventory: boolean
    onClick: (e: React.MouseEvent) => void
    cardData?: IObject
}

const MonsterImage: React.FC<IMonsterImageProps> = ({
    playerData,
    id,
    notInInventory,
    onClick,
    cardData,
}) => {
    const renderInfoTag = useCallback(
        (id: number) => {
            const data = cardData || playerData?.info?.[id] || {}
            const level = data?.level || "???"
            const skillLevel = data?.skillLevel || 0
            const enhanceLevel = data?.enhanceLevel || 0

            const monster = monsterData.find((monster) => monster.id === id)
            const maxLevel = monster?.maxLevel || 0
            const maxSkill = monster?.maxSkill || 0
            const maxRefine = monster?.maxRefine || 0

            const levelTag =
                level < maxLevel ? (
                    `Lv. ${level}`
                ) : maxRefine > 0 &&
                  level >= maxLevel &&
                  skillLevel >= maxSkill &&
                  enhanceLevel >= maxRefine ? (
                    <span className='all-max-tag'>All Max</span>
                ) : level >= maxLevel && skillLevel >= maxSkill ? (
                    <span className='dual-max-tag'>Dual Max</span>
                ) : (
                    <span className='lv-max-tag'>Lv. Max</span>
                )

            const refineSrc =
                data?.enhanceLevel < 5
                    ? `refine_${data?.enhanceLevel}`
                    : "recall"

            return (
                <>
                    <div className='skill-level'>
                        SLv. {data?.skillLevel ?? "???"}
                    </div>
                    <div className='info-tag'>
                        <div className='bottom-tag'>
                            {data?.enhanceLevel > 0 ? (
                                <Image path={`icon/${refineSrc}`} />
                            ) : (
                                <></>
                            )}
                            <div className='level-tag'>{levelTag}</div>
                        </div>
                    </div>
                </>
            )
        },
        [cardData, playerData]
    )

    const renderImage = useCallback(() => {
        return (
            <div className='monster-series-image-shell' onClick={onClick}>
                <Image
                    path={`monster/${id}`}
                    className={`result-image${
                        notInInventory ? " result-image-gray" : ""
                    }`}
                />
                {!notInInventory && renderInfoTag(id)}
            </div>
        )
    }, [id, notInInventory, onClick, renderInfoTag])

    return <>{renderImage()}</>
}

export default MonsterImage
