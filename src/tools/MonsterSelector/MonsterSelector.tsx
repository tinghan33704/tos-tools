import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import _ from "lodash"
import { faCheck, faLightbulb } from "@fortawesome/free-solid-svg-icons"

import {
    versionString,
    extraFilterData,
    attrTypeString,
    raceTypeString,
    starTypeString,
    monsterSelectorKeywordTargetString,
} from "src/constant/filterConstants"
import { monsterData } from "src/constant/monsterData"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import {
    checkKeyword,
    errorAlert,
    getMonsterById,
    matchKeywords,
    paddingZeros,
    textSanitizer,
    tagPageString,
    tagString,
} from "src/utilities/utils"
import Icon from "src/utilities/Icon"
import Header from "src/shared/Header"
import PageContainer from "src/shared/PageContainer"
import FilterRow from "src/shared/FilterRow"
import FilterTabs, { type IFilterTab } from "src/shared/FilterTabs"
import KeywordRow from "src/shared/KeywordRow"
import ResultRow from "src/shared/ResultRow"
import InputModal from "src/shared/InputModal"

import "./style.scss"

const officialTagPages = tagPageString
    .map((page) => ({
        ...page,
        groups: page.groups
            .filter((groupIndex) => groupIndex > 0)
            .map((groupIndex) => groupIndex - 1),
    }))
    .filter((page) => page.groups.length)

interface IMonsterSelectorProps {}

const MonsterSelector: React.FC<IMonsterSelectorProps> = () => {
    const [input, setInput] = useState<number[]>([])
    const [keyword, setKeyword] = useState<string>("")
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedStars, setSelectedStars] = useState<string[]>([])
    const [selectedOrigin, setSelectedOrigin] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedExtraTags, setSelectedExtraTags] = useState<string[]>([])
    const [selectedVersions, setSelectedVersions] = useState<string[]>([])
    const [resultData, setResultData] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [inputModalOpen, setInputModalOpen] = useState<boolean>(false)
    const [resultPanelClicked, setResultPanelClicked] = useState<boolean>(false)

    const resultRef = useRef<HTMLDivElement>(null)

    const typeMap: IObject = useMemo(() => {
        return {
            attribute: [selectedAttributes, setSelectedAttributes],
            race: [selectedRaces, setSelectedRaces],
            star: [selectedStars, setSelectedStars],
            origin: [selectedOrigin, setSelectedOrigin],
            tag: [selectedTags, setSelectedTags],
            extraTag: [selectedExtraTags, setSelectedExtraTags],
            version: [selectedVersions, setSelectedVersions],
        }
    }, [
        selectedAttributes,
        selectedExtraTags,
        selectedOrigin,
        selectedRaces,
        selectedStars,
        selectedTags,
        selectedVersions,
    ])

    useEffect(() => {
        setFavIconAndTitle("monster-selector")
    }, [])

    const toggleValue = useCallback(
        (
            selected: string[],
            text: string,
            value: boolean,
            callback: (value: string[]) => void,
        ) => {
            callback(
                value
                    ? [...selected, text]
                    : selected.filter((item) => item !== text),
            )
        },
        [],
    )

    const toggleButton = useCallback(
        (type: string, text: string, value: boolean) => {
            const typeAction = typeMap?.[type]
            toggleValue(typeAction[0], text, value, typeAction[1])
        },
        [toggleValue, typeMap],
    )

    const resetButton = useCallback(
        (type: string) => {
            const typeAction = typeMap?.[type]
            typeAction[1]([])
        },
        [typeMap],
    )

    const resetAll = useCallback(() => {
        Object.keys(typeMap).forEach((type) => {
            resetButton(type)
        })
        setKeyword("")
    }, [resetButton, typeMap])

    const startFilter = useCallback(() => {
        setResultPanelClicked(false)

        const isAttrSelected = !!selectedAttributes.length
        const isRaceSelected = !!selectedRaces.length
        const isStarSelected = !!selectedStars.length
        const isOriginSelected = !!selectedOrigin.length
        const isTagSelected = !!selectedTags.length
        const isExtraTagSelected = !!selectedExtraTags.length
        const isVersionSelected = !!selectedVersions.length
        const keywordArr: string[] = checkKeyword(keyword)
        const isKeywordInput = !!keywordArr.length

        if (
            !isKeywordInput &&
            !isAttrSelected &&
            !isRaceSelected &&
            !isStarSelected &&
            !isOriginSelected &&
            !isTagSelected &&
            !isExtraTagSelected &&
            !isVersionSelected
        ) {
            errorAlert(11)
            return
        }

        const result: IObject[] = []

        const selectedExtraData = extraFilterData
            .flat(1)
            .filter((tagObj) => selectedExtraTags.includes(tagObj?.name))
        const idGroup = selectedExtraData
            .map((tagObj) => tagObj?.otherMonsters)
            .flat(1)
        const tagGroup = selectedExtraData.map((tagObj) => tagObj?.tags).flat(1)

        for (const monster of monsterData) {
            if (
                !monster?.star ||
                monster?.star <= 0 ||
                monster?.displayId ||
                (isAttrSelected &&
                    !selectedAttributes.includes(monster.attribute)) ||
                (isRaceSelected && !selectedRaces.includes(monster.race)) ||
                (isStarSelected &&
                    !selectedStars.map((s) => +s[0]).includes(monster.star)) ||
                (isOriginSelected &&
                    ((!selectedOrigin.includes("自家") && !monster.crossOver) ||
                        (!selectedOrigin.includes("合作") &&
                            monster.crossOver))) ||
                (isVersionSelected &&
                    !selectedVersions.includes(monster.version)) ||
                (isKeywordInput &&
                    !matchKeywords([monster.name], keywordArr, "some"))
            )
                continue

            if (
                isTagSelected &&
                !(monster?.monsterTag || []).some((tag: string) =>
                    selectedTags.includes(tag),
                )
            )
                continue

            if (
                isExtraTagSelected &&
                !idGroup.includes(monster.id) &&
                !(monster?.monsterTag || []).some((tag: string) =>
                    tagGroup.includes(tag),
                )
            )
                continue

            result.push({ id: monster.id })
        }

        setResultData(
            _.uniq([
                ...input.map((id) => {
                    return {
                        id,
                    }
                }),
                ...result,
            ]),
        )
        setIsAfterFilter(true)
    }, [
        input,
        keyword,
        selectedAttributes,
        selectedExtraTags,
        selectedOrigin,
        selectedRaces,
        selectedStars,
        selectedTags,
        selectedVersions,
    ])

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

    const filterTabs: IFilterTab[] = [
        {
            key: "monster",
            title: "召喚獸設定",
            count:
                selectedAttributes.length +
                selectedRaces.length +
                selectedStars.length +
                selectedOrigin.length,
            content: (
                <>
                    <FilterRow
                        title={"召喚獸屬性"}
                        type={"attribute"}
                        data={attrTypeString}
                        selectedData={selectedAttributes}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                    <FilterRow
                        title={"召喚獸種族"}
                        type={"race"}
                        data={raceTypeString}
                        selectedData={selectedRaces}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                    <FilterRow
                        title={"召喚獸稀有度"}
                        type={"star"}
                        data={starTypeString}
                        selectedData={selectedStars}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                        btnSuffix={" ★"}
                    />
                    <FilterRow
                        title={"召喚獸來源"}
                        type={"origin"}
                        data={tagString[0]}
                        selectedData={selectedOrigin}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                </>
            ),
        },
        {
            key: "keyword",
            title: "關鍵字搜尋",
            count: textSanitizer(keyword).split(",").filter(Boolean).length,
            content: (
                <KeywordRow
                    keyword={keyword}
                    changeKeyword={(value: string) => setKeyword(value)}
                    resetKeyword={() => setKeyword("")}
                    targets={monsterSelectorKeywordTargetString}
                />
            ),
        },
        {
            key: "tag",
            title: "官方標籤",
            count: selectedTags.length,
            content: (
                <FilterRow
                    title={"官方標籤"}
                    type={"tag"}
                    data={tagString.slice(1)}
                    selectedData={selectedTags}
                    toggleButton={toggleButton}
                    resetButton={resetButton}
                    enableSearch
                    pages={officialTagPages}
                />
            ),
        },
        {
            key: "extraTag",
            title: "合作系列",
            count: selectedExtraTags.length,
            content: (
                <FilterRow
                    title={"合作系列"}
                    type={"extraTag"}
                    data={extraFilterData.map((group) =>
                        group.map((item: IObject) => item.name),
                    )}
                    selectedData={selectedExtraTags}
                    toggleButton={toggleButton}
                    resetButton={resetButton}
                    enableSearch
                />
            ),
        },
        {
            key: "version",
            title: "版本標籤",
            count: selectedVersions.length,
            content: (
                <FilterRow
                    title={"版本標籤"}
                    type={"version"}
                    data={versionString}
                    selectedData={selectedVersions}
                    toggleButton={toggleButton}
                    resetButton={resetButton}
                />
            ),
        },
    ]

    return (
        <ContextProvider toolId='monster-selector'>
            <Header resetAll={resetAll} startFilter={startFilter} />
            <PageContainer openInputModal={openInputModal}>
                <>
                    <FilterTabs id='monster-selector-tabs' tabs={filterTabs} />
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
                            .map((str) => parseInt(str)),
                    ).filter((id) => !_.isEmpty(getMonsterById(id)))
                    resetAll()
                    setInput(inputArr)
                    setResultData(
                        inputArr.map((id) => {
                            return {
                                id,
                            }
                        }),
                    )
                    setResultPanelClicked(false)
                    setIsAfterFilter(true)
                }}
            />
        </ContextProvider>
    )
}

export default MonsterSelector
