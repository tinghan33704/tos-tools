import React, { useCallback, useState } from "react"
import _ from "lodash"
import { Table } from "react-bootstrap"
import LazyLoad from "react-lazyload"

import { attrZhToEn } from "src/constant/filterConstants"
import { monsterData } from "src/constant/monsterData"
import { descriptionTranslator, getMonsterById } from "src/utilities/utils"
import Image from "src/utilities/Image"
import Pagination from "src/shared/Pagination"
import { ResultMonsterImage } from "../ResultImage"

import "./style.scss"

export interface IResultTableProps {
    resultData: IObject[]
    noImagePopover?: boolean
}

const PAGE_SIZE = 10

const ResultTable: React.FC<IResultTableProps> = (props) => {
    const { resultData, noImagePopover = false } = props

    const [currentPage, setCurrentPage] = useState(1)

    const onChangePage = useCallback(
        (page: number) => {
            setCurrentPage(
                page < 1
                    ? 1
                    : page > resultData.length
                      ? resultData.length
                      : page,
            )
        },
        [resultData.length],
    )

    const renderRelativeRow = useCallback(
        (relativeList: (number | string)[]) => {
            const relativeMonsters = new Set()
            relativeList.forEach((relative: number | string) => {
                if (_.isNumber(relative) || relative?.[0] === "?") {
                    relativeMonsters.add(relative as number)
                } else {
                    const monsterWithTags = monsterData
                        .filter((monster: IObject) => {
                            return monster.monsterTag.includes(relative)
                        })
                        .map((monster) => monster?.id)

                    monsterWithTags.forEach((monster: number) => {
                        relativeMonsters.add(monster)
                    })
                }
            })

            return ([...relativeMonsters] as number[]).map(
                (relative: number) => {
                    return (
                        <Image
                            key={relative}
                            className='relative-img'
                            path={`monster/${relative}`}
                        />
                    )
                },
            )
        },
        [],
    )

    return (
        <>
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(resultData.length / PAGE_SIZE)}
                onPageChange={onChangePage}
            />
            <Table hover className='result-table'>
                {resultData
                    .slice(
                        (currentPage - 1) * PAGE_SIZE,
                        currentPage * PAGE_SIZE,
                    )
                    .map((data) => {
                        const { id, attr, skillIndexes } = data
                        const monster = getMonsterById(id)

                        return (
                            <LazyLoad
                                key={`${id}_${attr}`}
                                once
                                offset={500}
                                placeholder={
                                    <span
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "#666666",
                                            height: "50px",
                                        }}
                                    >
                                        載入中...
                                    </span>
                                }
                            >
                                {skillIndexes.map(
                                    (index: number, index_index: number) => {
                                        const skill =
                                            monster?.teamSkill?.[index]
                                        return (
                                            <React.Fragment
                                                key={`${id}_${attr}_${index}`}
                                            >
                                                <tr
                                                    className={`monster-tr ${
                                                        index_index === 0
                                                            ? "monster-first-tr"
                                                            : ""
                                                    } monster-tr-${attrZhToEn[attr]}`}
                                                >
                                                    {index_index === 0 && (
                                                        <td
                                                            className='td-monster-icon'
                                                            rowSpan={
                                                                skillIndexes.length *
                                                                3
                                                            }
                                                        >
                                                            <ResultMonsterImage
                                                                data={data}
                                                                noImagePopover={
                                                                    noImagePopover
                                                                }
                                                            />
                                                        </td>
                                                    )}
                                                    <td
                                                        className='td-description'
                                                        dangerouslySetInnerHTML={{
                                                            __html: `${descriptionTranslator(
                                                                id,
                                                                skill?.description,
                                                                true,
                                                            )}`,
                                                        }}
                                                    ></td>
                                                </tr>
                                                <tr
                                                    className={`monster-tr monster-tr-${attrZhToEn[attr]}`}
                                                >
                                                    <td
                                                        className='td-activate'
                                                        dangerouslySetInnerHTML={{
                                                            __html: `${descriptionTranslator(
                                                                id,
                                                                skill?.activate,
                                                                true,
                                                            )}`,
                                                        }}
                                                    ></td>
                                                </tr>
                                                <tr
                                                    className={`monster-tr monster-tr-${attrZhToEn[attr]}`}
                                                >
                                                    <td className='td-relative'>
                                                        {renderRelativeRow(
                                                            skill?.relative,
                                                        )}
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        )
                                    },
                                )}
                            </LazyLoad>
                        )
                    })}
            </Table>
            <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(resultData.length / PAGE_SIZE)}
                onPageChange={onChangePage}
            />
        </>
    )
}

export default React.memo(ResultTable)
