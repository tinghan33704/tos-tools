import React, { MouseEventHandler } from "react"
import { IconDefinition } from "@fortawesome/free-solid-svg-icons"

import Icon from "../Icon"

import "./style.scss"

export interface IButtonProps {
    className?: string
    icon?: IconDefinition
    text?: string
    style?: Object
    onClick?: MouseEventHandler<HTMLButtonElement>
    disabled?: boolean
}

const Button: React.FC<IButtonProps> = (props) => {
    const {
        className = "",
        icon = null,
        text = "",
        onClick,
        style = {},
        disabled,
    } = props

    const _style = {
        ...style,
        width: "100%",
    }

    return (
        <button
            type='button'
            className={`btn ${className} ${disabled ? "btn-disabled" : ""}`}
            style={_style}
            onClick={onClick}
            disabled={disabled}
        >
            {icon && <Icon icon={icon} />}
            {text}
        </button>
    )
}

export default Button
