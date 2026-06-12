import React, { useContext, useMemo } from "react"
import { Col, Row } from "react-bootstrap"
import LazyLoad from "react-lazyload"
import _ from "lodash"

import Context from "src/utilities/Context/Context"
import DataContext from "src/utilities/Context/DataContext"
import { ResultMonsterImage, ResultCraftImage } from "../ResultImage"

import "./style.scss"

export interface IResultImageGroupProps {
    resultData: IObject[]
    noImagePopover: boolean
    togglePopover: (e: React.MouseEvent) => void
    setPopoverContent: (content: React.ReactElement) => void
    searchParam: IObject
    useInventory?: boolean
}

const CHUNK_SIZE = 48

const ResultImageGroup: React.FC<IResultImageGroupProps> = (props) => {
    const {
        resultData,
        noImagePopover,
        togglePopover,
        setPopoverContent,
        searchParam,
        useInventory = false,
    } = props
    const { toolId } = useContext(Context)
    const { playerData } = useContext(DataContext)

    const resultChunk = useMemo(
        () => _.chunk(resultData, CHUNK_SIZE),
        [resultData],
    )

    return (
        <>
            {resultChunk.map((chunk, chunkIndex) => {
                return (
                    <LazyLoad
                        key={`chunk_${chunkIndex}`}
                        once
                        offset={500}
                        placeholder={
                            <span
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#666666",
                                }}
                            >
                                載入中...
                            </span>
                        }
                    >
                        <Row>
                            {chunk.map((data) => {
                                const notInInventory =
                                    useInventory &&
                                    !playerData?.card?.includes(data?.id)
                                return (
                                    <Col
                                        xs={3}
                                        md={2}
                                        lg={1}
                                        key={`result_${data?.id}_${data?.skillIndex || data?.skillIndexes?.join("_")}`}
                                    >
                                        {toolId === "craft-filter" ? (
                                            <ResultCraftImage
                                                data={{
                                                    id: data,
                                                    notInInventory,
                                                }}
                                                noImagePopover={noImagePopover}
                                                togglePopover={togglePopover}
                                                setPopoverContent={
                                                    setPopoverContent
                                                }
                                            />
                                        ) : (
                                            <ResultMonsterImage
                                                data={{
                                                    ...data,
                                                    notInInventory,
                                                }}
                                                noImagePopover={noImagePopover}
                                                togglePopover={togglePopover}
                                                setPopoverContent={
                                                    setPopoverContent
                                                }
                                                searchParam={searchParam}
                                                resultData={resultData}
                                            />
                                        )}
                                    </Col>
                                )
                            })}
                        </Row>
                    </LazyLoad>
                )
            })}
        </>
    )
}

export default React.memo(ResultImageGroup)
