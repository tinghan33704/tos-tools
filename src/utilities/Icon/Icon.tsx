import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export interface IIconProps {
    icon: any
    onClick?: (event: React.MouseEvent) => void
    style?: Object
}

const Icon: React.FC<IIconProps> = (props) => {
    const { icon, onClick, style } = props

    return <FontAwesomeIcon icon={icon} onClick={onClick} style={style} />
}

export default Icon
