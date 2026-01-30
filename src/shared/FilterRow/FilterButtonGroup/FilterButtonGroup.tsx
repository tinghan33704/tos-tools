import React from "react"
import { Row } from "react-bootstrap"
import LazyLoad from "react-lazyload"

import { skillAlias } from "src/constant/filterConstants"
import FilterButton from "../FilterButton/FilterButton"

import "./style.scss"

export interface IFilterButtonGroupProps {
    type: string
    groupData: (string | string[])[]
    btnSuffix?: string
    useLazyLoad?: boolean
    isCollapseOpen?: boolean
    searchText?: string
}

const FilterButtonGroup: React.FC<IFilterButtonGroupProps> = (props) => {
    const {
        type,
        groupData,
        btnSuffix = "",
        useLazyLoad,
        searchText = "",
    } = props

    const _groupData = searchText?.length
        ? groupData
              ?.map((group) => {
                  return Array.isArray(group)
                      ? group?.filter(
                            (item) =>
                                item
                                    ?.toLowerCase()
                                    ?.includes(searchText?.toLowerCase()) ||
                                skillAlias?.[item]?.includes(
                                    searchText?.toLowerCase(),
                                ),
                        )
                      : group
                              ?.toLowerCase()
                              ?.includes(searchText?.toLowerCase()) ||
                          skillAlias?.[group]?.includes(
                              searchText?.toLowerCase(),
                          )
                        ? group
                        : ""
              })
              ?.filter((group) => group?.length)
        : groupData

    let curIndex = 0

    return (
        <Row className='filter-button-group' key={`button_group_${type}`}>
            <Row>
                {_groupData.map((group: string | string[], index: number) => {
                    return Array.isArray(group) ? (
                        useLazyLoad && index >= 2 ? ( // workaround for forceCheck not working for accordion open
                            <LazyLoad
                                once
                                offset={500}
                                placeholder={
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#666666",
                                            height: "200px",
                                        }}
                                        className='loading'
                                    >
                                        載入中...
                                    </span>
                                }
                                key={`group_row_${index}_${curIndex}`}
                            >
                                <Row className='gx-0 group-row'>
                                    {group.map((data: string) => {
                                        return (
                                            <FilterButton
                                                group={type}
                                                index={curIndex++}
                                                text={`${data}${btnSuffix}`}
                                                key={`${data}_${curIndex}`}
                                            />
                                        )
                                    })}
                                    {index !== groupData.length - 1 && (
                                        <div className='col-12 my-2' />
                                    )}
                                </Row>
                            </LazyLoad>
                        ) : (
                            <Row
                                className='gx-0 group-row'
                                key={`group_row_${index}_${curIndex}`}
                            >
                                {group.map((data: string) => {
                                    return (
                                        <FilterButton
                                            group={type}
                                            index={curIndex++}
                                            text={`${data}${btnSuffix}`}
                                            key={`${data}_${curIndex}`}
                                        />
                                    )
                                })}
                                {index !== groupData.length - 1 && (
                                    <div className='col-12 my-2' />
                                )}
                            </Row>
                        )
                    ) : (
                        <FilterButton
                            group={type}
                            index={curIndex++}
                            text={`${group}${btnSuffix}`}
                            key={`${group}_${curIndex}`}
                        />
                    )
                })}
            </Row>
        </Row>
    )
}

export default FilterButtonGroup
