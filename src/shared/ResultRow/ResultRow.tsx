import React, { useCallback, useContext, useMemo } from "react"
import { Col, Row } from "react-bootstrap"

import {
    attr_type_string,
    attr_zh_to_en,
    race_type_string,
    race_zh_to_en,
    skill_function_string,
} from "src/constant/filterConstants"
import { getMonsterById } from "src/utilities/utils"
import Context from "src/utilities/Context/Context"
import Image from "src/utilities/Image"
import ResultTag from "./ResultTag"
import ResultImageGroup from "./ResultImageGroup"
import ResultTable from "./ResultTable"

import "./style.scss"
import DataContext from "src/utilities/Context/DataContext"

export interface IResultRowProps {
    resultData?: IObject[]
    resultDataByCharge?: IObject[]
    resultDataCombine?: IObject[]
    searchParam?: IObject
    noImagePopover?: boolean
    title?: string
    children?: React.ReactNode
    togglePopover?: (e: React.MouseEvent) => void
    setPopoverContent?: (content: React.ReactElement) => void
}

const ResultRow: React.FC<IResultRowProps> = (props) => {
    const {
        resultData = [],
        searchParam = {},
        resultDataByCharge = [],
        resultDataCombine = [],
        noImagePopover = false,
        title = "",
        children,
        togglePopover = () => {},
        setPopoverContent = () => {},
    } = props
    const {
        sortBy,
        showNoData,
        useInventory,
        resultView = "summary",
    } = useContext(Context)
    const { playerData } = useContext(DataContext)

    const resultDataByAttribute: Record<string, []> = useMemo(
        () =>
            attr_type_string.reduce((acc, cur) => {
                return {
                    ...acc,
                    [cur]: resultData.filter(
                        (data) => getMonsterById(data?.id)?.attribute === cur
                    ),
                }
            }, {}),
        [resultData]
    )

    const resultDataCombineByAttribute: Record<string, []> = useMemo(
        () =>
            attr_type_string.reduce((acc, cur) => {
                return {
                    ...acc,
                    [cur]: resultDataCombine.filter(
                        (data) => getMonsterById(data?.id)?.attribute === cur
                    ),
                }
            }, {}),
        [resultDataCombine]
    )

    const resultDataByRace: Record<string, []> = useMemo(
        () =>
            race_type_string.reduce((acc, cur) => {
                return {
                    ...acc,
                    [cur]: resultData.filter(
                        (data) => getMonsterById(data?.id)?.race === cur
                    ),
                }
            }, {}),
        [resultData]
    )

    const resultDataCombineByRace: Record<string, []> = useMemo(
        () =>
            race_type_string.reduce((acc, cur) => {
                return {
                    ...acc,
                    [cur]: resultDataCombine.filter(
                        (data) => getMonsterById(data?.id)?.race === cur
                    ),
                }
            }, {}),
        [resultDataCombine]
    )

    const renderNoResult = useCallback(() => {
        return (
            <>
                <Col xs={12} className='no-result'>
                    <h1>查無結果</h1>
                </Col>
                <Col xs={12} className='my-2' />
            </>
        )
    }, [])

    const renderResultByAttribute = useCallback(() => {
        return attr_type_string.map((attr: string) => {
            const data = resultDataByAttribute[attr]
            const dataCombine = resultDataCombineByAttribute[attr]

            return data.length + dataCombine.length <= 0 && !showNoData ? (
                <></>
            ) : (
                <>
                    <Col
                        xs={12}
                        className={`sort-by-title ${attr_zh_to_en[attr]}`}
                    >
                        <Image path={`icon/icon_${attr_zh_to_en[attr]}`} />
                        {attr}
                    </Col>
                    {data.length + dataCombine.length > 0 ? (
                        <>
                            <ResultImageGroup
                                resultData={data}
                                noImagePopover={noImagePopover}
                                togglePopover={togglePopover}
                                setPopoverContent={setPopoverContent}
                            />
                            {data.length && dataCombine.length ? <hr /> : <></>}
                            {dataCombine.length ? (
                                <ResultImageGroup
                                    resultData={dataCombine}
                                    noImagePopover={noImagePopover}
                                    togglePopover={togglePopover}
                                    setPopoverContent={setPopoverContent}
                                />
                            ) : (
                                <></>
                            )}
                            <Col xs={12} className='my-2' />
                        </>
                    ) : (
                        renderNoResult()
                    )}
                </>
            )
        })
    }, [
        noImagePopover,
        renderNoResult,
        resultDataByAttribute,
        resultDataCombineByAttribute,
        setPopoverContent,
        showNoData,
        togglePopover,
    ])

    const renderResultByRace = useCallback(() => {
        return race_type_string.map((race: string) => {
            const data = resultDataByRace[race]
            const dataCombine = resultDataCombineByRace[race]

            return data.length + dataCombine.length <= 0 && !showNoData ? (
                <></>
            ) : (
                <>
                    <Col xs={12} className='sort-by-title'>
                        <Image path={`icon/icon_${race_zh_to_en[race]}`} />
                        {race}
                    </Col>
                    {data.length + dataCombine.length > 0 ? (
                        <>
                            <ResultImageGroup
                                resultData={data}
                                noImagePopover={noImagePopover}
                                togglePopover={togglePopover}
                                setPopoverContent={setPopoverContent}
                            />
                            {data.length && dataCombine.length ? <hr /> : <></>}
                            {dataCombine.length ? (
                                <ResultImageGroup
                                    resultData={dataCombine}
                                    noImagePopover={noImagePopover}
                                    togglePopover={togglePopover}
                                    setPopoverContent={setPopoverContent}
                                />
                            ) : (
                                <></>
                            )}
                            <Col xs={12} className='my-2' />
                        </>
                    ) : (
                        renderNoResult()
                    )}
                </>
            )
        })
    }, [
        noImagePopover,
        renderNoResult,
        resultDataByRace,
        resultDataCombineByRace,
        setPopoverContent,
        showNoData,
        togglePopover,
    ])

    const renderResultByCharge = useCallback(() => {
        const _resultDataByCharge = resultDataByCharge
            .sort((a, b) => {
                return a.charge - b.charge
            })
            .reduce((acc, cur) => {
                const charge = cur.charge > 0 ? cur.charge.toString() : "0"
                if (!(charge in acc)) {
                    return {
                        ...acc,
                        [charge]: [cur],
                    }
                } else {
                    return {
                        ...acc,
                        [charge]: [...acc[charge], cur],
                    }
                }
            }, {})

        if (resultDataByCharge.length) {
            return Object.keys(_resultDataByCharge).map((charge: string) => {
                const data = _resultDataByCharge[charge]
                return (
                    <>
                        {+charge > 0 ? (
                            <Col
                                xs={12}
                                className='sort-by-title sort-by-title-charge'
                            >
                                {charge}
                            </Col>
                        ) : (
                            <></>
                        )}
                        <ResultImageGroup
                            resultData={data}
                            noImagePopover={noImagePopover}
                            togglePopover={togglePopover}
                            setPopoverContent={setPopoverContent}
                        />
                    </>
                )
            })
        } else {
            return renderNoResult()
        }
    }, [
        noImagePopover,
        renderNoResult,
        resultDataByCharge,
        setPopoverContent,
        togglePopover,
    ])

    const renderResultByFunction = useCallback(() => {
        return skill_function_string.flat().map((func) => {
            const skillWithFunction = resultData
                .map((data) => {
                    const withFunctionIndexes = data.skillIndexes.filter(
                        (index: number) => {
                            const skillTag = getMonsterById(data?.id)?.skill?.[
                                index
                            ]?.tag?.map((item: any) => {
                                return Array.isArray(item) ? item[0] : item
                            })
                            return skillTag.includes(func)
                        }
                    )
                    return {
                        ...data,
                        skillIndexes: withFunctionIndexes,
                    }
                })
                .filter((skill) => skill.skillIndexes.length)

            const skillWithFunctionCombine = resultDataCombine
                .map((data) => {
                    const withFunctionIndexes = data.skillIndexes.filter(
                        (index: number) => {
                            const skillTag = getMonsterById(data?.id)?.skill?.[
                                index
                            ]?.tag?.map((item: any) => {
                                return Array.isArray(item) ? item[0] : item
                            })
                            return skillTag.includes(func)
                        }
                    )
                    return {
                        ...data,
                        skillIndexes: withFunctionIndexes,
                    }
                })
                .filter((skill) => skill.skillIndexes.length)

            return skillWithFunction.length + skillWithFunctionCombine.length <=
                0 && !showNoData ? (
                <></>
            ) : (
                <>
                    <Col xs={12} className='sort-by-title'>
                        {func}
                    </Col>
                    {skillWithFunction.length +
                    skillWithFunctionCombine.length ? (
                        <>
                            <ResultImageGroup
                                resultData={skillWithFunction}
                                noImagePopover={noImagePopover}
                                togglePopover={togglePopover}
                                setPopoverContent={setPopoverContent}
                            />
                            {skillWithFunction.length &&
                            skillWithFunctionCombine.length ? (
                                <hr />
                            ) : (
                                <></>
                            )}
                            {skillWithFunctionCombine.length ? (
                                <ResultImageGroup
                                    resultData={skillWithFunctionCombine}
                                    noImagePopover={noImagePopover}
                                    togglePopover={togglePopover}
                                    setPopoverContent={setPopoverContent}
                                />
                            ) : (
                                <></>
                            )}
                            <Col xs={12} className='my-2' />
                        </>
                    ) : (
                        renderNoResult()
                    )}
                </>
            )
        })
    }, [
        noImagePopover,
        renderNoResult,
        resultData,
        resultDataCombine,
        setPopoverContent,
        showNoData,
        togglePopover,
    ])

    const renderResult = useCallback(() => {
        return resultData.length + resultDataCombine.length > 0 ? (
            <>
                <ResultImageGroup
                    resultData={resultData}
                    noImagePopover={noImagePopover}
                    togglePopover={togglePopover}
                    setPopoverContent={setPopoverContent}
                />
                {resultData.length > 0 && resultDataCombine.length > 0 ? (
                    <hr />
                ) : (
                    <></>
                )}
                {resultDataCombine.length ? (
                    <ResultImageGroup
                        resultData={resultDataCombine}
                        noImagePopover={noImagePopover}
                        togglePopover={togglePopover}
                        setPopoverContent={setPopoverContent}
                    />
                ) : (
                    <></>
                )}
            </>
        ) : (
            renderNoResult()
        )
    }, [
        noImagePopover,
        renderNoResult,
        resultData,
        resultDataCombine,
        setPopoverContent,
        togglePopover,
    ])

    const renderTableResult = useCallback(() => {
        return resultData.length > 0 ? (
            <ResultTable
                resultData={resultData}
                noImagePopover={noImagePopover}
            />
        ) : (
            renderNoResult()
        )
    }, [noImagePopover, renderNoResult, resultData])

    const renderUidTag = useCallback(() => {
        const uid = playerData?.uid || "---"
        return useInventory ? (
            <Col xs={6} className='uid-tag'>
                UID: {uid}
            </Col>
        ) : (
            <Col xs={6} />
        )
    }, [playerData, useInventory])

    return (
        <>
            <Row className='result-row'>
                <Col xs={6} className='result-row-title'>
                    <h3>{title || "搜尋結果"}</h3>
                </Col>
                {renderUidTag()}
            </Row>
            <Row className='result-wrapper'>
                {children || (
                    <>
                        {searchParam && <ResultTag searchParam={searchParam} />}
                        <Col xs={12} className='my-2' />
                        {resultView === "table"
                            ? renderTableResult()
                            : sortBy === "id"
                            ? renderResult()
                            : sortBy === "charge"
                            ? renderResultByCharge()
                            : sortBy === "attribute"
                            ? renderResultByAttribute()
                            : sortBy === "race"
                            ? renderResultByRace()
                            : sortBy === "function"
                            ? renderResultByFunction()
                            : renderResult()}
                    </>
                )}

                <Col xs={12} className='my-2' />
            </Row>
        </>
    )
}

export default ResultRow
