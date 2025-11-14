import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { Col, Form, Row, Table } from "react-bootstrap"
import _ from "lodash"
import {
    faBackward,
    faCaretLeft,
    faCaretRight,
    faCheck,
    faForward,
    faLightbulb,
} from "@fortawesome/free-solid-svg-icons"

import {
    craftModeTypeString,
    raceZhToEn,
    attrZhToEn,
    inputMaxLength,
} from "src/constant/filterConstants"
import { armedCraftData } from "src/constant/armedCraftData"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import { errorAlert, getCraftById, paddingZeros } from "src/utilities/utils"
import Icon from "src/utilities/Icon"
import Image from "src/utilities/Image"
import Button from "src/utilities/Button"
import Header from "src/shared/Header"
import PageContainer from "src/shared/PageContainer"
import ResultRow from "src/shared/ResultRow"
import { ResultCraftImage } from "src/shared/ResultRow/ResultImage"
import InputModal from "src/shared/InputModal"

import "./style.scss"

interface ICraftSelectorProps {}

const PAGE_SIZE = 10

const CraftSelector: React.FC<ICraftSelectorProps> = () => {
    const [selectedCrafts, setSelectedCrafts] = useState<number[]>([])
    const [resultData, setResultData] = useState<number[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [inputModalOpen, setInputModalOpen] = useState<boolean>(false)
    const [resultPanelClicked, setResultPanelClicked] = useState<boolean>(false)

    const [craftDataByName, setCraftDataByName] = useState<IObject>({})
    const [craftPureName, setCraftPureName] = useState<Set<string>>(new Set())
    const [currentPage, setCurrentPage] = useState(0)
    const [keyword, setKeyword] = useState<string>("")
    const [keywordArr, setKeywordArr] = useState<string[]>([])

    const filteredCraftPureName = useMemo(() => {
        return [...craftPureName].filter(
            (name) =>
                !keywordArr.length ||
                keywordArr.some((keyword) =>
                    name.replace(" ", "").includes(keyword)
                )
        )
    }, [craftPureName, keywordArr])

    const totalPage = useMemo(
        () => Math.ceil(filteredCraftPureName.length / PAGE_SIZE),
        [filteredCraftPureName]
    )

    const resultRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setFavIconAndTitle("craft-selector")
        initCraftData()
    }, [])

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
            const pureName = craft.name

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

            craftPureName.add(pureName)

            Object.keys(craft?.mode).forEach((mode) => {
                if (craftDataByName?.[pureName]?.[mode]) {
                    craftDataByName[pureName][mode].push(craft?.mode?.[mode])
                } else {
                    craftDataByName[pureName][mode] = [craft?.mode?.[mode]]
                }

                craftDataByName[pureName].duplicateCount = Math.max(
                    craftDataByName[pureName].duplicateCount,
                    craftDataByName[pureName][mode].length
                )
            })
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

    const movePage = useCallback(
        (offset: number) => {
            const newPage = currentPage + offset
            setCurrentPage(
                newPage >= totalPage - 1
                    ? totalPage - 1
                    : newPage < 0
                    ? 0
                    : newPage
            )
        },
        [currentPage, totalPage]
    )

    const renderHeader = useCallback(() => {
        return (
            <div className='inventory-header craft-selector-header'>
                <Row className='pagination'>
                    <Col xs={2} sm={2} md={1} className='page-btn'>
                        {currentPage > 0 && (
                            <div
                                className='inventory-pagination left'
                                onClick={() => movePage(-10)}
                            >
                                <Icon icon={faBackward} />
                            </div>
                        )}
                    </Col>
                    <Col xs={2} sm={2} md={2} className='page-btn'>
                        {currentPage > 0 && (
                            <div
                                className='inventory-pagination middle'
                                onClick={() => movePage(-1)}
                            >
                                <Icon
                                    icon={faCaretLeft}
                                    style={{ fontSize: "1.2em" }}
                                />
                            </div>
                        )}
                    </Col>
                    <Col xs={4} sm={4} md={6} className='page-count'>
                        <div>
                            <span className='current-page'>
                                {currentPage + 1}
                            </span>{" "}
                            / {totalPage}
                        </div>
                    </Col>
                    <Col xs={2} sm={2} md={2} className='page-btn'>
                        {currentPage < totalPage - 1 && (
                            <div
                                className='inventory-pagination middle'
                                onClick={() => movePage(1)}
                            >
                                <Icon
                                    icon={faCaretRight}
                                    style={{ fontSize: "1.2em" }}
                                />
                            </div>
                        )}
                    </Col>
                    <Col xs={2} sm={2} md={1} className='page-btn'>
                        {currentPage < totalPage - 1 && (
                            <div
                                className='inventory-pagination right'
                                onClick={() => movePage(10)}
                            >
                                <Icon icon={faForward} />
                            </div>
                        )}
                    </Col>
                </Row>
            </div>
        )
    }, [currentPage, movePage, totalPage])

    const onFilterKeyword = useCallback(() => {
        setKeywordArr(keyword.trim().replace(" ", "").split(","))
        setCurrentPage(0)
    }, [keyword])

    const onInputKeyPress = useCallback((event: any) => {
        if (event?.key === "Enter") {
            // prevent pressing enter cause reload of page
            event.preventDefault()
        }
    }, [])

    const changeKeyword = useCallback((value: string) => {
        setKeyword(value)
    }, [])

    const renderKeyword = useCallback(() => {
        return (
            <Row className='keyword-input-row'>
                <Col xs={9} md={10} className='keyword-input-col'>
                    <Form>
                        <Form.Group>
                            <Form.Control
                                type='input'
                                className='keyword-input'
                                placeholder='輸入龍刻名稱'
                                value={keyword}
                                maxLength={inputMaxLength}
                                onChange={(e) => changeKeyword(e.target.value)}
                                onKeyDown={onInputKeyPress}
                            />
                        </Form.Group>
                    </Form>
                </Col>
                <Col xs={3} md={2}>
                    <Button
                        className='top-btn start-btn'
                        text={"搜尋"}
                        onClick={onFilterKeyword}
                    />
                </Col>
            </Row>
        )
    }, [changeKeyword, keyword, onFilterKeyword, onInputKeyPress])

    const renderTable = useCallback(() => {
        return (
            <>
                {renderKeyword()}
                <div className='craft-select-table-wrapper'>
                    <Table bordered className='craft-select-table'>
                        <thead>
                            <tr>
                                {craftModeTypeString.map((type) => {
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
                            {!filteredCraftPureName.length ? (
                                <tr className='craft-info-tr no-result-tr'>
                                    <td colSpan={craftModeTypeString.length}>
                                        <div className='no-result'>
                                            <h1>查無結果</h1>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCraftPureName
                                    .slice(
                                        currentPage * 10,
                                        (currentPage + 1) * 10
                                    )
                                    .map((name: string) => {
                                        const allCrafts = craftModeTypeString
                                            .map((mode) => {
                                                return (
                                                    craftDataByName[name]?.[
                                                        mode.slice(-2)
                                                    ] || []
                                                )
                                            })
                                            .flat()
                                        return (
                                            <>
                                                <tr
                                                    className='craft-info-tr'
                                                    onClick={() =>
                                                        onSelectCrafts(
                                                            allCrafts
                                                        )
                                                    }
                                                >
                                                    <td
                                                        className='craft-name'
                                                        colSpan={4}
                                                    >
                                                        {name}
                                                    </td>
                                                    <td
                                                        className='craft-objective'
                                                        colSpan={
                                                            craftModeTypeString.length -
                                                            4
                                                        }
                                                    >
                                                        {craftDataByName[name]
                                                            ?.series ? (
                                                            <>
                                                                {craftDataByName[
                                                                    name
                                                                ]?.series.map(
                                                                    (
                                                                        serie: string
                                                                    ) => (
                                                                        <Image
                                                                            width={
                                                                                30
                                                                            }
                                                                            path={`series/${serie}`}
                                                                        />
                                                                    )
                                                                )}{" "}
                                                                {craftDataByName[
                                                                    name
                                                                ]?.series
                                                                    .map(
                                                                        (
                                                                            serie: string
                                                                        ) =>
                                                                            `【${serie}】`
                                                                    )
                                                                    .join("、")}
                                                                特性
                                                            </>
                                                        ) : craftDataByName[
                                                              name
                                                          ]?.monster ? (
                                                            craftDataByName[
                                                                name
                                                            ]?.monster?.map(
                                                                (
                                                                    monster: number
                                                                ) => {
                                                                    return (
                                                                        <Image
                                                                            width={
                                                                                50
                                                                            }
                                                                            path={`monster/${monster}`}
                                                                        />
                                                                    )
                                                                }
                                                            )
                                                        ) : craftDataByName[
                                                              name
                                                          ]?.attribute ||
                                                          craftDataByName[name]
                                                              ?.race ? (
                                                            <>
                                                                {craftDataByName[
                                                                    name
                                                                ]?.attribute &&
                                                                craftDataByName[
                                                                    name
                                                                ]?.attribute !==
                                                                    "沒有限制" ? (
                                                                    <Image
                                                                        width={
                                                                            30
                                                                        }
                                                                        path={`icon/icon_${
                                                                            attrZhToEn[
                                                                                craftDataByName[
                                                                                    name
                                                                                ]
                                                                                    ?.attribute
                                                                            ]
                                                                        }`}
                                                                    />
                                                                ) : (
                                                                    <></>
                                                                )}
                                                                {craftDataByName[
                                                                    name
                                                                ]?.race &&
                                                                craftDataByName[
                                                                    name
                                                                ]?.race !==
                                                                    "沒有限制" ? (
                                                                    <Image
                                                                        width={
                                                                            30
                                                                        }
                                                                        path={`icon/icon_${
                                                                            raceZhToEn[
                                                                                craftDataByName[
                                                                                    name
                                                                                ]
                                                                                    ?.race
                                                                            ]
                                                                        }`}
                                                                    />
                                                                ) : (
                                                                    <></>
                                                                )}{" "}
                                                                {craftDataByName[
                                                                    name
                                                                ]?.attribute &&
                                                                craftDataByName[
                                                                    name
                                                                ]?.attribute !==
                                                                    "沒有限制"
                                                                    ? `${craftDataByName[name]?.attribute}屬性`
                                                                    : ""}
                                                                {craftDataByName[
                                                                    name
                                                                ]?.race &&
                                                                craftDataByName[
                                                                    name
                                                                ]?.race !==
                                                                    "沒有限制"
                                                                    ? craftDataByName[
                                                                          name
                                                                      ]?.race
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
                                                                        ]?.[
                                                                            mode.slice(
                                                                                -2
                                                                            )
                                                                        ]?.[
                                                                            index
                                                                        ]

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
                                                                                    [
                                                                                        id,
                                                                                    ]
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
                                    })
                            )}
                        </tbody>
                        <thead>
                            <tr>
                                {craftModeTypeString.map((type) => {
                                    return (
                                        <td className='craft-header-type'>
                                            <div className='craft-header-type-text'>
                                                {type.slice(-2)}
                                            </div>
                                            <Image
                                                width={50}
                                                path={`craft/${type}`}
                                                noTitle
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                        </thead>
                    </Table>
                </div>
            </>
        )
    }, [
        craftDataByName,
        currentPage,
        filteredCraftPureName,
        onSelectCrafts,
        renderKeyword,
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
                <div className='craft-selector'>
                    {renderHeader()}
                    {renderTable()}
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
                </div>
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
