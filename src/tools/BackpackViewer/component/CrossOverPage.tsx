import React, { useCallback, useContext, useRef, useState } from "react"
import _ from "lodash"
import LazyLoad from "react-lazyload"
import { Accordion, Col, Row } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"

import { crossOverData } from "src/constant/crossOverData"
import { paddingZeros } from "src/utilities/utils"
import DataContext from "src/utilities/Context/DataContext"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"
import MonsterImage from "./MonsterImage"

import "./style.scss"

interface ICrossOverPageProps {
    sortBy: string
    togglePopover: (e: React.MouseEvent) => void
    setPopoverContent: (content: React.ReactElement) => void
}

interface ICrossOverBlockProps {
    playerData: IObject
    category: IObject
    index: number
    eventKey: string
    sortBy: string
    togglePopover: (e: React.MouseEvent) => void
    setPopoverContent: (content: React.ReactElement) => void
}

const showFirstStageAsEmptyPreview = [
    "NERV登錄器",
    "原子膠囊",
    "懷舊電視",
    "萬事屋之旅",
    "神玉封印 II",
    "Nerve Gear啟動",
    "劍客的道義",
    "星際巡航",
    "成為同伴的契約",
    "偶像光環",
    "棋盤上的革命",
    "魔法學習之路",
    "無限升級",
    "未知的轉折點",
    "魔法實技測驗",
]

const CrossOverBlock: React.FC<ICrossOverBlockProps> = ({
    playerData,
    category,
    index,
    eventKey,
    sortBy,
    togglePopover,
    setPopoverContent,
}) => {
    const ref = useRef(null)

    const [isOpen, setIsOpen] = useState(index === 0)

    const groups: IObject[] = category.data
        .map((group: IObject) => {
            let data: (number | number[])[] = [...group.data]

            if (sortBy === "by-number") {
                data = data.sort((a, b) => {
                    const total = (item: number | number[]) =>
                        _.isArray(item)
                            ? item.reduce(
                                  (acc, cur) =>
                                      acc +
                                      (playerData?.info?.[cur]?.number || 0),
                                  0,
                              )
                            : playerData?.info?.[item]?.number || 0
                    return total(b) - total(a)
                })
            }

            return { ...group, data }
        })
        .filter((group: IObject) => group.data.length)

    // Exclude 素材/練技素材/進化素材
    const allIds: (number | number[])[] = groups
        .filter((group) => !group?.title?.includes("素材"))
        .flatMap((group: IObject) => group.data)
    const total = allIds.length
    const collected =
        allIds.filter((item) =>
            _.isArray(item)
                ? item.some((m) => playerData?.card?.includes(m))
                : playerData?.card?.includes(item),
        )?.length || 0
    const isAllCollected = collected >= total && total > 0

    const renderSeriesInfoPopover = useCallback(
        (ids: number[], title: string) => {
            // Do not display number for title 素材/練技素材/進化素材
            const isMaterial = title?.includes("素材")

            return (
                <div
                    id='monster-series-info'
                    className='monster-series-info-popover'
                    title=''
                    ref={ref}
                >
                    {ids.map((id) => {
                        const count = playerData?.info?.[id]?.number || 0
                        const notInInventory =
                            !playerData?.card?.includes(id) && count <= 0
                        return (
                            <Col
                                xs={2}
                                className='monster-series-col'
                                key={`popover_${id}`}
                            >
                                <div className='monster-image'>
                                    <Image
                                        path={`monster/${id}`}
                                        className={`result-image${
                                            notInInventory && !isMaterial
                                                ? " gray-scale"
                                                : ""
                                        }`}
                                    />
                                </div>
                                <div
                                    className={`monster-id${
                                        notInInventory && !isMaterial
                                            ? " gray-scale"
                                            : ""
                                    }`}
                                >
                                    <a
                                        href={`https://tos.fandom.com/zh/wiki/${id}`}
                                        target='_blank'
                                        rel='noreferrer'
                                    >
                                        {paddingZeros(id, 3)}
                                    </a>
                                </div>
                                {!isMaterial ? (
                                    <div
                                        className={`monster-count${
                                            notInInventory ? " gray-scale" : ""
                                        }`}
                                    >
                                        × {count}
                                    </div>
                                ) : (
                                    <></>
                                )}
                            </Col>
                        )
                    })}
                </div>
            )
        },
        [playerData],
    )

    const onClickImage = useCallback(
        (e: React.MouseEvent, ids: number[], title: string) => {
            togglePopover(e)
            setPopoverContent(renderSeriesInfoPopover(ids, title))
        },
        [renderSeriesInfoPopover, setPopoverContent, togglePopover],
    )

    const renderHeader = useCallback(() => {
        return (
            <Accordion.Header
                className={`monster-series-header${
                    isAllCollected ? " all-collected" : ""
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {category.startTime && (
                    <span className='crossover-start-time'>
                        {category.startTime
                            .split("|")
                            .join(" / ")
                            .replaceAll(".", "-")}
                    </span>
                )}
                <span className='title-expander cross-over-expander'>
                    <Icon icon={isOpen ? faCaretUp : faCaretDown} />
                </span>
                <div style={{ width: "70%" }}>
                    <div className='title-text'>
                        <AutoTextSize maxFontSizePx={24}>
                            {category.title}
                        </AutoTextSize>
                        {category.subtitle && (
                            <div className='subtitle'>
                                ({category.subtitle})
                            </div>
                        )}
                    </div>
                </div>
                <span className='collect-progress'>{`${collected} / ${total}`}</span>
            </Accordion.Header>
        )
    }, [category, collected, total, isAllCollected, isOpen])

    // Resolve which id of an evolution chain to display, and whether it is owned
    const resolveDisplayId = useCallback(
        (item: number | number[], groupTitle: string) => {
            if (!_.isArray(item)) {
                return {
                    id: item,
                    notInInventory: !playerData?.card?.includes(item),
                }
            }

            const revIdArr = [...item].reverse()
            let id = -1
            let notInInventory = true

            for (const candidate of revIdArr) {
                id = candidate
                if (playerData?.card?.includes(id) && playerData?.info?.[id]) {
                    notInInventory = false
                    break
                }
            }

            if (notInInventory) {
                id = showFirstStageAsEmptyPreview.includes(groupTitle)
                    ? item[0]
                    : revIdArr[0]
            }

            return { id, notInInventory }
        },
        [playerData],
    )

    const renderGroupRow = useCallback(
        (group: IObject, index: number) => {
            const isMaterial = group?.title?.includes("素材")

            return (
                <React.Fragment key={`${category.title}_group_${index}`}>
                    {index > 0 && <hr />}
                    <Row
                        className={`crossover-group-row${isMaterial ? " gray-row" : ""}`}
                    >
                        <Col xs={12} md={3} className='crossover-group-label'>
                            {/* AutoTextSize measures its parent, so each needs its own shell */}
                            <div className='crossover-group-title'>
                                <AutoTextSize maxFontSizePx={22}>
                                    {group.title}
                                </AutoTextSize>
                            </div>
                            {group.subtitle?.length ? (
                                <div className='crossover-group-subtitle'>
                                    <AutoTextSize maxFontSizePx={16}>
                                        {group.subtitle}
                                    </AutoTextSize>
                                </div>
                            ) : null}
                        </Col>
                        <Col xs={12} md={9}>
                            <div className='monster-series-content crossover-image-grid'>
                                {group.data.map(
                                    (item: number | number[], idx: number) => {
                                        const { id, notInInventory } =
                                            resolveDisplayId(
                                                item,
                                                group?.subtitle,
                                            )
                                        return (
                                            <div
                                                className='monster-series-block'
                                                key={`${category.title}_${index}_${idx}`}
                                            >
                                                <MonsterImage
                                                    playerData={playerData}
                                                    id={id}
                                                    notInInventory={
                                                        isMaterial
                                                            ? false
                                                            : notInInventory
                                                    }
                                                    hideInfo={isMaterial}
                                                    onClick={(e) =>
                                                        onClickImage(
                                                            e,
                                                            _.isArray(item)
                                                                ? item
                                                                : [item],
                                                            group?.title,
                                                        )
                                                    }
                                                />
                                            </div>
                                        )
                                    },
                                )}
                            </div>
                        </Col>
                    </Row>
                </React.Fragment>
            )
        },
        [category.title, onClickImage, playerData, resolveDisplayId],
    )

    if (!groups.length) return null

    return (
        <LazyLoad
            once
            offset={500}
            placeholder={
                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666666",
                        height: 150,
                    }}
                >
                    載入中...
                </span>
            }
        >
            {/* Open first group by default */}
            <Accordion defaultActiveKey={"crossover-0"}>
                <Accordion.Item eventKey={eventKey} className='accordion-item'>
                    {renderHeader()}
                    <Accordion.Body className='accordion-body'>
                        {groups.map(renderGroupRow)}
                    </Accordion.Body>
                    <hr />
                </Accordion.Item>
            </Accordion>
        </LazyLoad>
    )
}

const CrossOverPage: React.FC<ICrossOverPageProps> = ({
    sortBy,
    togglePopover,
    setPopoverContent,
}) => {
    const { playerData } = useContext(DataContext)

    return (
        <Row>
            {_.reverse(_.clone(crossOverData)).map(
                (category: IObject, index: number) => (
                    <Col xs={12} md={12} lg={12} key={category.title}>
                        <CrossOverBlock
                            playerData={playerData}
                            category={category}
                            index={index}
                            eventKey={`crossover-${index}`}
                            sortBy={sortBy}
                            togglePopover={togglePopover}
                            setPopoverContent={setPopoverContent}
                        />
                    </Col>
                ),
            )}
        </Row>
    )
}

export default React.memo(CrossOverPage)
