import React, { useCallback, useContext, useState } from "react"
import _ from "lodash"
import { Col, Row, Collapse } from "react-bootstrap"
import {
    faCaretDown,
    faCaretUp,
    faCircleXmark,
    faMagnifyingGlass,
    faUndo,
} from "@fortawesome/free-solid-svg-icons"
import { AutoTextSize } from "auto-text-size"

import Context from "src/utilities/Context/Context"
import Button from "src/utilities/Button"
import Icon from "src/utilities/Icon"
import { textSanitizer } from "src/utilities/utils"
import FilterButtonGroup from "./FilterButtonGroup"

import "./style.scss"

export interface IFilterRowProps {
    title: string
    type: string
    data: (string | string[])[]
    btnSuffix?: string
    collapsible?: boolean
    defaultOpen?: boolean
    hideReset?: boolean
    enableSearch?: boolean
}

const FilterRow: React.FC<IFilterRowProps> = (props) => {
    const {
        title,
        type,
        data,
        btnSuffix = "",
        collapsible,
        defaultOpen = false,
        enableSearch = false,
        hideReset,
    } = props
    const { resetButton } = useContext(Context)

    const [isCollapseOpen, setIsCollapseOpen] = useState<boolean>(defaultOpen)
    const [searchText, setSearchText] = useState<string>("")
    const [searchDisplayText, setSearchDisplayText] = useState<string>("")

    const renderFilterButtonGroupRow = useCallback(() => {
        return (
            <FilterButtonGroup
                type={type}
                groupData={data}
                btnSuffix={btnSuffix}
                useLazyLoad={collapsible}
                {...(collapsible ? { isCollapseOpen } : {})}
                {...(enableSearch ? { searchText } : {})}
            />
        )
    }, [
        btnSuffix,
        collapsible,
        data,
        enableSearch,
        isCollapseOpen,
        searchText,
        type,
    ])

    const toggleCollapse = useCallback(() => {
        setIsCollapseOpen(!isCollapseOpen)
    }, [isCollapseOpen])

    const resetAll = useCallback(() => {
        resetButton(type)
    }, [resetButton, type])

    const onSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchDisplayText(e?.target?.value)
        _.debounce(() => setSearchText(textSanitizer(e?.target?.value)), 500)()
    }, [])

    const renderSearchRow = useCallback(() => {
        return (
            <Col xs={12} className='filter-row-search'>
                <Icon icon={faMagnifyingGlass} />
                <input
                    type='text'
                    className='search-bar'
                    placeholder=''
                    value={searchDisplayText}
                    onChange={onSearch}
                />
                {!!searchDisplayText?.length && (
                    <Icon
                        className='clear-search'
                        icon={faCircleXmark}
                        style={{ fontSize: "14px", opacity: 0.6 }}
                        onClick={() => {
                            setSearchText("")
                            setSearchDisplayText("")
                        }}
                    />
                )}
            </Col>
        )
    }, [onSearch, searchDisplayText])

    return (
        <>
            <Row className='filter-row'>
                {collapsible ? (
                    <>
                        <Col
                            xs={hideReset ? 11 : 7}
                            md={hideReset ? 11 : 8}
                            className='filter-row-collapsible filter-row-title'
                            onClick={toggleCollapse}
                        >
                            <h3>
                                <AutoTextSize maxFontSizePx={26}>
                                    {title}
                                </AutoTextSize>
                            </h3>
                        </Col>
                        <Col
                            xs={1}
                            md={1}
                            className='filter-row-collapsible filter-row-trigger'
                            onClick={toggleCollapse}
                        >
                            <Icon
                                icon={isCollapseOpen ? faCaretUp : faCaretDown}
                            />
                        </Col>
                    </>
                ) : (
                    <>
                        <Col
                            xs={hideReset ? 12 : 8}
                            md={hideReset ? 12 : 9}
                            className='filter-row-title'
                        >
                            <h3>
                                <AutoTextSize maxFontSizePx={26}>
                                    {title}
                                </AutoTextSize>
                            </h3>
                        </Col>
                    </>
                )}
                {!hideReset && (
                    <>
                        <Col xs={4} md={3} className='filter-row-reset-button'>
                            <Button
                                className={"reset-btn"}
                                icon={faUndo}
                                text={`重置`}
                                onClick={resetAll}
                            />
                        </Col>
                    </>
                )}
                {!collapsible && enableSearch && renderSearchRow()}
            </Row>
            <Row className={`${type}-row filter-button-group-wrapper`}>
                {collapsible ? (
                    <Collapse in={isCollapseOpen}>
                        {/* Do not remove <div /> here, <div /> wrapped here is necessary for <Collapse /> to work */}
                        <div>
                            {enableSearch && renderSearchRow()}
                            {renderFilterButtonGroupRow()}
                        </div>
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
