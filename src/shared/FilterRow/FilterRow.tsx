import React, { useCallback, useContext, useState } from "react"
import { Col, Row, Collapse } from "react-bootstrap"
import {
    faCaretDown,
    faCaretUp,
    faUndo,
} from "@fortawesome/free-solid-svg-icons"

import Context from "src/utilities/Context/Context"
import Button from "src/utilities/Button"
import Icon from "src/utilities/Icon"
import FilterButtonGroup from "./FilterButtonGroup"

import "./style.scss"

export interface IFilterRowProps {
    title: string
    type: string
    data: any
    btnSuffix?: string
    collapsible?: boolean
    defaultOpen?: boolean
    hideReset?: boolean
}

const FilterRow: React.FC<IFilterRowProps> = (props) => {
    const {
        title,
        type,
        data,
        btnSuffix = "",
        collapsible,
        defaultOpen = false,
        hideReset,
    } = props
    const { resetButton } = useContext(Context)

    const [isCollapseOpen, setIsCollapseOpen] = useState<boolean>(defaultOpen)

    const renderFilterButtonGroupRow = useCallback(() => {
        return (
            // Do not remove <div /> here, <div /> wrapped here is necessary for <Collapse /> to work
            <div>
                <FilterButtonGroup
                    type={type}
                    groupData={data}
                    btnSuffix={btnSuffix}
                />
            </div>
        )
    }, [btnSuffix, data, type])

    const toggleCollapse = useCallback(() => {
        setIsCollapseOpen(!isCollapseOpen)
    }, [isCollapseOpen])

    const resetAll = useCallback(() => {
        resetButton(type)
    }, [resetButton, type])

    return (
        <>
            <Row className='filter-row'>
                {collapsible ? (
                    <>
                        <Col
                            xs={11}
                            className='filter-row-collapsible filter-row-title'
                            onClick={toggleCollapse}
                        >
                            <h3>{title}</h3>
                        </Col>
                        <Col
                            xs={1}
                            className='filter-row-collapsible filter-row-trigger'
                            onClick={toggleCollapse}
                        >
                            <Icon
                                icon={isCollapseOpen ? faCaretUp : faCaretDown}
                            />
                        </Col>
                    </>
                ) : (
                    <Col xs={12} className='filter-row-title'>
                        <h3>{title}</h3>
                    </Col>
                )}
                {!hideReset && (
                    <>
                        <Col xs={12} className='filter-row-reset-button'>
                            <Button
                                className={"reset-btn"}
                                icon={faUndo}
                                text={`重置${title}`}
                                onClick={resetAll}
                            />
                        </Col>
                        <Col xs={12} className='my-2' />
                    </>
                )}
            </Row>
            <Row className={`${type}-row filter-button-group-wrapper`}>
                {collapsible ? (
                    <Collapse in={isCollapseOpen}>
                        {renderFilterButtonGroupRow()}
                    </Collapse>
                ) : (
                    renderFilterButtonGroupRow()
                )}
                <Col xs={12} className={"bottom-col"} />
            </Row>
        </>
    )
}

export default FilterRow
