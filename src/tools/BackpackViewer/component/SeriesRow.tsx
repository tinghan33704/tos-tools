import _ from "lodash"
import React, { useCallback, useContext } from "react"
import { Col, Row } from "react-bootstrap"

import { sealContent } from "src/constant/filterConstants"
import { monsterData } from "src/constant/monsterData"
import DataContext from "src/utilities/Context/DataContext"
import SeriesBlock from "./SeriesBlock"

import "./style.scss"

interface ISeriesRowProps {
    tab: string
    cardCategory: string
    sortBy: string
    togglePopover: (e: React.MouseEvent) => void
    setPopoverContent: (content: React.ReactElement) => void
}

const doNotIgnoreIndependentItem = [
    "強力武裝",
    "戰鬥魔導士",
    "百變騎士",
    "騰雲逸龍",
    "變形金屬",
]
const doNotSortById = [
    "靈殿狛犬",
    "強力武裝",
    "戰鬥魔導士",
    "百變騎士",
    "騰雲逸龍",
    "變形金屬",
]

const SeriesRow: React.FC<ISeriesRowProps> = ({
    tab,
    cardCategory,
    sortBy,
    togglePopover,
    setPopoverContent,
}) => {
    const { playerData } = useContext(DataContext)

    const isCardInCorrectCategory = useCallback(
        (id: number) => {
            const allCategory = cardCategory === "all"
            const onlyNonCrossOver = cardCategory === "non-crossover"
            const onlyCrossOver = cardCategory === "crossover"

            const isCardCrossOver = monsterData.find(
                (monster) => monster.id === id
            )?.crossOver

            return tab === "其他卡片"
                ? allCategory ||
                      (onlyNonCrossOver && !isCardCrossOver) ||
                      (onlyCrossOver && isCardCrossOver)
                : true
        },
        [cardCategory, tab]
    )

    return (
        <Row>
            {Object.keys(sealContent[tab]).map((title, index) => {
                let _data: (number | number[])[] = []

                sealContent[tab][title].forEach(
                    (item: string | number | number[]) => {
                        if (typeof item === "string") {
                            const tagFilteredMonster = monsterData
                                .filter((element) => {
                                    return element?.monsterTag.includes(item)
                                })
                                .filter((element) =>
                                    isCardInCorrectCategory(element.id)
                                )
                                ?.map((info) => info.id)

                            _data = _.uniq([..._data, ...tagFilteredMonster])
                        } else {
                            if (_.isArray(item)) {
                                item.forEach((c) => {
                                    if (
                                        tab === "其他卡片" &&
                                        !doNotIgnoreIndependentItem.includes(
                                            title
                                        ) &&
                                        _data.includes(c)
                                    )
                                        _data = _data.filter((m) => m !== c)
                                })
                                if (
                                    item.every((c) =>
                                        isCardInCorrectCategory(c)
                                    )
                                ) {
                                    _data = _.uniq([..._data, item])
                                }
                            } else {
                                if (item > 0 && isCardInCorrectCategory(item)) {
                                    _data = _.uniq([..._data, item])
                                } else if (
                                    tab === "其他卡片" &&
                                    !doNotIgnoreIndependentItem.includes(title)
                                ) {
                                    _data = _data.filter((m) => m !== -item)
                                }
                            }
                        }
                    }
                )

                if (sortBy === "by-number") {
                    _data = _data.sort(
                        (a: number[] | number, b: number[] | number) => {
                            const totalNumberA = _.isArray(a)
                                ? a.reduce(
                                      (acc, cur) =>
                                          acc +
                                          (playerData?.info?.[cur]?.number ||
                                              0),
                                      0
                                  )
                                : playerData?.info?.[a]?.number || 0
                            const totalNumberB = _.isArray(b)
                                ? b.reduce(
                                      (acc, cur) =>
                                          acc +
                                          (playerData?.info?.[cur]?.number ||
                                              0),
                                      0
                                  )
                                : playerData?.info?.[b]?.number || 0
                            return totalNumberB - totalNumberA
                        }
                    )
                } else if (
                    tab === "其他卡片" &&
                    !doNotSortById.includes(title)
                ) {
                    _data = _data.sort(
                        (a: number[] | number, b: number[] | number) =>
                            (_.isArray(a) ? a?.[0] : a) -
                            (_.isArray(b) ? b?.[0] : b)
                    )
                }

                return (
                    <Col xs={12} md={6} lg={6}>
                        <SeriesBlock
                            playerData={playerData}
                            title={title}
                            data={_data}
                            key={`${Object.keys(sealContent).indexOf(
                                tab
                            )}-${index}`}
                            togglePopover={togglePopover}
                            setPopoverContent={setPopoverContent}
                        />
                    </Col>
                )
            })}
        </Row>
    )
}

export default SeriesRow
