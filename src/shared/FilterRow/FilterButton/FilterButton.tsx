import React, { useContext } from "react"
import { Col } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"

import { attrZhToEn, raceZhToEn } from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import Image from "src/utilities/Image"

import "./style.scss"

export interface IFilterButtonProps {
    group: string
    index: number
    text: string
    suffix?: string

    // for custom
    checked?: boolean
    callback?: (e: React.ChangeEvent<HTMLInputElement>) => void
    size?: IObject
}

const FilterButton: React.FC<IFilterButtonProps> = (props) => {
    const context = useContext(Context)
    const { group, index, text, suffix = "", checked, callback, size } = props

    const buttonChecked =
        checked !== undefined
            ? checked
            : (context as any)?.[group]?.includes(text)

    const buttonIcon =
        group === "attribute" ? (
            attrZhToEn?.[text] ? (
                <Image
                    className='btn-icon'
                    path={`icon/icon_${attrZhToEn[text]}`}
                />
            ) : (
                <></>
            )
        ) : group === "race" ? (
            raceZhToEn?.[text] ? (
                <Image
                    className='btn-icon'
                    path={`icon/icon_${raceZhToEn[text]}`}
                />
            ) : (
                <></>
            )
        ) : null

    const buttonId = `${group}-${index}`
    return (
        <Col
            xs={size?.xs || 6}
            md={size?.md || 4}
            lg={size?.lg || 2}
            className='btn-shell'
            title={`${text}${suffix}`}
        >
            <input
                type='checkbox'
                className='btn-input'
                id={buttonId}
                checked={!!buttonChecked}
                onChange={(e) =>
                    callback
                        ? callback(e)
                        : context.toggleButton(group, text, !buttonChecked)
                }
            />
            <label
                className={`btn ${group}-btn`}
                htmlFor={buttonId}
                key={buttonId}
            >
                {buttonIcon ? (
                    <>
                        {buttonIcon}
                        {text}
                        {suffix}
                    </>
                ) : (
                    <AutoTextSize maxFontSizePx={20}>
                        {text}
                        {suffix}
                    </AutoTextSize>
                )}
            </label>
        </Col>
    )
}

export default FilterButton
