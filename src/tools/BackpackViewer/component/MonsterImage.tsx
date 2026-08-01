import React, { useCallback } from "react"

import { monsterData } from "src/constant/monsterData"
import Image from "src/utilities/Image"

import "./style.scss"
import { AutoTextSize } from "auto-text-size"

interface IMonsterImageProps {
    playerData: IObject
    id: number
    notInInventory: boolean
    onClick: (e: React.MouseEvent) => void
    cardData?: IObject
    hideHadMonster?: boolean
    hideInfo?: boolean
}

const MonsterImage: React.FC<IMonsterImageProps> = ({
    playerData,
    id,
    notInInventory,
    onClick,
    cardData,
    hideHadMonster = false,
    hideInfo = false,
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
                        <AutoTextSize maxFontSizePx={12}>
                            SLv. {data?.skillLevel ?? "???"}
                        </AutoTextSize>
                    </div>
                    <div className='info-tag'>
                        <div className='bottom-tag'>
                            {data?.enhanceLevel > 0 ? (
                                <Image path={`icon/${refineSrc}`} />
                            ) : (
                                <></>
                            )}
                            <div className='level-tag'>
                                <AutoTextSize maxFontSizePx={12}>
                                    {levelTag}
                                </AutoTextSize>
                            </div>
                        </div>
                    </div>
                </>
            )
        },
        [cardData, playerData],
    )

    const renderImage = useCallback(() => {
        return (
            <div
                key={id}
                className='monster-series-image-shell'
                onClick={onClick}
            >
                <Image
                    path={`monster/${id}`}
                    className={`result-image${
                        notInInventory && !hideHadMonster
                            ? " result-image-gray"
                            : ""
                    }`}
                />
                {!notInInventory && !hideInfo && renderInfoTag(id)}
            </div>
        )
    }, [hideHadMonster, hideInfo, id, notInInventory, onClick, renderInfoTag])

    return <>{renderImage()}</>
}

export default MonsterImage
