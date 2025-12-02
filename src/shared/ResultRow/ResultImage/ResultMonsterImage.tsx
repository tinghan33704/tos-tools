import React, { useCallback, useContext, useRef, useMemo } from "react"
import { Col, Popover, Row } from "react-bootstrap"
import _ from "lodash"
import { AutoTextSize } from "auto-text-size"

import { attrZhToEn, raceZhToEn } from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import ThemeContext from "src/utilities/Context/ThemeContext"
import {
    descriptionTranslator,
    getMonsterById,
    paddingZeros,
} from "src/utilities/utils"
import Image from "src/utilities/Image"
import {
    useChinarashi,
    useCongratsClicker,
    useExplode,
    useGlassBreak,
    useMangaVoiceText,
    useMikuDisappear,
} from "src/hook/EasterEgg/EasterEgg"

import "./style.scss"

export interface IResultMonsterImageProps {
    data: IObject
    noImagePopover: boolean // Whether information popover should be shown after clicking on image
    togglePopover?: (e: React.MouseEvent) => void
    setPopoverContent?: (content: React.ReactElement) => void
    searchParam: IObject
    resultData: IObject[]
}

export const ResultMonsterImage: React.FC<IResultMonsterImageProps> = (
    props
) => {
    const {
        data,
        noImagePopover,
        togglePopover,
        setPopoverContent,
        searchParam,
        resultData,
    } = props
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
        specialImage,
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

    const keywordsArr = useMemo(() => searchParam?.keyword, [searchParam])
    const resultMonsterId = useMemo(
        () => resultData?.map((data) => data?.id),
        [resultData]
    )

    /***** EASTER EGG *****/
    /* Flags for special image or image change design */
    const hasSpecialImage = useMemo(() => !!specialImage, [specialImage])
    const hasImageChange = useMemo(
        () =>
            !!(
                skillIndexes?.length === 1 &&
                monsterInfo?.skill?.[skillIndexes?.[0]]?.imageChange
            ),
        [monsterInfo?.skill, skillIndexes]
    )
    const imageChangeArr = useMemo(
        () => monsterInfo?.skill?.[skillIndexes?.[0]]?.imageChange || [],
        [monsterInfo?.skill, skillIndexes]
    )

    /* Reiner sits down when result has Eren */
    const reinerSitDown =
        id === 10400 &&
        resultMonsterId?.some((id) => id === 10383 || id === 10384)

    const { setGlassBreak, repairGlass } = useGlassBreak()
    const { setMangaVoiceText } = useMangaVoiceText()
    const { setExplode } = useExplode()
    const { mikuDisappear } = useMikuDisappear()
    const { repairThemeSwitch } = useContext(ThemeContext)
    const { setChinarashi } = useChinarashi()
    const { onClickKirito } = useCongratsClicker()
    /***** EASTER EGG *****/

    const renderMonsterName = useCallback(() => {
        /***** EASTER EGG *****/
        /* Race icon change for Kirito and Maomao */
        const specialRaceIcon =
            id === 10495 ? "kirito" : id === 10444 ? "yao" : null
        /***** EASTER EGG *****/

        const attrStr = attrZhToEn?.[attribute] || "u"
        const raceStr = raceZhToEn?.[race] || "u"

        const attrPath = `icon/icon_${attrStr}`
        const racePath = specialRaceIcon
            ? `other/icon_${specialRaceIcon}`
            : `icon/icon_${raceStr}`
        const starPath = `icon/icon_${star}`

        return (
            <Row className={`result-info-header result-info-header-${attrStr}`}>
                <Col xs={12} sm={3} className='monster-attr-race-star'>
                    <Image path={attrPath} />
                    <Image path={racePath} />
                    <Image path={starPath} />
                </Col>
                <Col
                    xs={12}
                    sm={9}
                    className={`monster-name monster-name-${attrStr}`}
                >
                    {name}
                </Col>
                <hr />
            </Row>
        )
    }, [attribute, id, name, race, star])

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
                        >
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
                                ) : skill?.type === "changed" ||
                                  skill?.changedSkill ? (
                                    <Image path='icon/changed' />
                                ) : skill?.type === "refine-changed" ||
                                  skill?.changedSkill ? (
                                    <>
                                        <Image path='icon/changed' />
                                        <Image
                                            path={`icon/refine_${skill?.refine}`}
                                        />
                                    </>
                                ) : (
                                    <></>
                                )}
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: descriptionTranslator(
                                            id,
                                            skill?.name
                                        ),
                                    }}
                                ></div>
                            </>
                        </Col>
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
                    /***** EASTER EGG *****/
                    /* Popover background change for Kirito */
                    className={`result-info-popover${
                        id === 10495 ? " kirito" : ""
                    }`}
                    /***** EASTER EGG *****/
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
        [id, noImagePopover, renderMonsterName, renderMonsterSkill]
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
        /***** EASTER EGG *****/

        /* Lin Dai-yu changes image at night */
        const currentTime = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" })
        )
        const passedMinutesFromToday =
            currentTime.getHours() * 60 + currentTime.getMinutes()
        const isNowNight =
            id === 10622 &&
            (passedMinutesFromToday < 6 * 60 ||
                passedMinutesFromToday >= 18 * 60)

        /* Change digimon image with special keyword */
        const digimonShinka =
            [10244, 10245, 10246, 10248, 10249, 10250].includes(id) &&
            keywordsArr.includes("進化")
        const digimonChouShinka =
            [10244, 10245, 10246, 10248, 10249, 10250].includes(id) &&
            keywordsArr.includes("超進化")

        /* Anya smiles when result has Damian */
        const anyaSmile =
            id === 10329 && resultMonsterId?.some((id) => id === 10335)

        /* Cilantro angry when result has Copernicus */
        const cilantroAngry =
            id === 2835 && resultMonsterId?.some((id) => id === 2023)

        /* Random images for Capoo */
        const capooImage = id === 11075

        const pathId = hasImageChange
            ? document
                  .querySelector(
                      `.result-image[path="monster/${imageChangeArr?.[0]}"]`
                  )
                  ?.getAttribute("focused")
                ? imageChangeArr?.[1]
                : imageChangeArr?.[0]
            : (hasSpecialImage &&
                  document.querySelector(
                      `.result-image[src$="${id}.png"][focused="true"]`
                  )) ||
              anyaSmile ||
              cilantroAngry
            ? `${id}_sp`
            : isNowNight
            ? `${id}_sp`
            : digimonChouShinka
            ? `${id}_sp2`
            : digimonShinka
            ? `${id}_sp1`
            : document.querySelector(
                  `.result-image[src$="${id}.png"][focused="true"]`
              ) && capooImage
            ? `${id}_sp${_.random(1, 5)}`
            : id
        /***** EASTER EGG *****/

        return (
            <>
                <Image
                    path={`monster/${pathId}`}
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
    }, [
        hasImageChange,
        hasSpecialImage,
        id,
        imageChangeArr,
        keywordsArr,
        noImagePopover,
        notInInventory,
        resultMonsterId,
        skillIndex,
        skillIndexes,
        skills,
    ])

    const onClickImage = useCallback(
        (e: React.MouseEvent) => {
            if (
                !document
                    .querySelector(
                        `.result-image[path="monster/${id}"], .result-image[path^="monster/${id}_sp"]${
                            hasImageChange
                                ? `, .result-image[path="monster/${imageChangeArr?.[0]}"], .result-image[path="monster/${imageChangeArr?.[1]}"]`
                                : ""
                        }`
                    )
                    ?.getAttribute("focused")
            ) {
                togglePopover?.(e)
                setPopoverContent?.(monsterInfoPopover)
            }

            /***** EASTER EGG *****/
            // Click on Saitama's image breaks the screen
            if (id === 10294) {
                setGlassBreak(e.target as HTMLElement, e.pageX, e.pageY)
            }
            // Click on Joestars, Dio and Bucciarati's image shows manga voice text
            if (id === 10581 || id === 10895 || id === 10916) {
                setMangaVoiceText(
                    e.target as HTMLElement,
                    e.pageX,
                    e.pageY,
                    "ora"
                )
            }
            if (id === 10598 || id === 10898 || id === 10899) {
                setMangaVoiceText(
                    e.target as HTMLElement,
                    e.pageX,
                    e.pageY,
                    "muda"
                )
            }
            if (id === 10903) {
                setMangaVoiceText(
                    e.target as HTMLElement,
                    e.pageX,
                    e.pageY,
                    "ari"
                )
            }
            // Click on Kira's image explodes
            if (id === 10906) {
                setExplode(e.target as HTMLElement, e.pageX, e.pageY)
            }
            // Click on Josuke's image fix the screen and theme switch
            if (id === 10896) {
                repairGlass()
                repairThemeSwitch()
            }
            // Click on A Song of Farewell - Hatsune Miku's image she disappears
            if (id === 10530) {
                mikuDisappear(e.target as HTMLElement)
            }
            // Click on Doomsday Titan's image trigger chinarashi
            if (id === 10402) {
                setChinarashi()
            }
            // Click on Kirito's image 16 times in 10 seconds show congratulations banner
            if (id === 10495) {
                onClickKirito()
            }
            /***** EASTER EGG *****/
        },
        [
            hasImageChange,
            id,
            imageChangeArr,
            mikuDisappear,
            monsterInfoPopover,
            onClickKirito,
            repairGlass,
            repairThemeSwitch,
            setChinarashi,
            setExplode,
            setGlassBreak,
            setMangaVoiceText,
            setPopoverContent,
            togglePopover,
        ]
    )

    return (
        <div ref={ref}>
            {!noImagePopover ? (
                <div
                    key={id}
                    /***** EASTER EGG *****/
                    /* Reiner sits down when result has Eren */
                    className={`result-image-wrapper${
                        reinerSitDown ? " reiner" : ""
                    }`}
                    /***** EASTER EGG *****/
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
