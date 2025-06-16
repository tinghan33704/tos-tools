import React, { useContext, useCallback, useMemo } from "react"
import { Row, Col } from "react-bootstrap"
import { faPlayCircle, faUndo } from "@fortawesome/free-solid-svg-icons"

import Context from "src/utilities/Context/Context"
import Button from "src/utilities/Button"

import "./style.scss"

export interface ITopButtonGroupProps {
    buttonData: any
}

const TopButtonGroup: React.FC<ITopButtonGroupProps> = (props) => {
    const { buttonData } = props
    const context = useContext(Context)

    const sortByMapping: Record<string, string> = useMemo(() => {
        return {
            id: "依編號排序",
            charge: "依 CD/EP 排序",
            attribute: "依屬性排序",
            race: "依種族排序",
            function: "依功能排序",
        }
    }, [])

    const andOrMapping: Record<string, string> = useMemo(() => {
        return {
            or: "OR 搜尋",
            and: "AND 搜尋",
            ...(context.toolId === "skill-filter" && { "m-and": "M-AND 搜尋" }),
        }
    }, [context])

    const resetAll = useCallback(() => {
        context.resetAll()
    }, [context])

    const changeSortBy = useCallback(() => {
        const sortByKeys = Object.keys(sortByMapping)
        const index = sortByKeys.findIndex((item) => item === context.sortBy)
        context.changeSortBy(sortByKeys[(index + 1) % sortByKeys.length])
    }, [context, sortByMapping])

    const changeAndOr = useCallback(() => {
        const andOrKeys = Object.keys(andOrMapping)
        const index = andOrKeys.findIndex((item) => item === context.andOr)
        context.changeAndOr(andOrKeys[(index + 1) % andOrKeys.length])
    }, [andOrMapping, context])

    return (
        <Row className='top-button-group'>
            {buttonData.map((type: Object) => {
                return (
                    <Col xs={6} sm={3} className='top-btn-shell'>
                        {type === "reset-all" ? (
                            <Button
                                className='top-btn reset-btn'
                                icon={faUndo}
                                text={"全部重置"}
                                onClick={resetAll}
                            />
                        ) : type === "sort" ? (
                            <Button
                                className='top-btn sort-btn'
                                text={sortByMapping[context.sortBy]}
                                onClick={changeSortBy}
                            />
                        ) : type === "and-or" ? (
                            <Button
                                className={`top-btn and-or-btn ${context.andOr}-btn`}
                                text={andOrMapping[context.andOr]}
                                onClick={changeAndOr}
                            />
                        ) : type === "start-filter" ? (
                            <Button
                                className='top-btn start-btn'
                                icon={faPlayCircle}
                                text={"搜尋"}
                                onClick={context.startFilter}
                            />
                        ) : type === "start-generate" ? (
                            <Button
                                className='top-btn start-btn'
                                icon={faPlayCircle}
                                text={"生成編號"}
                                onClick={context.startFilter}
                            />
                        ) : (
                            <></>
                        )}
                    </Col>
                )
            })}
        </Row>
    )
}

export default TopButtonGroup
