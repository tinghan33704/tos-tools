import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import _ from "lodash"

import {
    craft_armed_type_string,
    craft_attr_type_string,
    craft_charge_type_string,
    craft_genre_type_string,
    craft_mode_type_string,
    craft_race_type_string,
    craft_skill_type_string,
    craft_star_type_string,
} from "src/constant/filterConstants"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import { monsterData } from "src/constant/monsterData"
import { craftData } from "src/constant/craftData"
import {
    checkKeyword,
    decodeMapping,
    encodeMapping,
    getUrlParams,
    removeUrlParams,
    setUrlParams,
    stringToUnicode,
    textSanitizer,
    unicodeToString,
} from "src/utilities/utils"
import Header from "../../shared/Header"
import PageContainer from "src/shared/PageContainer"
import FilterRow from "src/shared/FilterRow"
import KeywordRow from "src/shared/KeywordRow"
import ResultRow from "src/shared/ResultRow"
import { armedCraftData } from "src/constant/armedCraftData"
import { usePopover } from "src/hook/usePopover"

interface ICraftFilterProps {}

const CraftFilter: React.FC<ICraftFilterProps> = () => {
    const [keyword, setKeyword] = useState<string>("")
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
    const [resultData, setResultData] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [currentSearchParam, setCurrentSearchParam] = useState<IObject>({})
    const [loadingParams, setLoadingParams] = useState(false)

    const resultRef = useRef<HTMLDivElement>(null)

    const typeMap: Record<string, any[]> = useMemo(() => {
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

    const loadUrlParams = useCallback(() => {
        const params: IObject = getUrlParams()

        if (!_.isEmpty(params)) {
            setSelectedSkillFunctions(
                decodeMapping(craft_skill_type_string, params?.skill)
            )
            setSelectedArmedFunctions(
                decodeMapping(craft_armed_type_string, params?.armed)
            )
            setSelectedModes(
                decodeMapping(craft_mode_type_string, params?.mode)
            )
            setSelectedAttributes(
                decodeMapping(craft_attr_type_string, params?.attr)
            )
            setSelectedRaces(
                decodeMapping(craft_race_type_string, params?.race)
            )
            setSelectedStars(
                decodeMapping(craft_star_type_string, params?.star).map(
                    (star) => `${star} ★`
                )
            )
            setSelectedCharges(
                decodeMapping(craft_charge_type_string, params?.charge)
            )
            setSelectedGenres(
                decodeMapping(craft_genre_type_string, params?.genre)
            )
            setKeyword(unicodeToString(params?.keyword || ""))
            setAndOr(["or", "and", "m-and"][+params?.genre || 0])

            setLoadingParams(true)
        }
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
        const keywordArr: string[] = checkKeyword(keyword)
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

        let result: IObject[] = []

        // Normal craft

        if (!isGenreSelected || selectedGenres.includes("一般龍刻")) {
            for (const craft of craftData) {
                if (
                    (isModeSelected && !selectedModes.includes(craft.mode)) ||
                    (isAttrSelected &&
                        !selectedAttributes.includes(craft.attribute)) ||
                    (isRaceSelected && !selectedRaces.includes(craft.race)) ||
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
                        if (!isSkillMatch && keywordArr.length) {
                            let isKeywordChecked = false

                            for (const keyword of keywordArr) {
                                for (const desc in craft.description) {
                                    const skillDesc = textSanitizer(desc)
                                    if (skillDesc.includes(keyword)) {
                                        isKeywordChecked = true
                                        break
                                    }
                                }
                                if (isKeywordChecked) break
                            }

                            if (!isKeywordChecked) continue
                        }
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

                        let isAllKeywordChecked = true
                        for (const keyword of keywordArr) {
                            let isKeywordChecked = false
                            for (const desc in craft.description) {
                                const skillDesc = textSanitizer(desc)
                                if (skillDesc.includes(keyword)) {
                                    isKeywordChecked = true
                                    break
                                }
                            }
                            if (!isKeywordChecked) {
                                isAllKeywordChecked = false
                                break
                            }
                        }

                        if (!isAllKeywordChecked) continue
                    }
                }
                if (craft?.tag?.length) result.push(craft.id)
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
                    (isModeSelected && !selectedModes.includes(craft.mode)) ||
                    (isAttrSelected &&
                        !(
                            selectedAttributes.includes(craft.attribute) ||
                            craft?.monster?.some((m: number) =>
                                selectedAttributes.includes(
                                    monsterData.find((md) => m === md.id)
                                        ?.attribute
                                )
                            )
                        )) ||
                    (isRaceSelected &&
                        !(
                            selectedRaces.includes(craft.race) ||
                            craft?.monster?.some((m: number) =>
                                selectedRaces.includes(
                                    monsterData.find((md) => m === md.id)?.race
                                )
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
                        if (!isSkillMatch && keywordArr.length) {
                            let isKeywordChecked = false

                            for (const keyword of keywordArr) {
                                for (const desc in [
                                    ...craft.skill_description,
                                    ...craft.armed_description,
                                ]) {
                                    const skillDesc = textSanitizer(desc)
                                    if (skillDesc.includes(keyword)) {
                                        isKeywordChecked = true
                                        break
                                    }
                                }
                                if (isKeywordChecked) break
                            }

                            if (!isKeywordChecked) continue
                        }
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

                        let isAllKeywordChecked = true
                        for (const keyword of keywordArr) {
                            let isKeywordChecked = false
                            for (const desc in [
                                ...craft.skill_description,
                                ...craft.armed_description,
                            ]) {
                                const skillDesc = textSanitizer(desc)
                                if (skillDesc.includes(keyword)) {
                                    isKeywordChecked = true
                                    break
                                }
                            }
                            if (!isKeywordChecked) {
                                isAllKeywordChecked = false
                                break
                            }
                        }

                        if (!isAllKeywordChecked) continue
                    }
                }
                if (
                    craft?.tag?.length ||
                    craft?.skill_tag?.length ||
                    craft?.armed_tag?.length
                )
                    result.push(craft.id)
            }
        }

        setResultData(result)
        setIsAfterFilter(true)

        const searchParam = {
            skillFunctions: selectedSkillFunctions,
            armedFunctions: selectedArmedFunctions,
            keyword: textSanitizer(keyword).length ? keyword.split(",") : [],
            mode: selectedModes,
            attribute: selectedAttributes,
            race: selectedRaces,
            star: selectedStars,
            charge: selectedCharges,
            genre: selectedGenres,
        }
        setCurrentSearchParam(searchParam)

        setUrlParams({
            skill: encodeMapping(
                craft_skill_type_string,
                selectedSkillFunctions
            ),
            armed: encodeMapping(
                craft_armed_type_string,
                selectedArmedFunctions
            ),
            mode: encodeMapping(craft_mode_type_string, selectedModes),
            attr: encodeMapping(craft_attr_type_string, selectedAttributes),
            race: encodeMapping(craft_race_type_string, selectedRaces),
            star: encodeMapping(
                craft_star_type_string,
                selectedStars.map((s) => s[0])
            ),
            charge: encodeMapping(craft_charge_type_string, selectedCharges),
            genre: encodeMapping(craft_genre_type_string, selectedGenres),
            keyword: textSanitizer(keyword).length
                ? stringToUnicode(textSanitizer(keyword))
                : "",
            or: ["or", "and"].indexOf(andOr).toString(),
        })

        if (loadingParams) removeUrlParams()

        setLoadingParams(false)
    }, [
        andOr,
        keyword,
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

    return (
        <ContextProvider
            toolId='craft-filter'
            toggleButton={toggleButton}
            resetButton={resetButton}
            resetAll={resetAll}
            skillFunctions={selectedSkillFunctions}
            armedFunctions={selectedArmedFunctions}
            keyword={keyword}
            changeKeyword={(value: string) => setKeyword(value)}
            resetKeyword={() => setKeyword("")}
            mode={selectedModes}
            attribute={selectedAttributes}
            race={selectedRaces}
            star={selectedStars}
            charge={selectedCharges}
            genre={selectedGenres}
            andOr={andOr}
            changeAndOr={(value: string) => setAndOr(value)}
            startFilter={startFilter}
        >
            <Header />
            <PageContainer>
                <>
                    <FilterRow
                        title={"龍脈能力"}
                        type={"skillFunctions"}
                        data={craft_skill_type_string}
                    />
                    <FilterRow
                        title={"武裝能力"}
                        type={"armedFunctions"}
                        data={craft_armed_type_string}
                    />
                    <KeywordRow />
                    <FilterRow
                        title={"龍刻模式"}
                        type={"mode"}
                        data={craft_mode_type_string}
                    />
                    <FilterRow
                        title={"裝備屬性"}
                        type={"attribute"}
                        data={craft_attr_type_string}
                    />
                    <FilterRow
                        title={"裝備種族"}
                        type={"race"}
                        data={craft_race_type_string}
                    />
                    <FilterRow
                        title={"龍刻稀有度"}
                        type={"star"}
                        data={craft_star_type_string}
                        btnSuffix={" ★"}
                    />
                    <FilterRow
                        title={"龍刻充能條件"}
                        type={"charge"}
                        data={craft_charge_type_string}
                    />
                    <FilterRow
                        title={"龍刻種類"}
                        type={"genre"}
                        data={craft_genre_type_string}
                    />
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
