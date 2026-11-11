import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useSearchParams } from "react-router"
import _ from "lodash"

import {
    craftArmedTypeString,
    craftAttrTypeString,
    craftChargeTypeString,
    craftGenreTypeString,
    craftModeTypeString,
    craftRaceTypeString,
    craftSkillTypeString,
    craftStarTypeString,
    craftKeywordTargetString,
} from "src/constant/filterConstants"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import { monsterData } from "src/constant/monsterData"
import { craftData } from "src/constant/craftData"
import { armedCraftData } from "src/constant/armedCraftData"
import {
    checkKeyword,
    decodeKeywordTarget,
    decodeMapping,
    encodeKeywordTarget,
    encodeMapping,
    getKeywordTargetLabel,
    getMonsterNameById,
    getUrlParams,
    matchKeywords,
    removeUrlParams,
    setUrlParams,
    stringToUnicode,
    textSanitizer,
    unicodeToString,
} from "src/utilities/utils"
import { usePopover } from "src/hook/usePopover"
import Header from "src/shared/Header"
import PageContainer from "src/shared/PageContainer"
import FilterRow from "src/shared/FilterRow"
import FilterTabs, { type IFilterTab } from "src/shared/FilterTabs"
import KeywordRow from "src/shared/KeywordRow"
import ResultRow from "src/shared/ResultRow"

const craftKeywordGetter: Record<string, (craft: IObject) => string[]> = {
    skillDescription: (craft) => [
        ...(craft.description ?? []),
        ...(craft.skill_description ?? []),
    ],
    armedDescription: (craft) => [...(craft.armed_description ?? [])],
    craftName: (craft) => [craft.name],
}

interface ICraftFilterProps {}

const isValueMatch = (
    selectedValues: string[],
    value: string | string[] | undefined,
) =>
    Array.isArray(value)
        ? value.some((v) => selectedValues.includes(v))
        : selectedValues.includes(value as string)

const CraftFilter: React.FC<ICraftFilterProps> = () => {
    const [keyword, setKeyword] = useState<string>("")
    const [keywordTarget, setKeywordTarget] = useState<string>(
        craftKeywordTargetString[0].value,
    )
    const [selectedSkillFunctions, setSelectedSkillFunctions] = useState<
        string[]
    >([])
    const [selectedArmedFunctions, setSelectedArmedFunctions] = useState<
        string[]
    >([])
    const [selectedModes, setSelectedModes] = useState<string[]>([])
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedStars, setSelectedStars] = useState<string[]>([])
    const [selectedCharges, setSelectedCharges] = useState<string[]>([])
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [andOr, setAndOr] = useState<string>("or")
    const [showSkillIcon, setShowSkillIcon] = useState<boolean>(
        "SHOW_SKILL_ICON" in localStorage
            ? JSON.parse(localStorage?.getItem("SHOW_SKILL_ICON") || "true")
            : true,
    )
    const [resultData, setResultData] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [currentSearchParam, setCurrentSearchParam] = useState<IObject>({})
    const [loadingParams, setLoadingParams] = useState(false)

    const resultRef = useRef<HTMLDivElement>(null)

    const [urlQuery] = useSearchParams()

    const typeMap: IObject = useMemo(() => {
        return {
            skillFunctions: [selectedSkillFunctions, setSelectedSkillFunctions],
            armedFunctions: [selectedArmedFunctions, setSelectedArmedFunctions],
            mode: [selectedModes, setSelectedModes],
            attribute: [selectedAttributes, setSelectedAttributes],
            race: [selectedRaces, setSelectedRaces],
            star: [selectedStars, setSelectedStars],
            charge: [selectedCharges, setSelectedCharges],
            genre: [selectedGenres, setSelectedGenres],
        }
    }, [
        selectedArmedFunctions,
        selectedAttributes,
        selectedCharges,
        selectedGenres,
        selectedModes,
        selectedRaces,
        selectedSkillFunctions,
        selectedStars,
    ])

    const { Popover, togglePopover, setPopoverContent } = usePopover()

    useEffect(() => {
        setFavIconAndTitle("craft-filter")
        loadUrlParams()
    }, [])

    useEffect(() => {
        if (loadingParams) startFilter()
    }, [loadingParams])

    useEffect(() => {
        loadUrlParams()
    }, [urlQuery])

    const loadUrlParams = useCallback(() => {
        const params: IObject = getUrlParams()

        if (!_.isEmpty(params)) {
            setSelectedSkillFunctions(
                decodeMapping(craftSkillTypeString, params?.skill),
            )
            setSelectedArmedFunctions(
                decodeMapping(craftArmedTypeString, params?.armed),
            )
            setSelectedModes(decodeMapping(craftModeTypeString, params?.mode))
            setSelectedAttributes(
                decodeMapping(craftAttrTypeString, params?.attr),
            )
            setSelectedRaces(decodeMapping(craftRaceTypeString, params?.race))
            setSelectedStars(
                decodeMapping(craftStarTypeString, params?.star).map(
                    (star) => `${star} ★`,
                ),
            )
            setSelectedCharges(
                decodeMapping(craftChargeTypeString, params?.charge),
            )
            setSelectedGenres(
                decodeMapping(craftGenreTypeString, params?.genre),
            )
            setKeyword(unicodeToString(params?.keyword || ""))
            setKeywordTarget(
                decodeKeywordTarget(craftKeywordTargetString, params?.kt),
            )
            setAndOr(["or", "and"][+params?.or || 0])

            setLoadingParams(true)
        }
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
        const keywordArr: string[] = checkKeyword(keyword)
        const getKeywordTexts =
            craftKeywordGetter[keywordTarget] ?? craftKeywordGetter.description
        const skillFunctionArr = selectedSkillFunctions
        const isSkillFunctionSelected = !!selectedSkillFunctions.length
        const armedFunctionArr = selectedArmedFunctions
        const isArmedFunctionSelected = !!selectedArmedFunctions.length
        const isModeSelected = !!selectedModes.length
        const isAttrSelected = !!selectedAttributes.length
        const isRaceSelected = !!selectedRaces.length
        const isStarSelected = !!selectedStars.length
        const isChargeSelected = !!selectedCharges.length
        const isGenreSelected = !!selectedGenres.length

        const _selectedModes = selectedModes?.map((mode) => mode.slice(-2)) // get mode abbreviation

        let result: IObject[] = []

        // Normal craft

        if (!isGenreSelected || selectedGenres.includes("一般龍刻")) {
            for (const craft of craftData) {
                if (
                    (isModeSelected &&
                        !_selectedModes.some((mode) =>
                            Object.keys(craft.mode)?.includes(mode),
                        )) ||
                    (isAttrSelected &&
                        !isValueMatch(selectedAttributes, craft.attribute)) ||
                    (isRaceSelected &&
                        !isValueMatch(selectedRaces, craft.race)) ||
                    (isStarSelected && !selectedStars.includes(craft.star)) ||
                    (isChargeSelected &&
                        !selectedCharges.includes(craft.charge))
                )
                    continue

                if (
                    isSkillFunctionSelected ||
                    isArmedFunctionSelected ||
                    keywordArr.length
                ) {
                    if (andOr === "or") {
                        // OR

                        // Check for skill tags
                        let isSkillMatch = false
                        for (const selectedFunction of skillFunctionArr) {
                            if (craft.tag.includes(selectedFunction)) {
                                isSkillMatch = true
                                break
                            }
                        }
                        if (!isSkillMatch && !keywordArr.length) continue

                        // Check for keywords
                        if (
                            !isSkillMatch &&
                            keywordArr.length &&
                            !matchKeywords(
                                getKeywordTexts(craft),
                                keywordArr,
                                "some",
                            )
                        )
                            continue
                    } else if (andOr === "and") {
                        // AND

                        // Normal craft do not have armed skill
                        if (isArmedFunctionSelected) continue

                        // Check for skill tags
                        let isSkillMatch = true
                        for (const selectedFunction of skillFunctionArr) {
                            if (!craft.tag.includes(selectedFunction)) {
                                isSkillMatch = false
                                break
                            }
                        }
                        if (!isSkillMatch) continue

                        // Check for keywords

                        if (
                            !matchKeywords(
                                getKeywordTexts(craft),
                                keywordArr,
                                "every",
                            )
                        )
                            continue
                    }
                }
                if (craft?.tag?.length)
                    result = result.concat(
                        isModeSelected
                            ? Object.keys(craft?.mode)
                                  ?.filter((mode) =>
                                      _selectedModes.includes(mode),
                                  )
                                  ?.map((mode) => craft?.mode?.[mode])
                            : Object.values(craft?.mode),
                    )
            }
        }

        // Armed craft

        if (
            !isGenreSelected ||
            selectedGenres.includes("武裝龍刻") ||
            selectedGenres.includes("指定角色武裝") ||
            selectedGenres.includes("非指定角色武裝")
        ) {
            for (const craft of armedCraftData) {
                if (
                    (isModeSelected &&
                        !_selectedModes.some((mode) =>
                            Object.keys(craft.mode)?.includes(mode),
                        )) ||
                    (isAttrSelected &&
                        !(
                            isValueMatch(selectedAttributes, craft.attribute) ||
                            craft?.monster?.some((m: number) =>
                                isValueMatch(
                                    selectedAttributes,
                                    monsterData.find((md) => m === md.id)
                                        ?.attribute,
                                ),
                            )
                        )) ||
                    (isRaceSelected &&
                        !(
                            isValueMatch(selectedRaces, craft.race) ||
                            craft?.monster?.some((m: number) =>
                                isValueMatch(
                                    selectedRaces,
                                    monsterData.find((md) => m === md.id)?.race,
                                ),
                            )
                        )) ||
                    (isStarSelected && !selectedStars.includes(craft.star)) ||
                    (isChargeSelected &&
                        !selectedCharges.includes(craft.charge)) ||
                    (isGenreSelected &&
                        !selectedGenres.includes("武裝龍刻") &&
                        ((selectedGenres.includes("指定角色武裝") &&
                            !selectedGenres.includes("非指定角色武裝") &&
                            !(craft?.monster || craft?.series)) ||
                            (selectedGenres.includes("非指定角色武裝") &&
                                !selectedGenres.includes("指定角色武裝") &&
                                (craft?.monster || craft?.series))))
                )
                    continue

                if (
                    isSkillFunctionSelected ||
                    isArmedFunctionSelected ||
                    keywordArr.length
                ) {
                    if (andOr === "or") {
                        // OR

                        // Check for skill tags
                        let isSkillMatch = false
                        for (const selectedFunction of skillFunctionArr) {
                            if (craft.skill_tag.includes(selectedFunction)) {
                                isSkillMatch = true
                                break
                            }
                        }
                        if (!isSkillMatch) {
                            for (const selectedFunction of armedFunctionArr) {
                                if (
                                    craft.armed_tag.includes(selectedFunction)
                                ) {
                                    isSkillMatch = true
                                    break
                                }
                            }
                        }

                        if (!isSkillMatch && !keywordArr.length) continue

                        // Check for keywords
                        if (
                            !isSkillMatch &&
                            keywordArr.length &&
                            !matchKeywords(
                                getKeywordTexts(craft),
                                keywordArr,
                                "some",
                            )
                        )
                            continue
                    } else if (andOr === "and") {
                        // AND

                        // Check for skill tags
                        let isSkillMatch = true
                        for (const selectedFunction of skillFunctionArr) {
                            if (!craft.skill_tag.includes(selectedFunction)) {
                                isSkillMatch = false
                                break
                            }
                        }
                        if (isSkillMatch) {
                            for (const selectedFunction of armedFunctionArr) {
                                if (
                                    !craft.armed_tag.includes(selectedFunction)
                                ) {
                                    isSkillMatch = false
                                    break
                                }
                            }
                        }
                        if (!isSkillMatch) continue

                        // Check for keywords

                        if (
                            !matchKeywords(
                                getKeywordTexts(craft),
                                keywordArr,
                                "every",
                            )
                        )
                            continue
                    }
                }
                if (
                    craft?.tag?.length ||
                    craft?.skill_tag?.length ||
                    craft?.armed_tag?.length
                )
                    result = result.concat(
                        isModeSelected
                            ? Object.keys(craft?.mode)
                                  ?.filter((mode) =>
                                      _selectedModes.includes(mode),
                                  )
                                  ?.map((mode) => craft?.mode?.[mode])
                            : Object.values(craft?.mode),
                    )
            }
        }

        setResultData(result)
        setIsAfterFilter(true)

        const searchParam = {
            skillFunctions: selectedSkillFunctions,
            armedFunctions: selectedArmedFunctions,
            keyword: textSanitizer(keyword).length ? keyword.split(",") : [],
            keywordTarget: getKeywordTargetLabel(
                craftKeywordTargetString,
                keywordTarget,
            ),
            mode: selectedModes,
            attribute: selectedAttributes,
            race: selectedRaces,
            star: selectedStars,
            charge: selectedCharges,
            genre: selectedGenres,
            andOr,
        }
        setCurrentSearchParam(searchParam)

        setUrlParams({
            skill: encodeMapping(craftSkillTypeString, selectedSkillFunctions),
            armed: encodeMapping(craftArmedTypeString, selectedArmedFunctions),
            mode: encodeMapping(craftModeTypeString, selectedModes),
            attr: encodeMapping(craftAttrTypeString, selectedAttributes),
            race: encodeMapping(craftRaceTypeString, selectedRaces),
            star: encodeMapping(
                craftStarTypeString,
                selectedStars.map((s) => s[0]),
            ),
            charge: encodeMapping(craftChargeTypeString, selectedCharges),
            genre: encodeMapping(craftGenreTypeString, selectedGenres),
            keyword: textSanitizer(keyword).length
                ? stringToUnicode(textSanitizer(keyword))
                : "",
            kt: encodeKeywordTarget(craftKeywordTargetString, keywordTarget),
            or: ["or", "and"].indexOf(andOr).toString(),
        })

        if (loadingParams) removeUrlParams()

        setLoadingParams(false)
    }, [
        andOr,
        keyword,
        keywordTarget,
        loadingParams,
        selectedArmedFunctions,
        selectedAttributes,
        selectedCharges,
        selectedGenres,
        selectedModes,
        selectedRaces,
        selectedSkillFunctions,
        selectedStars,
    ])

    useEffect(() => {
        isAfterFilter &&
            resultRef?.current &&
            resultRef.current.scrollIntoView(true)
    }, [isAfterFilter, resultData])

    const filterTabs: IFilterTab[] = [
        {
            key: "skillFunctions",
            title: "龍脈能力",
            count: selectedSkillFunctions.length,
            content: (
                <FilterRow
                    title={"龍脈能力"}
                    type={"skillFunctions"}
                    data={craftSkillTypeString}
                    selectedData={selectedSkillFunctions}
                    toggleButton={toggleButton}
                    resetButton={resetButton}
                    enableSearch
                    showSkillIcon={showSkillIcon}
                />
            ),
        },
        {
            key: "armedFunctions",
            title: "武裝能力",
            count: selectedArmedFunctions.length,
            content: (
                <FilterRow
                    title={"武裝能力"}
                    type={"armedFunctions"}
                    data={craftArmedTypeString}
                    selectedData={selectedArmedFunctions}
                    toggleButton={toggleButton}
                    resetButton={resetButton}
                    enableSearch
                    showSkillIcon={showSkillIcon}
                />
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
                    targets={craftKeywordTargetString}
                    target={keywordTarget}
                    changeTarget={(value: string) => setKeywordTarget(value)}
                />
            ),
        },
        {
            key: "craft",
            title: "龍刻設定",
            count:
                selectedModes.length +
                selectedAttributes.length +
                selectedRaces.length +
                selectedStars.length +
                selectedCharges.length +
                selectedGenres.length,
            content: (
                <>
                    <FilterRow
                        title={"龍刻模式"}
                        type={"mode"}
                        data={craftModeTypeString}
                        selectedData={selectedModes}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                    <FilterRow
                        title={"裝備屬性"}
                        type={"attribute"}
                        data={craftAttrTypeString}
                        selectedData={selectedAttributes}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                    <FilterRow
                        title={"裝備種族"}
                        type={"race"}
                        data={craftRaceTypeString}
                        selectedData={selectedRaces}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                    <FilterRow
                        title={"龍刻稀有度"}
                        type={"star"}
                        data={craftStarTypeString}
                        selectedData={selectedStars}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                        btnSuffix={" ★"}
                    />
                    <FilterRow
                        title={"龍刻充能條件"}
                        type={"charge"}
                        data={craftChargeTypeString}
                        selectedData={selectedCharges}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                    <FilterRow
                        title={"龍刻種類"}
                        type={"genre"}
                        data={craftGenreTypeString}
                        selectedData={selectedGenres}
                        toggleButton={toggleButton}
                        resetButton={resetButton}
                    />
                </>
            ),
        },
    ]

    return (
        <ContextProvider toolId='craft-filter'>
            <Header
                resetAll={resetAll}
                andOr={andOr}
                changeAndOr={(value: string) => setAndOr(value)}
                startFilter={startFilter}
            />
            <PageContainer
                showSkillIcon={showSkillIcon}
                toggleShowSkillIcon={() => {
                    const _showSkillIcon = !showSkillIcon
                    setShowSkillIcon(_showSkillIcon)
                    localStorage?.setItem(
                        "SHOW_SKILL_ICON",
                        JSON.stringify(_showSkillIcon),
                    )
                }}
            >
                <>
                    <FilterTabs id='craft-filter-tabs' tabs={filterTabs} />
                    <div ref={resultRef}>
                        {isAfterFilter ? (
                            <ResultRow
                                resultData={resultData}
                                searchParam={currentSearchParam}
                                togglePopover={togglePopover}
                                setPopoverContent={setPopoverContent}
                            />
                        ) : (
                            <></>
                        )}
                    </div>
                </>
            </PageContainer>
            <Popover />
        </ContextProvider>
    )
}

export default CraftFilter
