import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import _ from "lodash"
import { faCheck, faLightbulb } from "@fortawesome/free-solid-svg-icons"

import {
    tagString,
    versionString,
    extraFilterData,
} from "src/constant/filterConstants"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import { monsterData } from "src/constant/monsterData"
import { errorAlert, getMonsterById, paddingZeros } from "src/utilities/utils"
import Icon from "src/utilities/Icon"
import Header from "../../shared/Header"
import PageContainer from "src/shared/PageContainer"
import FilterRow from "src/shared/FilterRow"
import ResultRow from "src/shared/ResultRow"
import InputModal from "src/shared/InputModal"

import "./style.scss"

interface IMonsterSelectorProps {}

const MonsterSelector: React.FC<IMonsterSelectorProps> = () => {
    const [input, setInput] = useState<number[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedExtraTags, setSelectedExtraTags] = useState<string[]>([])
    const [selectedVersions, setSelectedVersions] = useState<string[]>([])
    const [resultData, setResultData] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [inputModalOpen, setInputModalOpen] = useState<boolean>(false)
    const [resultPanelClicked, setResultPanelClicked] = useState<boolean>(false)

    const resultRef = useRef<HTMLDivElement>(null)

    const typeMap: Record<string, any[]> = useMemo(() => {
        return {
            tag: [selectedTags, setSelectedTags],
            extraTag: [selectedExtraTags, setSelectedExtraTags],
            version: [selectedVersions, setSelectedVersions],
        }
    }, [selectedExtraTags, selectedTags, selectedVersions])

    useEffect(() => {
        setFavIconAndTitle("monster-selector")
    }, [])

    const toggleValue = useCallback(
        (
            selected: string[],
            text: string,
            value: boolean,
            callback: (value: string[]) => void
        ) => {
            callback(
                value
                    ? [...selected, text]
                    : selected.filter((item) => item !== text)
            )
        },
        []
    )

    const toggleButton = useCallback(
        (type: string, text: string, value: boolean) => {
            const typeAction = typeMap?.[type]
            toggleValue(typeAction[0], text, value, typeAction[1])
        },
        [toggleValue, typeMap]
    )

    const resetButton = useCallback(
        (type: string) => {
            const typeAction = typeMap?.[type]
            typeAction[1]([])
        },
        [typeMap]
    )

    const resetAll = useCallback(() => {
        Object.keys(typeMap).forEach((type) => {
            resetButton(type)
        })
    }, [resetButton, typeMap])

    const startFilter = useCallback(() => {
        setResultPanelClicked(false)

        const isTagSelected = !!selectedTags.length
        const isExtraTagSelected = !!selectedExtraTags.length
        const isVersionSelected = !!selectedVersions.length

        if (!isTagSelected && !isExtraTagSelected && !isVersionSelected) {
            errorAlert(11)
            return
        }

        let result: IObject[] = []

        const selectedExtraData = extraFilterData
            .flat(1)
            .filter((tagObj) => selectedExtraTags.includes(tagObj?.name))
        const idGroup = selectedExtraData
            .map((tagObj) => tagObj?.otherMonsters)
            .flat(1)
        const tagGroup = selectedExtraData.map((tagObj) => tagObj?.tags).flat(1)

        for (const monster of monsterData) {
            if (!monster?.star || monster?.star <= 0 || monster?.displayId)
                continue

            if (isTagSelected) {
                let hasTag = false

                for (const tag of monster?.monsterTag) {
                    if (selectedTags.includes(tag)) {
                        hasTag = true
                        break
                    }
                }

                if (
                    (selectedTags.includes("自家") && !monster?.crossOver) ||
                    (selectedTags.includes("合作") && monster?.crossOver)
                )
                    hasTag = true

                if (!hasTag) continue
            }

            if (isExtraTagSelected) {
                if (idGroup.includes(monster.id)) {
                    result.push({ id: monster.id })
                    continue
                }

                let hasTag = false

                for (const tag of monster?.monsterTag) {
                    if (tagGroup.includes(tag)) {
                        hasTag = true
                        break
                    }
                }

                if (hasTag) {
                    result.push({ id: monster.id })
                    continue
                }
            }

            if (isVersionSelected) {
                if (selectedVersions.includes(monster?.version)) {
                    result.push({ id: monster.id })
                }
            }
        }

        setResultData(
            _.uniq([
                ...input.map((id) => {
                    return {
                        id,
                    }
                }),
                ...result,
            ])
        )
        setIsAfterFilter(true)
    }, [input, selectedExtraTags, selectedTags, selectedVersions])

    const openInputModal = useCallback(() => {
        setInputModalOpen(true)
    }, [])

    const resultIdPanel = useCallback(() => {
        const resultStr = resultData
            .map((monster) => paddingZeros(monster?.id, 5))
            .join(" ")

        return (
            <>
                <div
                    className={`result-id-panel${
                        resultPanelClicked ? " result-id-panel-copied" : ""
                    }`}
                    onClick={() => {
                        setResultPanelClicked(true)
                        navigator.clipboard.writeText(resultStr)
                    }}
                >
                    {resultStr}
                </div>
                <div className='note-row'>
                    {resultPanelClicked ? (
                        <>
                            <Icon icon={faCheck} />
                            &nbsp; 複製成功
                        </>
                    ) : (
                        <>
                            <Icon icon={faLightbulb} />
                            &nbsp; 點擊區塊可直接複製完整字串
                        </>
                    )}
                </div>
            </>
        )
    }, [resultData, resultPanelClicked])

    useEffect(() => {
        isAfterFilter &&
            resultRef?.current &&
            resultRef.current.scrollIntoView(true)
    }, [isAfterFilter, resultData])

    return (
        <ContextProvider
            toolId='monster-selector'
            toggleButton={toggleButton}
            resetAll={resetAll}
            tag={selectedTags}
            extraTag={selectedExtraTags}
            version={selectedVersions}
            startFilter={startFilter}
        >
            <Header />
            <PageContainer openInputModal={openInputModal}>
                <>
                    <FilterRow
                        title={"官方標籤"}
                        type={"tag"}
                        data={tagString}
                        collapsible
                        hideReset
                    />
                    <FilterRow
                        title={"其他標籤"}
                        type={"extraTag"}
                        data={extraFilterData.map((group) =>
                            group.map((item: IObject) => item.name)
                        )}
                        collapsible
                        defaultOpen
                        hideReset
                    />
                    <FilterRow
                        title={"版本標籤"}
                        type={"version"}
                        data={versionString}
                        collapsible
                        hideReset
                    />
                    <div ref={resultRef}>
                        {isAfterFilter ? (
                            <>
                                <ResultRow title='生成編號'>
                                    {resultIdPanel()}
                                </ResultRow>
                                <ResultRow
                                    title='所選召喚獸'
                                    resultData={resultData}
                                    noImagePopover
                                />
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </>
            </PageContainer>
            <InputModal
                open={inputModalOpen}
                onClose={() => setInputModalOpen(false)}
                onChangeInput={(input) => {
                    const inputArr = _.uniq(
                        input
                            .split(/\s+/)
                            .filter((str) => str.length)
                            .map((str) => parseInt(str))
                    ).filter((id) => !_.isEmpty(getMonsterById(id)))
                    resetAll()
                    setInput(inputArr)
                    setResultData(
                        inputArr.map((id) => {
                            return {
                                id,
                            }
                        })
                    )
                    setResultPanelClicked(false)
                    setIsAfterFilter(true)
                }}
            />
        </ContextProvider>
    )
}

export default MonsterSelector
