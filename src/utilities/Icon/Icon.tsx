import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconProp } from "@fortawesome/fontawesome-svg-core"

export interface IIconProps {
    icon: IconProp
    onClick?: (event: React.MouseEvent) => void
    style?: React.CSSProperties
    className?: string
}

const Icon: React.FC<IIconProps> = (props) => {
    const { icon, onClick, style, className } = props

    return (
        <FontAwesomeIcon
            icon={icon}
            onClick={onClick}
            style={style}
            className={className}
        />
    )
}

export default React.memo(Icon)
