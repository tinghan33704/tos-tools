import React, { useContext, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Container, Row, Col } from "react-bootstrap"
import { faBars, faQuestionCircle } from "@fortawesome/free-solid-svg-icons"

import Icon from "src/utilities/Icon"
import Image from "src/utilities/Image"
import DataContext from "src/utilities/Context/DataContext"
import TopButtonGroup from "../TopButtonGroup"
import Context from "src/utilities/Context/Context"
import SideNavigation from "../SideNavigation"
import { toolConfig } from "src/constant/toolConfig"

import "./style.scss"

export interface IHeaderProps {
    resetAll?: () => void
    sortBy?: string
    changeSortBy?: (value: string) => void
    andOr?: string
    changeAndOr?: (value: string) => void
    startFilter?: () => void
}

const NA = "---"

const Header: React.FC<IHeaderProps> = (props) => {
    const { resetAll, sortBy, changeSortBy, andOr, changeAndOr, startFilter } =
        props

    const dataContext = useContext(DataContext)
    const { playerData } = dataContext

    const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false)
    const { toolId } = useContext(Context)

    const toggleSideNavigation = useCallback(() => {
        setIsSideNavOpen(!isSideNavOpen)
    }, [isSideNavOpen])

    const renderToolTitle = useCallback(() => {
        const config = toolConfig?.[toolId]

        return (
            <div className='header-tool-title'>
                <div>
                    <Image
                        className='navbar-brand nav-icon'
                        path={`favicon/${config.icon}`}
                    />
                </div>
                <div className='navbar-brand nav-title'>{config.title}</div>
                <div>
                    <Link
                        className='navbar-brand nav-info'
                        to={config.docLink}
                        target='_blank'
                    >
                        <Icon icon={faQuestionCircle} />
                    </Link>
                </div>
            </div>
        )
    }, [toolId])

    const renderTopButtons = useCallback(() => {
        const config = toolConfig?.[toolId]

        return (
            <TopButtonGroup
                buttonData={config.topBtn}
                resetAll={resetAll}
                sortBy={sortBy}
                changeSortBy={changeSortBy}
                andOr={andOr}
                changeAndOr={changeAndOr}
                startFilter={startFilter}
            />
        )
    }, [
        andOr,
        changeAndOr,
        changeSortBy,
        resetAll,
        sortBy,
        startFilter,
        toolId,
    ])

    const renderTopInfo = useCallback(() => {
        const config = toolConfig?.[toolId]
        const topInfo = config?.topInfo || {}
        const dateString = playerData?.lastUpdated
            ? new Date(
                  new Date(playerData?.lastUpdated).valueOf() -
                      new Date().getTimezoneOffset().valueOf(),
              ).toLocaleString()
            : NA

        return (
            <Row>
                <Col xs={12} md={6} lg={8} className='last-update-banner'>
                    {topInfo?.includes("last-update") ? (
                        <>上次更新: {dateString}</>
                    ) : (
                        <></>
                    )}
                </Col>
                <Col xs={12} md={6} lg={4} className='uid-banner'>
                    {topInfo?.includes("uid") ? (
                        <>UID: {playerData?.uid || NA}</>
                    ) : (
                        <></>
                    )}
                </Col>
            </Row>
        )
    }, [playerData, toolId])

    return (
        <>
            <Container fluid className='sticky-top py-1 top-bar tool-header'>
                <Row>
                    <Col xs={12} lg={5} className='tool-top-title'>
                        <Row>
                            <Col xs={12} lg={12} className='tool-banner'>
                                <div className='side-nav'>
                                    <div
                                        className='navbar-brand toggle-navbar'
                                        onClick={toggleSideNavigation}
                                    >
                                        <Icon icon={faBars} />
                                    </div>
                                </div>
                                <div className='tool-title'>
                                    {renderToolTitle()}
                                </div>
                            </Col>
                        </Row>
                    </Col>
                    {"topBtn" in (toolConfig?.[toolId] || {}) ? (
                        <Col xs={12} lg={7} className='tool-top-button'>
                            {renderTopButtons()}
                        </Col>
                    ) : (
                        <></>
                    )}
                    {"topInfo" in (toolConfig?.[toolId] || {}) ? (
                        <Col xs={12} lg={7} className='tool-top-info'>
                            {renderTopInfo()}
                        </Col>
                    ) : (
                        <></>
                    )}
                </Row>
            </Container>

            <SideNavigation
                isOpen={isSideNavOpen}
                onClose={() => setIsSideNavOpen(false)}
            />
        </>
    )
}

export default Header
