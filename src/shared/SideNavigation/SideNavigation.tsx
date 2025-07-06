import React from "react"
import { Link } from "react-router-dom"
import { Offcanvas } from "react-bootstrap"
import { faClose } from "@fortawesome/free-solid-svg-icons"

import { toolConfig } from "src/constant/toolConfig"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"

import "./style.scss"

export interface ISideNavigationProps {
    isOpen: boolean
    onClose: () => void
}

const SideNavigation: React.FC<ISideNavigationProps> = (props) => {
    const { isOpen, onClose } = props
    return (
        <Offcanvas show={isOpen} onHide={onClose} className='side-navigation'>
            <div className='side-navigation-header'>
                <Icon icon={faClose} onClick={onClose} />
                工具列表
            </div>
            <div className='side-navigation-items'>
                {Object.values(toolConfig).map((config) => {
                    return (
                        <Link
                            className='side-navigation-item'
                            to={`/${config.toolPath}`}
                            target='_blank'
                        >
                            <Image
                                className='side-navigation-item-icon'
                                path={`favicon/${config.icon}`}
                            />
                            {config.title.substring(4, config.title.length)}
                        </Link>
                    )
                })}
            </div>
        </Offcanvas>
    )
}

export default SideNavigation
