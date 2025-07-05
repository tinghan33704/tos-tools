import React, { useCallback } from "react"
import _ from "lodash"
import { Table } from "react-bootstrap"

import { attrZhToEn } from "src/constant/filterConstants"
import { monsterData } from "src/constant/monsterData"
import { descriptionTranslator, getMonsterById } from "src/utilities/utils"
import Image from "src/utilities/Image"
import { ResultMonsterImage } from "../ResultImage"

import "./style.scss"

export interface IResultTableProps {
    resultData: IObject[]
    noImagePopover?: boolean
}

const ResultTable: React.FC<IResultTableProps> = (props) => {
    const { resultData, noImagePopover = false } = props

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
                            className='relative-img'
                            path={`monster/${relative}`}
                        />
                    )
                }
            )
        },
        []
    )

    return (
        <Table hover className='result-table'>
            {resultData.map((data) => {
                const { id, attr, skillIndexes } = data
                const monster = getMonsterById(id)

                return (
                    <>
                        {skillIndexes.map(
                            (index: number, index_index: number) => {
                                const skill = monster?.teamSkill?.[index]
                                return (
                                    <>
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
                                                        skillIndexes.length * 3
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
                                                        true
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
                                                        true
                                                    )}`,
                                                }}
                                            ></td>
                                        </tr>
                                        <tr
                                            className={`monster-tr monster-tr-${attrZhToEn[attr]}`}
                                        >
                                            <td className='td-relative'>
                                                {renderRelativeRow(
                                                    skill?.relative
                                                )}
                                            </td>
                                        </tr>
                                    </>
                                )
                            }
                        )}
                    </>
                )
            })}
        </Table>
    )
}

export default ResultTable
