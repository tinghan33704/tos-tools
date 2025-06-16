import React, { useEffect, useRef, useState } from "react"
import {
    faChevronDown,
    faChevronUp,
    faGear,
} from "@fortawesome/free-solid-svg-icons"

import Icon from "src/utilities/Icon"
import SettingPanel from "./SettingPanel"

import "./style.scss"

export interface ISettingProps {
    openDurationModal?: () => void
    openUserDataModal?: () => void
    openObjectiveModal?: () => void
    openInputModal?: () => void
    backpackViewerPage?: string
}

const Setting: React.FC<ISettingProps> = (props) => {
    const {
        openDurationModal,
        openUserDataModal,
        openObjectiveModal,
        openInputModal,
        backpackViewerPage,
    } = props

    const settingRef = useRef(null)

    const [showSettingBtn, setShowSettingBtn] = useState<boolean>(false)
    const [showTopBtn, setShowTopBtn] = useState<boolean>(false)
    const [showBottomBtn, setShowBottomBtn] = useState<boolean>(false)

    useEffect(() => {
        const offset = 300

        setShowTopBtn(window.scrollY > offset)
        setShowBottomBtn(
            window.scrollY <
                document.documentElement.offsetHeight -
                    window.innerHeight -
                    offset
        )

        window.addEventListener("scroll", () => {
            setShowTopBtn(window.scrollY > offset)
            setShowBottomBtn(
                window.scrollY <
                    document.documentElement.offsetHeight -
                        window.innerHeight -
                        offset
            )
        })
    }, [])

    const goToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    const goToBottom = () => {
        window.scrollTo({
            top: document.documentElement.offsetHeight - window.innerHeight,
            behavior: "smooth",
        })
    }

    return (
        <>
            <div
                className='floating-btn setting'
                onClick={() => setShowSettingBtn(!showSettingBtn)}
                ref={settingRef}
            >
                <Icon icon={faGear} />
            </div>

            <div
                className={`floating-btn to-top${showTopBtn ? "" : " hide"}`}
                onClick={goToTop}
            >
                <Icon icon={faChevronUp} />
            </div>
            <div
                className={`floating-btn to-bottom${
                    showBottomBtn ? "" : " hide"
                }`}
                onClick={goToBottom}
            >
                <Icon icon={faChevronDown} />
            </div>
            <SettingPanel
                panelOpen={showSettingBtn}
                onClosePanel={() => setShowSettingBtn(false)}
                openDurationModal={openDurationModal}
                openUserDataModal={openUserDataModal}
                openObjectiveModal={openObjectiveModal}
                openInputModal={openInputModal}
                iconRef={settingRef}
                backpackViewerPage={backpackViewerPage}
            />
        </>
    )
}

export default Setting
