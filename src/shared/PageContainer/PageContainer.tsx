import React, { useState, useEffect, useContext, useCallback } from "react"
import { Container } from "react-bootstrap"
import { faDollarSign } from "@fortawesome/free-solid-svg-icons"

import Context from "src/utilities/Context/Context"
import Setting from "../Setting"
import Icon from "src/utilities/Icon"

import "./style.scss"

export interface IPageContainerProps {
    children: React.ReactElement
    openDurationModal?: () => void
    openUserDataModal?: () => void
    openObjectiveModal?: () => void
    openInputModal?: () => void
    backpackViewerPage?: string
}

const PageContainer: React.FC<IPageContainerProps> = (props) => {
    const {
        children,
        openDurationModal,
        openUserDataModal,
        openObjectiveModal,
        openInputModal,
        backpackViewerPage = "",
    } = props
    const { toolId } = useContext(Context)

    useEffect(() => {
        const headerElement =
            document.getElementsByClassName("tool-header")?.[0]
        setHeaderHeight(headerElement?.clientHeight)
    }, [])

    useEffect(() => {
        window.addEventListener("resize", onResize)
        return () => {
            window.removeEventListener("resize", onResize)
        }
    }, [])

    const onResize = useCallback(() => {
        const headerElement =
            document.getElementsByClassName("tool-header")?.[0]
        setHeaderHeight(headerElement?.clientHeight + 1)
    }, [])

    const [headerHeight, setHeaderHeight] = useState<number>(0)

    const renderFooter = useCallback(() => {
        const currYear = new Date().getFullYear()
        const startYear =
            toolId === "skill-filter" || toolId === "craft-filter"
                ? "2019"
                : toolId === "team-skill-filter"
                ? "2020"
                : toolId === "backpack-viewer" || toolId === "craft-selector"
                ? "2021"
                : toolId === "monster-selector" ||
                  toolId === "leader-skill-filter"
                ? "2022"
                : ""

        return (
            <div className='author-info'>
                <div>{`Copyright © ${startYear}-${currYear} 蒼曜(tinghan33704)`}</div>
                <a
                    className='donate'
                    target='_blank'
                    rel='noreferrer'
                    href='https://portaly.cc/tinghan33704/support'
                >
                    <Icon icon={faDollarSign} style={{ marginRight: "5px" }} />
                    贊助連結
                </a>
                {/* <div className='author-link'>
                    <a
                        target='_blank'
                        href='https://www.facebook.com/profile.php?id=100070781094266'
                        rel='noreferrer'
                    >
                        <Image path='other/fb_icon' />
                    </a>
                    <a
                        target='_blank'
                        href='https://home.gamer.com.tw/profile/index.php?&owner=tinghan33704'
                        rel='noreferrer'
                    >
                        <Image path='other/bahamut_icon' />
                    </a>
                    <a
                        target='_blank'
                        href='https://github.com/tinghan33704'
                        rel='noreferrer'
                    >
                        <Image path='other/github_icon' />
                    </a>
                </div> */}
            </div>
        )
    }, [toolId])

    return (
        <Container
            className='page-container'
            style={{ paddingTop: `${headerHeight}px` }}
        >
            {children}
            <Setting
                openDurationModal={openDurationModal}
                openUserDataModal={openUserDataModal}
                openObjectiveModal={openObjectiveModal}
                openInputModal={openInputModal}
                backpackViewerPage={backpackViewerPage}
            />
            {renderFooter()}
        </Container>
    )
}

export default PageContainer
