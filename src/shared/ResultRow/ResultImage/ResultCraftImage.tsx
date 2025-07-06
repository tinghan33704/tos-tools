import React, { useCallback, useRef, useMemo } from "react"
import { Col, OverlayTrigger, Popover, Row } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"

import { getCraftById, paddingZeros } from "src/utilities/utils"
import {
    attrZhToEn,
    craftChargeTypeString,
    craftChargeTypeStringMapping,
    raceZhToEn,
} from "src/constant/filterConstants"
import Image from "src/utilities/Image"

import "./style.scss"

export interface IResultCraftImageProps {
    data: IObject
    noImagePopover: boolean // Whether information popover should be shown after clicking on image
    togglePopover?: (e: React.MouseEvent) => void
    setPopoverContent?: (content: React.ReactElement) => void
}

export const ResultCraftImage: React.FC<IResultCraftImageProps> = (props) => {
    const { data, noImagePopover, togglePopover, setPopoverContent } = props
    const ref = useRef(null)
    const { id, notInInventory } = data
    const craftInfo: IObject = getCraftById(id)
    const {
        name = "",
        attribute = "",
        race = "",
        charge = 0,
        monster,
        series,
        add_hp,
        add_atk,
        add_rec,
        description,
        skill_description,
        armed_description,
    } = craftInfo

    const renderCraftInfo = useCallback(() => {
        const skillArr = description || skill_description || []
        const armedArr = armed_description || []
        const hasObjective =
            (attribute && attribute !== "沒有限制") ||
            (race && race !== "沒有限制") ||
            monster?.length ||
            series?.length

        return (
            <Row className={`craft-wrapper`}>
                <Col
                    xs={12}
                    sm={12}
                    className={`craft-name craft-name-${
                        attrZhToEn?.[attribute] || "o"
                    }`}
                >
                    {name}
                </Col>
                <Row className={"craft-objective-row"}>
                    <Col xs={12} sm={4} className={`craft-section-title`}>
                        {hasObjective ? "適用對象" : "裝備限制"}
                    </Col>
                    <Col
                        xs={12}
                        sm={8}
                        className={`craft-objective craft-name-${
                            attrZhToEn?.[attribute] || "o"
                        }`}
                    >
                        {hasObjective ? (
                            monster ? (
                                monster.map((id: number) => (
                                    <Image
                                        path={`monster/${id}`}
                                        className={"craft-monster-img"}
                                    />
                                ))
                            ) : series ? (
                                <>
                                    擁有
                                    {series.map((s: string, index: number) => (
                                        <>
                                            {index ? `、` : ""}
                                            <span className='craft-objective-series'>
                                                【{s}】
                                            </span>
                                        </>
                                    ))}
                                    特性
                                </>
                            ) : (
                                <>
                                    {attribute && attribute !== "沒有限制" ? (
                                        <Image
                                            path={`icon/icon_${attrZhToEn[attribute]}`}
                                            className={"craft-attr-race-img"}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                    {race && race !== "沒有限制" ? (
                                        <Image
                                            path={`icon/icon_${raceZhToEn[race]}`}
                                            className={"craft-attr-race-img"}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                    {attribute &&
                                        attribute !== "沒有限制" &&
                                        `${attribute}屬性`}
                                    {race && race !== "沒有限制" && `${race}`}
                                </>
                            )
                        ) : (
                            "無"
                        )}
                    </Col>
                </Row>
                <Row className={"craft-charge-row"}>
                    <Col xs={12} sm={4} className={`craft-section-title`}>
                        充能條件
                    </Col>
                    <Col xs={12} sm={8} className={`craft-charge`}>
                        {craftChargeTypeStringMapping[
                            craftChargeTypeString.indexOf(charge)
                        ] || ""}
                    </Col>
                </Row>
                {"add_hp" in craftInfo &&
                "add_atk" in craftInfo &&
                "add_rec" in craftInfo ? (
                    <Row className={"craft-enhance-row"}>
                        <Col xs={12} sm={4} className={`craft-enhance`}>
                            <Row className={"craft-enhance-hp-row"}>
                                <Col
                                    xs={6}
                                    sm={12}
                                    className={`craft-enhance-title craft-enhance-title-hp`}
                                >
                                    生命力
                                </Col>
                                <Col
                                    xs={6}
                                    sm={12}
                                    className={`craft-enhance-number`}
                                >
                                    {`+ ${add_hp === -1 ? "?" : add_hp} %`}
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={12} sm={4} className={`craft-enhance`}>
                            <Row className={"craft-enhance-atk-row"}>
                                <Col
                                    xs={6}
                                    sm={12}
                                    className={`craft-enhance-title craft-enhance-title-atk`}
                                >
                                    攻擊力
                                </Col>
                                <Col
                                    xs={6}
                                    sm={12}
                                    className={`craft-enhance-number`}
                                >
                                    {`+ ${add_atk === -1 ? "?" : add_atk} %`}
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={12} sm={4} className={`craft-enhance`}>
                            <Row className={"craft-enhance-rec-row"}>
                                <Col
                                    xs={6}
                                    sm={12}
                                    className={`craft-enhance-title craft-enhance-title-rec`}
                                >
                                    回復力
                                </Col>
                                <Col
                                    xs={6}
                                    sm={12}
                                    className={`craft-enhance-number`}
                                >
                                    {`+ ${add_rec === -1 ? "?" : add_rec} %`}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                ) : (
                    <></>
                )}
                {skillArr?.length ? (
                    <Row className={"craft-skill-rows"}>
                        <Col xs={12} sm={12} className={"craft-section-title"}>
                            龍脈能力
                        </Col>
                        {skillArr.map((skill: string, index: number) => {
                            return (
                                <Row className={"craft-skill-row"}>
                                    <Col
                                        xs={2}
                                        sm={2}
                                        className={"craft-skill-index"}
                                    >
                                        <Image
                                            path={`craft/skill_${index + 1}`}
                                        />
                                    </Col>
                                    <Col
                                        xs={10}
                                        sm={10}
                                        className={"craft-skill-text"}
                                    >
                                        {skill}
                                    </Col>
                                </Row>
                            )
                        })}
                    </Row>
                ) : (
                    <></>
                )}
                {armedArr.length ? (
                    <Row className={"craft-skill-rows"}>
                        <Col xs={12} sm={12} className={"craft-section-title"}>
                            武裝能力
                        </Col>
                        {armedArr.map((skill: string, index: number) => {
                            return (
                                <Row className={"craft-skill-row"}>
                                    <Col
                                        xs={2}
                                        sm={2}
                                        className={"craft-skill-index"}
                                    >
                                        <Image
                                            path={`craft/armed_skill_${
                                                index + 1
                                            }`}
                                        />
                                    </Col>
                                    <Col
                                        xs={10}
                                        sm={10}
                                        className={"craft-skill-text"}
                                    >
                                        {skill}
                                    </Col>
                                </Row>
                            )
                        })}
                    </Row>
                ) : (
                    <></>
                )}
            </Row>
        )
    }, [
        add_atk,
        add_hp,
        add_rec,
        armed_description,
        attribute,
        charge,
        craftInfo,
        description,
        monster,
        name,
        race,
        series,
        skill_description,
    ])

    const craftInfoPopover = useMemo(
        () =>
            !noImagePopover ? (
                <Popover
                    id='result-info'
                    className='result-info-popover'
                    title=''
                >
                    <>{renderCraftInfo()}</>
                </Popover>
            ) : (
                <></>
            ),
        [noImagePopover, renderCraftInfo]
    )

    const renderIdTag = useCallback(() => {
        return (
            <div
                className={`result-image-id-tag${
                    notInInventory ? " result-image-id-tag-gray" : ""
                }`}
            >
                <a
                    href={`https://tos.fandom.com/zh/wiki/C${paddingZeros(
                        id,
                        2
                    )}`}
                    target='_blank'
                    rel='noreferrer noopener'
                >
                    <AutoTextSize maxFontSizePx={20}>
                        {paddingZeros(id, 3)}
                    </AutoTextSize>
                </a>
            </div>
        )
    }, [id, notInInventory])

    const renderImage = useCallback(() => {
        return (
            <>
                <Image
                    path={`craft/${id}`}
                    className={`result-image${
                        notInInventory ? " result-image-gray" : ""
                    }${noImagePopover ? " result-image-no-popover" : ""}`}
                />
            </>
        )
    }, [id, noImagePopover, notInInventory])

    const onClickImage = useCallback(
        (e: React.MouseEvent) => {
            togglePopover?.(e)
            setPopoverContent?.(craftInfoPopover)
        },
        [craftInfoPopover, setPopoverContent, togglePopover]
    )

    return (
        <div ref={ref}>
            {!noImagePopover ? (
                // <OverlayTrigger
                //     trigger='click'
                //     placement='auto-start'
                //     overlay={craftInfoPopover}
                //     container={ref}
                //     rootClose
                // >
                //     <div className='result-image-wrapper'>{renderImage()}</div>
                // </OverlayTrigger>
                <div
                    key={id}
                    className='result-image-wrapper'
                    onClick={onClickImage}
                >
                    {renderImage()}
                </div>
            ) : (
                <div key={id} className='result-image-wrapper'>
                    {renderImage()}
                </div>
            )}

            {renderIdTag()}
        </div>
    )
}
