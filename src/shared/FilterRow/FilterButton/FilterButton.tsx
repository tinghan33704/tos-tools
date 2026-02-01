import React, { useMemo } from "react"
import { Col } from "react-bootstrap"
import { AutoTextSize } from "auto-text-size"

import { attrZhToEn, raceZhToEn } from "src/constant/filterConstants"
import { skillIconMapping } from "src/constant/skillIcon"
import Image from "src/utilities/Image"

import "./style.scss"

export interface IFilterButtonProps {
    group: string
    index: number
    text: string
    suffix?: string
    selectedData?: string[]
    toggleButton?: (type: string, text: string, value: boolean) => void
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
        showSkillIcon,
    } = props

    const buttonChecked = useMemo(
        () => (checked !== undefined ? checked : selectedData?.includes(text)),
        [checked, selectedData, text],
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

    return (
        <Col
            xs={size?.xs || 4}
            md={size?.md || 3}
            lg={size?.lg || 2}
            className='btn-shell'
            title={`${text}${suffix}`}
            key={`${text}${suffix}`}
        >
            <input
                type='checkbox'
                className='btn-input'
                id={buttonId}
                checked={!!buttonChecked}
                onChange={(e) =>
                    callback
                        ? callback(e)
                        : toggleButton?.(group, text, !buttonChecked)
                }
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
            </label>
            {showSkillIcon && skillIcon && (
                <div className='skill-icon'>{skillIcon}</div>
            )}
        </Col>
    )
}

export default FilterButton
