import React, { useMemo } from "react"
import { Col } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"
import { faXmark } from "@fortawesome/free-solid-svg-icons"

import { attrZhToEn, raceZhToEn } from "src/constant/filterConstants"
import { skillIconMapping } from "src/constant/skillIcon"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"

import "./style.scss"

export interface IFilterButtonProps {
    group: string
    index: number
    text: string
    suffix?: string
    selectedData?: string[]
    toggleButton?: (type: string, text: string, value: boolean) => void
    excludeData?: string[]
    excludeButton?: (type: string, text: string, value: boolean) => void
    showSkillIcon?: boolean

    // for custom
    checked?: boolean
    callback?: (e: React.ChangeEvent<HTMLInputElement>) => void
    size?: IObject
}

const FilterButton: React.FC<IFilterButtonProps> = (props) => {
    const {
        group,
        index,
        text,
        suffix = "",
        checked,
        callback,
        size,
        selectedData = [],
        toggleButton,
        excludeData = [],
        excludeButton,
        showSkillIcon,
    } = props

    const buttonChecked = useMemo(
        () => (checked !== undefined ? checked : selectedData?.includes(text)),
        [checked, selectedData, text],
    )

    const buttonExcluded = useMemo(
        () => excludeData?.includes(text),
        [excludeData, text],
    )

    const buttonIcon = useMemo(
        () =>
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
            ) : null,
        [group, text],
    )

    const skillIcon = useMemo(
        () =>
            ["functions", "skillFunctions", "armedFunctions"].includes(group) &&
            skillIconMapping?.[text]?.length
                ? skillIconMapping?.[text]
                      ?.filter((name: string) => name?.length)
                      ?.map((name: string, index: number) => (
                          <Image
                              path={`icon/skill_${name}`}
                              key={`${name}_${index}`}
                          />
                      ))
                : null,
        [group, text],
    )

    const buttonId = useMemo(() => `${group}-${index}`, [group, index])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (callback) {
            callback(e)
        } else if (buttonExcluded) {
            excludeButton?.(group, text, false)
        } else {
            toggleButton?.(group, text, !buttonChecked)
        }
    }

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!excludeButton) return
        if (buttonChecked) {
            toggleButton?.(group, text, false)
        } else {
            excludeButton(group, text, !buttonExcluded)
        }
    }

    return (
        <Col
            xs={size?.xs || 4}
            md={size?.md || 3}
            lg={size?.lg || 2}
            className={`btn-shell${buttonExcluded ? " excluded" : ""}`}
            title={`${text}${suffix}`}
            key={`${text}${suffix}`}
            onContextMenu={handleContextMenu}
        >
            <input
                type='checkbox'
                className='btn-input'
                id={buttonId}
                checked={!!buttonChecked}
                onChange={handleChange}
            />
            <label
                className={`btn ${group}-btn`}
                htmlFor={buttonId}
                key={buttonId}
            >
                <AutoTextSize className='content-wrapper' maxFontSizePx={20}>
                    {buttonIcon}
                    {text}
                    {suffix}
                </AutoTextSize>
                {buttonExcluded && (
                    <Icon icon={faXmark} className='excluded-icon' />
                )}
            </label>
            {showSkillIcon && skillIcon && (
                <div className='skill-icon'>{skillIcon}</div>
            )}
        </Col>
    )
}

export default React.memo(FilterButton)
