import React, { useContext } from "react"
import { Col, Row } from "react-bootstrap"

import Context from "src/utilities/Context/Context"
import DataContext from "src/utilities/Context/DataContext"
import { ResultMonsterImage, ResultCraftImage } from "../ResultImage"

import "./style.scss"

export interface IResultImageGroupProps {
    resultData: IObject[]
    noImagePopover: boolean
    togglePopover: (e: React.MouseEvent) => void
    setPopoverContent: (content: React.ReactElement) => void
}

const ResultImageGroup: React.FC<IResultImageGroupProps> = (props) => {
    const { resultData, noImagePopover, togglePopover, setPopoverContent } =
        props
    const { useInventory = false, toolId } = useContext(Context)
    const { playerData } = useContext(DataContext)

    return (
        <>
            <Row>
                {resultData.map((data) => {
                    const notInInventory =
                        useInventory && !playerData?.card?.includes(data?.id)
                    return (
                        <Col xs={3} md={2} lg={1}>
                            {toolId === "craft-filter" ? (
                                <ResultCraftImage
                                    data={{ id: data, notInInventory }}
                                    noImagePopover={noImagePopover}
                                    togglePopover={togglePopover}
                                    setPopoverContent={setPopoverContent}
                                />
                            ) : (
                                <ResultMonsterImage
                                    data={{ ...data, notInInventory }}
                                    noImagePopover={noImagePopover}
                                    togglePopover={togglePopover}
                                    setPopoverContent={setPopoverContent}
                                />
                            )}
                        </Col>
                    )
                })}
            </Row>
        </>
    )
}

export default ResultImageGroup
