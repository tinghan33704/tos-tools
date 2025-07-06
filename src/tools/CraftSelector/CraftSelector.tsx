import React, { useEffect, useRef, useState, useCallback } from "react"
import { Table } from "react-bootstrap"
import _, { throttle } from "lodash"
import { faCheck, faLightbulb } from "@fortawesome/free-solid-svg-icons"

import {
    craftModeTypeString,
    raceZhToEn,
    attrZhToEn,
} from "src/constant/filterConstants"
import { armedCraftData } from "src/constant/armedCraftData"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import {
    errorAlert,
    getCraftById,
    getMonsterById,
    paddingZeros,
} from "src/utilities/utils"
import Icon from "src/utilities/Icon"
import Image from "src/utilities/Image"
import Header from "src/shared/Header"
import PageContainer from "src/shared/PageContainer"
import ResultRow from "src/shared/ResultRow"
import { ResultCraftImage } from "src/shared/ResultRow/ResultImage"
import InputModal from "src/shared/InputModal"

import "./style.scss"

interface ICraftSelectorProps {}

const CraftSelector: React.FC<ICraftSelectorProps> = () => {
    const [selectedCrafts, setSelectedCrafts] = useState<number[]>([])
    const [resultData, setResultData] = useState<number[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [inputModalOpen, setInputModalOpen] = useState<boolean>(false)
    const [resultPanelClicked, setResultPanelClicked] = useState<boolean>(false)

    const [craftDataByName, setCraftDataByName] = useState<IObject>({})
    const [craftPureName, setCraftPureName] = useState<Set<string>>(new Set())
    const [headerHeight, setHeaderHeight] = useState<number>(0)
    const [displayEnd, setDisplayEnd] = React.useState(0)
    const [scrollPosition, setScrollPosition] = React.useState(0)
    const [displayedData, setDisplayedData] = useState<string[]>([])

    const itemRowHeight = 175
    const screenHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
    )
    const offset = screenHeight * 5

    const resultRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setFavIconAndTitle("craft-selector")
        initCraftData()

        const headerElement =
            document.getElementsByClassName("tool-header")?.[0]
        setHeaderHeight(headerElement?.clientHeight)
        setDisplayEnd(Math.round((scrollPosition + offset) / itemRowHeight))
    }, [])

    useEffect(() => {
        window.addEventListener("resize", onResize)
        window.addEventListener("scroll", onScroll)
        return () => {
            window.removeEventListener("resize", onResize)
            window.removeEventListener("scroll", onScroll)
        }
    }, [])

    const onResize = useCallback(() => {
        const headerElement =
            document.getElementsByClassName("tool-header")?.[0]
        setHeaderHeight(headerElement?.clientHeight)
    }, [])

    const onScroll = throttle(() => {
        const scrollTop = window.scrollY
        setScrollPosition(scrollTop)
    }, 100)

    useEffect(() => {
        setDisplayEnd(
            Math.max(
                displayEnd,
                Math.round((scrollPosition + offset) / itemRowHeight)
            )
        )
    }, [displayEnd, offset, scrollPosition])

    useEffect(() => {
        setDisplayedData([...craftPureName].slice(0, displayEnd))
    }, [displayEnd, craftPureName])

    const getCraftPureName = (name: string) => {
        return name
            .replace(/\s|‧/g, "")
            .replace(/【(.*?)】/g, "")
            .replace(
                /龍紋|龍印|龍咒|龍符|龍玉|龍刃|龍璃|龍結|龍丸|龍弦|龍輝/g,
                ""
            )
            .replace(
                /連鎖|轉動|破碎|映照|疾速|裂空|落影|擴散|鏡像|節奏|援護/g,
                ""
            )
    }

    const initCraftData = useCallback(() => {
        const craftDataByName: IObject = {}
        const craftPureName: Set<string> = new Set()

        armedCraftData.forEach((craft) => {
            let pureName = getCraftPureName(craft.name)

            if (!craftDataByName?.[pureName]) {
                craftDataByName[pureName] = { duplicateCount: 1 }
            }

            if (!craftDataByName[pureName]?.monster) {
                craftDataByName[pureName].monster = craft.monster
            }

            if (!craftDataByName[pureName]?.attribute) {
                craftDataByName[pureName].attribute = craft.attribute
            }

            if (!craftDataByName[pureName]?.race) {
                craftDataByName[pureName].race = craft.race
            }

            if (!craftDataByName[pureName]?.series) {
                craftDataByName[pureName].series = craft.series
            }

            if (!craftDataByName[pureName]?.nameTag) {
                craftDataByName[pureName].nameTag = craft.nameTag
            }

            craftPureName.add(pureName)

            if (craftDataByName?.[pureName]?.[craft.mode]) {
                craftDataByName[pureName][craft.mode].push(craft.id)
            } else {
                craftDataByName[pureName][craft.mode] = [craft.id]
            }

            craftDataByName[pureName].duplicateCount = Math.max(
                craftDataByName[pureName].duplicateCount,
                craftDataByName[pureName][craft.mode].length
            )
        })

        setCraftDataByName(craftDataByName)
        setCraftPureName(craftPureName)
    }, [])

    const resetAll = useCallback(() => {
        setSelectedCrafts([])
    }, [])

    const startFilter = useCallback(() => {
        setResultPanelClicked(false)

        if (!selectedCrafts.length) {
            errorAlert(8)
            return
        }

        setResultData(selectedCrafts)

        setIsAfterFilter(true)
    }, [selectedCrafts])

    const openInputModal = useCallback(() => {
        setInputModalOpen(true)
    }, [])

    const resultIdPanel = useCallback(() => {
        const resultStr = resultData
            .map((craft) => paddingZeros(craft, 5))
            .join(" ")

        return (
            <>
                <div
                    className={`result-id-panel${
                        resultPanelClicked ? " result-id-panel-copied" : ""
                    }`}
                    onClick={() => {
                        setResultPanelClicked(true)
                        navigator.clipboard.writeText(resultStr)
                    }}
                >
                    {resultStr}
                </div>
                <div className='note-row'>
                    {resultPanelClicked ? (
                        <>
                            <Icon icon={faCheck} />
                            &nbsp; 複製成功
                        </>
                    ) : (
                        <>
                            <Icon icon={faLightbulb} />
                            &nbsp; 點擊區塊可直接複製完整字串
                        </>
                    )}
                </div>
            </>
        )
    }, [resultData, resultPanelClicked])

    const onSelectCrafts = useCallback(
        (crafts: number[]) => {
            let _result = selectedCrafts
            crafts.forEach((craft) => {
                if (_result.includes(craft)) {
                    _result = _result.filter((c) => c !== craft)
                } else {
                    _result = _result.concat([craft])
                }
            })
            setSelectedCrafts(_result)
        },
        [selectedCrafts]
    )

    const renderTable = useCallback(() => {
        return (
            <>
                <Table bordered className='craft-select-table'>
                    <thead style={{ top: `${headerHeight - 1}px` }}>
                        <tr>
                            {craftModeTypeString.map((type, index) => {
                                return (
                                    <td className='craft-header-type'>
                                        <Image
                                            width={50}
                                            path={`craft/${type}`}
                                            noTitle
                                        />
                                        <div className='craft-header-type-text'>
                                            {type.slice(-2)}
                                        </div>
                                    </td>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedData.map((name: string) => {
                            const allCrafts = craftModeTypeString
                                .map((mode) => {
                                    return craftDataByName[name]?.[mode] || []
                                })
                                .flat()
                            return (
                                <>
                                    <tr
                                        className='craft-info-tr'
                                        onClick={() =>
                                            onSelectCrafts(allCrafts)
                                        }
                                    >
                                        <td className='craft-name' colSpan={4}>
                                            {name}
                                        </td>
                                        <td
                                            className='craft-objective'
                                            colSpan={
                                                craftModeTypeString.length - 4
                                            }
                                        >
                                            {craftDataByName[name]?.series ? (
                                                <>
                                                    {craftDataByName[
                                                        name
                                                    ]?.series.map(
                                                        (serie: string) => (
                                                            <Image
                                                                width={50}
                                                                path={`series/${serie}`}
                                                            />
                                                        )
                                                    )}{" "}
                                                    {craftDataByName[
                                                        name
                                                    ]?.series
                                                        .map(
                                                            (serie: string) =>
                                                                `【${serie}】`
                                                        )
                                                        .join("、")}
                                                    特性
                                                </>
                                            ) : craftDataByName[name]
                                                  ?.monster ? (
                                                craftDataByName[
                                                    name
                                                ]?.monster?.map(
                                                    (monster: number) => {
                                                        const _monster =
                                                            getMonsterById(
                                                                monster
                                                            )
                                                        return (
                                                            <Image
                                                                width={50}
                                                                path={`monster/${monster}`}
                                                            />
                                                        )
                                                    }
                                                )
                                            ) : craftDataByName[name]
                                                  ?.attribute ||
                                              craftDataByName[name]?.race ? (
                                                <>
                                                    {craftDataByName[name]
                                                        ?.attribute &&
                                                    craftDataByName[name]
                                                        ?.attribute !==
                                                        "沒有限制" ? (
                                                        <Image
                                                            width={30}
                                                            path={`icon/icon_${
                                                                attrZhToEn[
                                                                    craftDataByName[
                                                                        name
                                                                    ]?.attribute
                                                                ]
                                                            }`}
                                                        />
                                                    ) : (
                                                        <></>
                                                    )}
                                                    {craftDataByName[name]
                                                        ?.race &&
                                                    craftDataByName[name]
                                                        ?.race !==
                                                        "沒有限制" ? (
                                                        <Image
                                                            width={30}
                                                            path={`icon/icon_${
                                                                raceZhToEn[
                                                                    craftDataByName[
                                                                        name
                                                                    ]?.race
                                                                ]
                                                            }`}
                                                        />
                                                    ) : (
                                                        <></>
                                                    )}{" "}
                                                    {craftDataByName[name]
                                                        ?.attribute &&
                                                    craftDataByName[name]
                                                        ?.attribute !==
                                                        "沒有限制"
                                                        ? `${craftDataByName[name]?.attribute}屬性`
                                                        : ""}
                                                    {craftDataByName[name]
                                                        ?.race &&
                                                    craftDataByName[name]
                                                        ?.race !== "沒有限制"
                                                        ? craftDataByName[name]
                                                              ?.race
                                                        : ""}
                                                </>
                                            ) : (
                                                ``
                                            )}
                                        </td>
                                    </tr>
                                    {[
                                        ...Array(
                                            craftDataByName?.[name]
                                                ?.duplicateCount
                                        ),
                                    ].map((item, index) => {
                                        return (
                                            <tr className='craft-image-tr'>
                                                {craftModeTypeString.map(
                                                    (mode) => {
                                                        const id =
                                                            craftDataByName?.[
                                                                name
                                                            ]?.[mode]?.[index]

                                                        return id ? (
                                                            <td
                                                                className={`craft-image craft-have-mode${
                                                                    selectedCrafts.includes(
                                                                        id
                                                                    )
                                                                        ? " craft-image-selected"
                                                                        : ""
                                                                }`}
                                                                onClick={() =>
                                                                    onSelectCrafts(
                                                                        [id]
                                                                    )
                                                                }
                                                            >
                                                                <ResultCraftImage
                                                                    data={{
                                                                        id,
                                                                    }}
                                                                    noImagePopover={
                                                                        true
                                                                    }
                                                                />
                                                            </td>
                                                        ) : (
                                                            <td className='craft-image'></td>
                                                        )
                                                    }
                                                )}
                                            </tr>
                                        )
                                    })}
                                </>
                            )
                        })}
                    </tbody>
                </Table>
            </>
        )
    }, [
        craftDataByName,
        displayedData,
        headerHeight,
        onSelectCrafts,
        selectedCrafts,
    ])

    useEffect(() => {
        isAfterFilter &&
            resultRef?.current &&
            resultRef.current.scrollIntoView(true)
    }, [isAfterFilter, resultData])

    return (
        <ContextProvider
            toolId='craft-selector'
            resetAll={resetAll}
            startFilter={startFilter}
        >
            <Header />
            <PageContainer openInputModal={openInputModal}>
                <>
                    <div ref={resultRef}>
                        {isAfterFilter ? (
                            <>
                                <ResultRow title='生成編號'>
                                    {resultIdPanel()}
                                </ResultRow>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                    {renderTable()}
                </>
            </PageContainer>
            <InputModal
                open={inputModalOpen}
                onClose={() => setInputModalOpen(false)}
                onChangeInput={(input) => {
                    const inputArr = _.uniq(
                        input
                            .split(/\s+/)
                            .filter((str) => str.length)
                            .map((str) => parseInt(str))
                    ).filter((id) => !_.isEmpty(getCraftById(id)))
                    resetAll()
                    setSelectedCrafts(inputArr)
                    setResultData(inputArr)
                    setResultPanelClicked(false)
                    setIsAfterFilter(true)
                }}
            />
        </ContextProvider>
    )
}

export default CraftSelector
