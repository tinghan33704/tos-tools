import React, { useCallback, useContext, useRef, useMemo } from "react"
import * as ReactDOMServer from "react-dom/server"
import { Col, OverlayTrigger, Popover, Row } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"

import Context from "src/utilities/Context/Context"
import {
    descriptionTranslator,
    getMonsterById,
    paddingZeros,
} from "src/utilities/utils"
import { attr_zh_to_en, race_zh_to_en } from "src/constant/filterConstants"
import Image from "src/utilities/Image"

import "./style.scss"

export interface IResultMonsterImageProps {
    data: IObject
    noImagePopover: boolean // Whether information popover should be shown after clicking on image
    togglePopover?: (e: React.MouseEvent) => void
    setPopoverContent?: (content: React.ReactElement) => void
}

export const ResultMonsterImage: React.FC<IResultMonsterImageProps> = (
    props
) => {
    const { data, noImagePopover, togglePopover, setPopoverContent } = props
    const ref = useRef(null)
    const { toolId } = useContext(Context)
    const { id, skillIndex, skillIndexes, notInInventory, skill } = data
    const monsterInfo: IObject = getMonsterById(id)
    const {
        displayId = null,
        name = "",
        attribute = "",
        race = "",
        star = 0,
    } = monsterInfo

    const skills = useMemo(
        () =>
            toolId === "team-skill-filter"
                ? monsterInfo?.teamSkill
                : toolId === "leader-skill-filter"
                ? [skill]
                : monsterInfo?.skill,
        [monsterInfo, skill, toolId]
    )

    const renderMonsterName = useCallback(() => {
        return (
            <Row
                className={`result-info-header result-info-header-${attr_zh_to_en[attribute]}`}
            >
                <Col xs={12} sm={3} className='monster-attr-race-star'>
                    <Image path={`icon/icon_${attr_zh_to_en[attribute]}`} />
                    <Image path={`icon/icon_${race_zh_to_en[race]}`} />
                    <Image path={`icon/icon_${star}`} />
                </Col>
                <Col
                    xs={12}
                    sm={9}
                    className={`monster-name monster-name-${attr_zh_to_en[attribute]}`}
                >
                    {name}
                </Col>
                <hr />
            </Row>
        )
    }, [attribute, name, race, star])

    const renderMonsterSkill = useCallback(() => {
        return (skillIndexes || [skillIndex]).map((skillIndex: number) => {
            const skill = skills?.[skillIndex]
            return (
                <Row className='monster-skill'>
                    <Row className='monster-skill-name-row'>
                        <Col
                            xs={9}
                            sm={9}
                            className={`monster-skill-name monster-skill-name-${skill?.type}`}
                            dangerouslySetInnerHTML={{
                                __html: `${ReactDOMServer.renderToString(
                                    <>
                                        {skill?.type === "refine" ? (
                                            <Image
                                                path={`icon/refine_${skill?.refine}`}
                                            />
                                        ) : skill?.type === "recall" ? (
                                            <Image path='icon/recall' />
                                        ) : skill?.type === "combine" ||
                                          skill?.changedSkill ? (
                                            <Image path='icon/combine' />
                                        ) : (
                                            <></>
                                        )}
                                    </>
                                )}${skill?.name}`,
                            }}
                        ></Col>
                        <Col xs={3} sm={3} className={"monster-skill-charge"}>
                            {`${skill?.charge || ""} `}
                            {"reduce" in skill
                                ? `${skill?.num} → ${
                                      skill?.num - skill?.reduce
                                  }`
                                : skill?.num <= 0
                                ? "-"
                                : skill?.num || ""}
                        </Col>
                    </Row>
                    {"combine" in skill && (
                        <>
                            <Col xs={12} sm={12} className='monster-skill-hr'>
                                <hr />
                            </Col>
                            <Row className='monster-skill-combine-row'>
                                <Col xs={12} sm={12}>
                                    {skill?.combine?.member?.map(
                                        (member: number, index: number) => (
                                            <>
                                                <Image
                                                    path={`monster/${member}`}
                                                />
                                                {index !==
                                                skill?.combine?.member?.length -
                                                    1
                                                    ? " + "
                                                    : ""}
                                            </>
                                        )
                                    )}
                                    {" → "}
                                    {
                                        <Image
                                            path={`monster/${skill?.combine?.out}`}
                                        />
                                    }
                                </Col>
                            </Row>
                        </>
                    )}
                    {"transform" in skill && (
                        <>
                            <Col xs={12} sm={12} className='monster-skill-hr'>
                                <hr />
                            </Col>
                            <Row className='monster-skill-transform-row'>
                                <Col xs={12} sm={12}>
                                    <Image path={`monster/${id}`} />
                                    {" → "}
                                    {!Array.isArray(skill?.transform) ? (
                                        <Image
                                            path={`monster/${skill?.transform}`}
                                        />
                                    ) : (
                                        skill?.transform?.map(
                                            (transformed: number) => (
                                                <Image
                                                    path={`monster/${transformed}`}
                                                />
                                            )
                                        )
                                    )}
                                </Col>
                            </Row>
                        </>
                    )}
                    {skill?.type === "combine" && (
                        <>
                            <Col xs={12} sm={12} className='monster-skill-hr'>
                                <hr />
                            </Col>
                            <Row className='monster-skill-combine-row'>
                                <Col xs={12} sm={12}>
                                    {skill?.member?.map(
                                        (member: number, index: number) => (
                                            <>
                                                <Image
                                                    path={`monster/${member}`}
                                                />
                                                {index !==
                                                skill?.member?.length - 1
                                                    ? " + "
                                                    : ""}
                                            </>
                                        )
                                    )}
                                </Col>
                            </Row>
                        </>
                    )}
                    <Col xs={12} sm={12} className='monster-skill-hr'>
                        <hr />
                    </Col>
                    <Row className='monster-skill-description-row'>
                        <Col
                            xs={12}
                            sm={12}
                            className={"monster-skill-description"}
                            dangerouslySetInnerHTML={{
                                __html: descriptionTranslator(
                                    id,
                                    skill.description
                                ),
                            }}
                        ></Col>
                    </Row>
                </Row>
            )
        })
    }, [id, skillIndex, skillIndexes, skills])

    const monsterInfoPopover = useMemo(
        () =>
            !noImagePopover ? (
                <Popover
                    id='result-info'
                    className='result-info-popover'
                    title=''
                >
                    <>
                        {renderMonsterName()}

                        <Row className='monster-skill-wrapper'>
                            {renderMonsterSkill()}
                        </Row>
                    </>
                </Popover>
            ) : (
                <></>
            ),
        [noImagePopover, renderMonsterName, renderMonsterSkill]
    )

    const renderIdTag = useCallback(() => {
        return (
            <div
                className={`result-image-id-tag${
                    notInInventory ? " result-image-id-tag-gray" : ""
                }`}
            >
                <a
                    href={`https://tos.fandom.com/zh/wiki/${displayId || id}`}
                    target='_blank'
                    rel='noreferrer noopener'
                >
                    <AutoTextSize maxFontSizePx={20}>
                        {paddingZeros(displayId || id, 3)}
                    </AutoTextSize>
                </a>
            </div>
        )
    }, [displayId, id, notInInventory])

    const renderImage = useCallback(() => {
        return (
            <>
                <Image
                    path={`monster/${id}`}
                    className={`result-image${
                        notInInventory ? " result-image-gray" : ""
                    }${noImagePopover ? " result-image-no-popover" : ""}`}
                />
                {(skills[skillIndexes?.[0] || skillIndex]?.type === "combine" ||
                    skills[skillIndex]?.changedSkill) && (
                    <Image
                        path='icon/combine'
                        className={`combine-icon${
                            notInInventory ? " combine-icon-gray" : ""
                        }`}
                    />
                )}
            </>
        )
    }, [id, noImagePopover, notInInventory, skillIndex, skillIndexes, skills])

    const onClickImage = useCallback(
        (e: React.MouseEvent) => {
            togglePopover?.(e)
            setPopoverContent?.(monsterInfoPopover)
        },
        [monsterInfoPopover, setPopoverContent, togglePopover]
    )

    return (
        <div ref={ref}>
            {!noImagePopover ? (
                // <OverlayTrigger
                //     trigger='click'
                //     placement='auto-start'
                //     overlay={monsterInfoPopover}
                //     container={ref}
                //     rootClose
                // >
                //     <div className='result-image-wrapper' onClick={onClickImage}>{renderImage()}</div>
                // </OverlayTrigger>
                <div className='result-image-wrapper' onClick={onClickImage}>
                    {renderImage()}
                </div>
            ) : (
                <div className='result-image-wrapper'>{renderImage()}</div>
            )}

            {renderIdTag()}
        </div>
    )
}
