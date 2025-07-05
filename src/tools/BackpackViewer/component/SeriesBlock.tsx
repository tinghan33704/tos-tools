import React, { useEffect, useRef, useState, useCallback } from "react"
import _ from "lodash"
import { Accordion, Col, Row } from "react-bootstrap"
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"

import { paddingZeros } from "src/utilities/utils"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"
import MonsterImage from "./MonsterImage"

import "./style.scss"

interface ISeriesBlockProps {
    playerData: IObject
    title: string
    data: (number | number[])[]
    key: string | number
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
]
const showFinalStageEvenNotExist = [
    "強力武裝",
    "戰鬥魔導士",
    "百變騎士",
    "騰雲逸龍",
    "變形金屬",
]

const SeriesBlock: React.FC<ISeriesBlockProps> = ({
    playerData,
    title,
    data,
    key,
    togglePopover,
    setPopoverContent,
}) => {
    const ref = useRef(null)

    const [isOpen, setIsOpen] = useState(true)

    const renderSeriesInfoPopover = useCallback(
        (ids: number[]) => {
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
                            <Col xs={2} className='monster-series-col'>
                                <div className='monster-image'>
                                    <Image
                                        path={`monster/${id}`}
                                        className={`result-image${
                                            notInInventory ? " gray-scale" : ""
                                        }`}
                                    />
                                </div>
                                <div
                                    className={`monster-id${
                                        notInInventory ? " gray-scale" : ""
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
                                <div
                                    className={`monster-count${
                                        notInInventory ? " gray-scale" : ""
                                    }`}
                                >
                                    × {count}
                                </div>
                            </Col>
                        )
                    })}
                </div>
            )
        },
        [playerData]
    )

    const renderHeader = useCallback(() => {
        const total = data?.length
        const collected =
            data?.filter((series) =>
                _.isArray(series)
                    ? series.some((monster) =>
                          playerData?.card?.includes(monster)
                      )
                    : playerData?.card?.includes(series)
            )?.length || 0

        const isAllCollected = collected >= total && total > 0

        return (
            <Accordion.Header
                className={`monster-series-header${
                    isAllCollected ? " all-collected" : ""
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className='title-expander'>
                    <Icon icon={isOpen ? faCaretUp : faCaretDown} />
                </span>
                <div>{title}</div>
                <span className='collect-progress'>{`${collected} / ${total}`}</span>
            </Accordion.Header>
        )
    }, [data, playerData, title, isOpen])

    const onClickImage = useCallback(
        (e: React.MouseEvent, ids: number[]) => {
            togglePopover(e)
            setPopoverContent(renderSeriesInfoPopover(ids))
        },
        [renderSeriesInfoPopover, setPopoverContent, togglePopover]
    )

    const renderContent = useCallback(() => {
        return (
            <Row className='monster-series-content'>
                {data.map((id) => {
                    let _id = -1
                    let notInInventory = true
                    if (_.isArray(id)) {
                        const revIdArr = [...id].reverse()
                        for (let i in revIdArr) {
                            _id = revIdArr[i]
                            if (
                                playerData?.card?.includes(_id) &&
                                playerData?.info?.[_id]
                            ) {
                                notInInventory = false
                                break
                            }
                        }

                        if (notInInventory) {
                            _id = showFirstStageAsEmptyPreview.includes(title)
                                ? [...id][0]
                                : revIdArr[0]
                        } else if (showFinalStageEvenNotExist.includes(title)) {
                            _id = revIdArr[0]
                            notInInventory = !(
                                playerData?.card?.includes(_id) &&
                                playerData?.info?.[_id]
                            )
                        }
                    } else {
                        _id = id
                        notInInventory = !playerData?.card?.includes(_id)
                    }

                    return (
                        <Col
                            xs={3}
                            md={3}
                            lg={2}
                            className='monster-series-block'
                        >
                            <MonsterImage
                                playerData={playerData}
                                id={_id}
                                notInInventory={notInInventory}
                                onClick={(e) =>
                                    onClickImage(e, _.isArray(id) ? id : [id])
                                }
                            />
                        </Col>
                    )
                })}
            </Row>
        )
    }, [data, onClickImage, playerData, title])

    return (
        <>
            <Accordion defaultActiveKey={`${key}`}>
                <Accordion.Item eventKey={`${key}`} className='accordion-item'>
                    {renderHeader()}
                    <Accordion.Body className='accordion-body'>
                        {renderContent()}
                    </Accordion.Body>
                    <hr />
                </Accordion.Item>
            </Accordion>
        </>
    )
}

export default SeriesBlock
