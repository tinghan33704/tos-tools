import React, { useContext, useCallback, useMemo } from "react"
import { Row, Col } from "react-bootstrap"
import { faPlayCircle, faUndo } from "@fortawesome/free-solid-svg-icons"

import Context from "src/utilities/Context/Context"
import Button from "src/utilities/Button"

import "./style.scss"

export interface ITopButtonGroupProps {
    buttonData: string[]
    resetAll?: () => void
    sortBy?: string
    changeSortBy?: (value: string) => void
    andOr?: string
    changeAndOr?: (value: string) => void
    startFilter?: () => void
}

const TopButtonGroup: React.FC<ITopButtonGroupProps> = (props) => {
    const {
        buttonData,
        resetAll,
        sortBy = "",
        changeSortBy: _changeSortBy,
        andOr = "",
        changeAndOr: _changeAndOr,
        startFilter,
    } = props
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

    const changeSortBy = useCallback(() => {
        const sortByKeys = Object.keys(sortByMapping)
        const index = sortByKeys.findIndex((item) => item === sortBy)
        _changeSortBy?.(sortByKeys[(index + 1) % sortByKeys.length])
    }, [_changeSortBy, sortBy, sortByMapping])

    const changeAndOr = useCallback(() => {
        const andOrKeys = Object.keys(andOrMapping)
        const index = andOrKeys.findIndex((item) => item === andOr)
        _changeAndOr?.(andOrKeys[(index + 1) % andOrKeys.length])
    }, [_changeAndOr, andOr, andOrMapping])

    return (
        <Row className='top-button-group'>
            {buttonData.map((type: string) => {
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
                                text={sortByMapping[sortBy]}
                                onClick={changeSortBy}
                            />
                        ) : type === "and-or" ? (
                            <Button
                                className={`top-btn and-or-btn ${andOr}-btn`}
                                text={andOrMapping[andOr]}
                                onClick={changeAndOr}
                            />
                        ) : type === "start-filter" ? (
                            <Button
                                className='top-btn start-btn'
                                icon={faPlayCircle}
                                text={"搜尋"}
                                onClick={startFilter}
                            />
                        ) : type === "start-generate" ? (
                            <Button
                                className='top-btn start-btn'
                                icon={faPlayCircle}
                                text={"生成編號"}
                                onClick={startFilter}
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

export default React.memo(TopButtonGroup)
