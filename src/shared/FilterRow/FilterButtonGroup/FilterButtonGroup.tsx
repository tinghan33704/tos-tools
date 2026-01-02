import React, { useEffect } from "react"
import { Row } from "react-bootstrap"
import LazyLoad, { forceCheck } from "react-lazyload"

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
        isCollapseOpen,
        searchText = "",
    } = props

    useEffect(() => {
        if (useLazyLoad && isCollapseOpen) forceCheck()
    }, [isCollapseOpen])

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
                                    searchText?.toLowerCase()
                                )
                        )
                      : group
                            ?.toLowerCase()
                            ?.includes(searchText?.toLowerCase()) ||
                        skillAlias?.[group]?.includes(searchText?.toLowerCase())
                      ? group
                      : ""
              })
              ?.filter((group) => group?.length)
        : groupData

    let curIndex = 0

    return (
        <Row className='filter-button-group'>
            <Row>
                {_groupData.map((group: string | string[], index: number) => {
                    return Array.isArray(group) ? (
                        useLazyLoad ? (
                            <LazyLoad
                                once
                                offset={100}
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
                            >
                                <Row className='gx-0 group-row'>
                                    {group.map((data: string) => {
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
                            </LazyLoad>
                        ) : (
                            <Row className='gx-0 group-row'>
                                {group.map((data: string) => {
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
                        )
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
