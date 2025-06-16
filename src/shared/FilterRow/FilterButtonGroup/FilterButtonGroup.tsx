import React from "react"
import { Row } from "react-bootstrap"

import FilterButton from "../FilterButton/FilterButton"
import "./style.scss"

export interface IFilterButtonGroupProps {
    type: string
    groupData: any
    btnSuffix?: string
}

const FilterButtonGroup: React.FC<IFilterButtonGroupProps> = (props) => {
    const { type, groupData, btnSuffix = "" } = props

    let curIndex = 0
    return (
        <Row className='filter-button-group'>
            <Row>
                {groupData.map((group: any, index: number) => {
                    return Array.isArray(group) ? (
                        <Row className='gx-0 group-row'>
                            {group.map((data: any) => {
                                return (
                                    <FilterButton
                                        group={type}
                                        index={curIndex++}
                                        text={`${data}${btnSuffix}`}
                                    />
                                )
                            })}
                            {index !== groupData.length - 1 && (
                                <div className='col-12 my-2' />
                            )}
                        </Row>
                    ) : (
                        <FilterButton
                            group={type}
                            index={curIndex++}
                            text={`${group}${btnSuffix}`}
                        />
                    )
                })}
            </Row>
        </Row>
    )
}

export default FilterButtonGroup
