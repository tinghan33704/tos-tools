import React, { useEffect, useRef, useState, useMemo, useCallback } from "react"
import _ from "lodash"

import {
    teamSkillFunctionString,
    teamSkillActivateString,
    attrTypeString,
    raceTypeString,
    starTypeString,
} from "src/constant/filterConstants"

import { ContextProvider } from "src/utilities/Context/Context"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import { monsterData } from "src/constant/monsterData"
import {
    addAlias,
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
import { usePopover } from "src/hook/usePopover"

interface ITeamSkillFilterProps {}

const TeamSkillFilter: React.FC<ITeamSkillFilterProps> = () => {
    const [keyword, setKeyword] = useState<string>("")
    const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
    const [selectedActivate, setSelectedActivate] = useState<string[]>([])
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedStars, setSelectedStars] = useState<string[]>([])
    const [andOr, setAndOr] = useState<string>("or")
    const [resultData, setResultData] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [currentSearchParam, setCurrentSearchParam] = useState<IObject>({})
    const [resultView, setResultView] = useState<string>("table")
    const [loadingParams, setLoadingParams] = useState(false)

    const resultRef = useRef<HTMLDivElement>(null)

    const typeMap: Record<string, any[]> = useMemo(() => {
        return {
            functions: [selectedFunctions, setSelectedFunctions],
            activate: [selectedActivate, setSelectedActivate],
            attribute: [selectedAttributes, setSelectedAttributes],
            race: [selectedRaces, setSelectedRaces],
            star: [selectedStars, setSelectedStars],
        }
    }, [
        selectedActivate,
        selectedAttributes,
        selectedFunctions,
        selectedRaces,
        selectedStars,
    ])

    const { Popover, togglePopover, setPopoverContent } = usePopover()

    useEffect(() => {
        setFavIconAndTitle("team-skill-filter")
        loadUrlParams()
    }, [])

    useEffect(() => {
        if (loadingParams) startFilter()
    }, [loadingParams])

    const loadUrlParams = useCallback(() => {
        const params: IObject = getUrlParams()

        if (!_.isEmpty(params)) {
            setSelectedFunctions(
                decodeMapping(teamSkillFunctionString, params?.search)
            )
            setSelectedActivate(
                decodeMapping(teamSkillActivateString, params?.act)
            )
            setSelectedAttributes(decodeMapping(attrTypeString, params?.attr))
            setSelectedRaces(decodeMapping(raceTypeString, params?.race))
            setSelectedStars(
                decodeMapping(starTypeString, params?.star).map(
                    (star) => `${star} ★`
                )
            )
            setKeyword(unicodeToString(params?.keyword || ""))
            setAndOr(["or", "and"][+params?.genre || 0])

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
        const aliasArr = addAlias(selectedFunctions, keywordArr)
        const functionArr = [...new Set([...selectedFunctions, ...aliasArr])]

        const isFunctionSelected = !!selectedFunctions.length
        const isAttrSelected = !!selectedAttributes.length
        const isRaceSelected = !!selectedRaces.length
        const isStarSelected = !!selectedStars.length
        const isActivateSelected = !!selectedActivate.length

        let result: IObject[] = []

        for (const monster of monsterData) {
            if (
                !monster.star ||
                monster.star <= 0 ||
                (isAttrSelected &&
                    !selectedAttributes.includes(monster.attribute)) ||
                (isRaceSelected && !selectedRaces.includes(monster.race)) ||
                (isStarSelected &&
                    !selectedStars.map((s) => +s[0]).includes(monster.star))
            )
                continue

            if (isFunctionSelected || keywordArr.length) {
                let skillIndexArray: number[] = []

                for (const [
                    monsterSkillIndex,
                    monsterSkill,
                ] of monster.teamSkill.entries()) {
                    if (
                        isActivateSelected &&
                        !selectedActivate.some((actv) =>
                            monsterSkill.activate_tag.includes(actv)
                        )
                    )
                        continue

                    if (andOr === "or") {
                        // OR
                        // Check for skill tags
                        let isSkillMatch = false

                        for (const selectedFunction of functionArr) {
                            if (
                                monsterSkill.skill_tag.includes(
                                    selectedFunction
                                )
                            ) {
                                isSkillMatch = true
                                break
                            }
                        }

                        if (!isSkillMatch && !keywordArr.length) continue

                        // Check for keywords

                        if (!isSkillMatch && keywordArr.length > 0) {
                            let isKeywordChecked = false
                            const skillDesc = textSanitizer(
                                monsterSkill.description
                            )

                            for (const keyword of keywordArr) {
                                if (skillDesc.includes(keyword)) {
                                    isKeywordChecked = true
                                    break
                                }
                            }

                            if (!isKeywordChecked) continue
                        }
                    } else if (andOr === "and") {
                        // AND
                        // Check for skill tags
                        let isSkillMatch = true

                        for (const selectedFunction of functionArr) {
                            if (
                                !monsterSkill.skill_tag.includes(
                                    selectedFunction
                                )
                            ) {
                                isSkillMatch = false
                                break
                            }
                        }

                        if (!isSkillMatch) continue

                        // Check for keywords
                        if (keywordArr.length > 0) {
                            let isKeywordChecked = true
                            const skillDesc = textSanitizer(
                                monsterSkill.description
                            )

                            for (const keyword of keywordArr) {
                                if (!skillDesc.includes(keyword)) {
                                    isKeywordChecked = false
                                    break
                                }
                            }

                            if (!isKeywordChecked) continue
                        }
                    }
                    skillIndexArray.push(monsterSkillIndex)
                }

                skillIndexArray = _.sortBy(
                    [...new Set(skillIndexArray)],
                    (val) => val
                )

                if (skillIndexArray?.length)
                    result.push({
                        id: monster.id,
                        attr: monster.attribute,
                        race: monster.race,
                        skillIndexes: skillIndexArray,
                    })
            } else {
                let skillIndexArray = []

                for (const [
                    monsterSkillIndex,
                    monsterSkill,
                ] of monster.teamSkill.entries()) {
                    if (
                        isActivateSelected &&
                        !selectedActivate.some((actv) =>
                            monsterSkill.activate_tag.includes(actv)
                        )
                    )
                        continue

                    skillIndexArray.push(monsterSkillIndex)

                    if (skillIndexArray?.length)
                        result.push({
                            id: monster.id,
                            attr: monster.attribute,
                            race: monster.race,
                            skillIndexes: skillIndexArray,
                        })
                }
            }
        }
        setResultData(result)
        setIsAfterFilter(true)

        const searchParam = {
            functions: selectedFunctions,
            keyword: textSanitizer(keyword).length ? keyword.split(",") : [],
            activate: selectedActivate,
            attribute: selectedAttributes,
            race: selectedRaces,
            star: selectedStars,
        }
        setCurrentSearchParam(searchParam)

        setUrlParams({
            search: encodeMapping(teamSkillFunctionString, selectedFunctions),
            act: encodeMapping(teamSkillActivateString, selectedActivate),
            attr: encodeMapping(attrTypeString, selectedAttributes),
            race: encodeMapping(raceTypeString, selectedRaces),
            star: encodeMapping(
                starTypeString,
                selectedStars.map((s) => s[0])
            ),
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
        selectedActivate,
        selectedAttributes,
        selectedFunctions,
        selectedRaces,
        selectedStars,
    ])

    useEffect(() => {
        isAfterFilter &&
            resultRef?.current &&
            resultRef.current.scrollIntoView(true)
    }, [isAfterFilter, resultData])

    return (
        <ContextProvider
            toolId='team-skill-filter'
            toggleButton={toggleButton}
            resetButton={resetButton}
            resetAll={resetAll}
            functions={selectedFunctions}
            keyword={keyword}
            changeKeyword={(value: string) => setKeyword(value)}
            resetKeyword={() => setKeyword("")}
            attribute={selectedAttributes}
            activate={selectedActivate}
            race={selectedRaces}
            star={selectedStars}
            andOr={andOr}
            changeAndOr={(value: string) => setAndOr(value)}
            startFilter={startFilter}
            resultView={resultView}
            toggleResultView={() =>
                setResultView(resultView === "table" ? "summary" : "table")
            }
        >
            <Header />
            <PageContainer>
                <>
                    <FilterRow
                        title={"功能"}
                        type={"functions"}
                        data={teamSkillFunctionString}
                    />
                    <KeywordRow />
                    <FilterRow
                        title={"發動條件"}
                        type={"activate"}
                        data={teamSkillActivateString}
                    />
                    <FilterRow
                        title={"召喚獸屬性"}
                        type={"attribute"}
                        data={attrTypeString}
                    />
                    <FilterRow
                        title={"召喚獸種族"}
                        type={"race"}
                        data={raceTypeString}
                    />
                    <FilterRow
                        title={"召喚獸稀有度"}
                        type={"star"}
                        data={starTypeString}
                        btnSuffix={" ★"}
                    />
                    <div ref={resultRef}>
                        {isAfterFilter ? (
                            <ResultRow
                                resultData={resultData}
                                searchParam={currentSearchParam}
                                noImagePopover={true}
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

export default TeamSkillFilter
