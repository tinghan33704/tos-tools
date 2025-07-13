import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react"
import _ from "lodash"

import {
    leaderSkillFunctionString,
    attrTypeString,
    raceTypeString,
    starTypeString,
    tagString,
    leaderSkillObjectString,
} from "src/constant/filterConstants"
import { leaderSkillData } from "src/constant/leaderData"

import { ContextProvider } from "src/utilities/Context/Context"
import DataContext from "src/utilities/Context/DataContext"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import {
    addAlias,
    checkKeyword,
    decodeMapping,
    encodeMapping,
    errorAlert,
    getMonsterById,
    getUrlParams,
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
import KeywordRow from "src/shared/KeywordRow"
import ResultRow from "src/shared/ResultRow"
import ObjectiveModal from "src/shared/ObjectiveModal"
import UserDataModal from "src/shared/UserDataModal"

interface ILeaderSkillFilterProps {}

const LeaderSkillFilter: React.FC<ILeaderSkillFilterProps> = () => {
    const [keyword, setKeyword] = useState<string>("")
    const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedStars, setSelectedStars] = useState<string[]>([])
    const [objectiveObj, setObjectiveObj] = useState<IObject>({})
    const [activateObj, setActivateObj] = useState<IObject>({})
    const [andOr, setAndOr] = useState<string>("or")
    const [resultData, setResultData] = useState<IObject[]>([])
    const [resultDataChange, setResultDataChange] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [useInventory, setUseInventory] = useState<boolean>(false)
    const [objectiveModalOpen, setObjectiveModalOpen] = useState<boolean>(false)
    const [userDataModalOpen, setUserDataModalOpen] = useState<boolean>(false)
    const [currentSearchParam, setCurrentSearchParam] = useState<IObject>({})
    const [loadingParams, setLoadingParams] = useState(false)

    const resultRef = useRef<HTMLDivElement>(null)

    const { playerData } = useContext(DataContext)

    const typeMap: Record<string, any[]> = useMemo(() => {
        return {
            functions: [selectedFunctions, setSelectedFunctions],
            tag: [selectedTags, setSelectedTags],
            attribute: [selectedAttributes, setSelectedAttributes],
            race: [selectedRaces, setSelectedRaces],
            star: [selectedStars, setSelectedStars],
        }
    }, [
        selectedAttributes,
        selectedFunctions,
        selectedRaces,
        selectedStars,
        selectedTags,
    ])

    const { Popover, togglePopover, setPopoverContent } = usePopover()

    useEffect(() => {
        setFavIconAndTitle("leader-skill-filter")
        loadUrlParams()
    }, [])

    useEffect(() => {
        if (loadingParams) startFilter()
    }, [loadingParams])

    const loadUrlParams = useCallback(() => {
        const params: IObject = getUrlParams()

        if (!_.isEmpty(params)) {
            setSelectedFunctions(
                decodeMapping(leaderSkillFunctionString, params?.search)
            )
            setSelectedAttributes(decodeMapping(attrTypeString, params?.attr))
            setSelectedRaces(decodeMapping(raceTypeString, params?.race))
            setSelectedStars(
                decodeMapping(starTypeString, params?.star).map(
                    (star) => `${star} ★`
                )
            )
            setSelectedTags(decodeMapping(tagString, params?.tag))
            setKeyword(unicodeToString(params?.keyword || ""))
            setAndOr(["or", "and"][+params?.or || 0])

            setLoadingParams(true)
        }
    }, [])

    const toggleObjective = useCallback(
        (func: string, attribute: string, race: string, all?: boolean) => {
            let _objective = { ...objectiveObj }

            if (all) {
                // clicking on the attribute/race text to select the whole column/row
                const attrTypeStr = attrTypeString
                const raceTypeStr = raceTypeString
                    .slice(0, 7)
                    .map((str) => str[0])

                if (attribute) {
                    raceTypeStr.forEach((race) => {
                        const objectiveStr = `${attribute}${race}`
                        _objective = {
                            ..._objective,
                            [func]:
                                func in _objective
                                    ? _objective[func].includes(objectiveStr)
                                        ? _objective[func].filter(
                                              (dur: string) =>
                                                  dur !== objectiveStr
                                          )
                                        : [..._objective[func], objectiveStr]
                                    : [objectiveStr],
                        }
                    })
                } else if (race) {
                    attrTypeStr.forEach((attribute) => {
                        const objectiveStr = `${attribute}${race}`
                        _objective = {
                            ..._objective,
                            [func]:
                                func in _objective
                                    ? _objective[func].includes(objectiveStr)
                                        ? _objective[func].filter(
                                              (dur: string) =>
                                                  dur !== objectiveStr
                                          )
                                        : [..._objective[func], objectiveStr]
                                    : [objectiveStr],
                        }
                    })
                }
            } else {
                const objectiveStr = `${attribute}${race}`

                _objective = {
                    ..._objective,
                    [func]:
                        func in _objective
                            ? _objective[func].includes(objectiveStr)
                                ? _objective[func].filter(
                                      (dur: string) => dur !== objectiveStr
                                  )
                                : [..._objective[func], objectiveStr]
                            : [objectiveStr],
                }
            }

            setObjectiveObj(_objective)
        },
        [objectiveObj]
    )

    const toggleActivate = useCallback(
        (func: string, activate: string) => {
            let _activate = { ...activateObj }

            _activate = {
                ...activateObj,
                [func]:
                    func in _activate
                        ? activateObj[func].includes(activate)
                            ? activateObj[func].filter(
                                  (dur: string) => dur !== activate
                              )
                            : [...activateObj[func], activate]
                        : [activate],
            }

            setActivateObj(_activate)
        },
        [activateObj]
    )

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

            if (type === "functions" && value) {
                let _objective = objectiveObj
                delete _objective?.[text]
                let _activate = activateObj
                delete _activate?.[text]

                setObjectiveObj(_objective)
                setActivateObj(_activate)
            }
        },
        [activateObj, objectiveObj, toggleValue, typeMap]
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
        setKeyword("")
    }, [resetButton, typeMap])

    const startFilter = useCallback(() => {
        const keywordArr: string[] = checkKeyword(keyword)
        const aliasArr = addAlias(selectedFunctions, keywordArr)
        const functionArr = [...new Set([...selectedFunctions, ...aliasArr])]

        const isFunctionSelected = !!selectedFunctions.length
        const isTagSelected = !!selectedTags.length
        const isAttrSelected = !!selectedAttributes.length
        const isRaceSelected = !!selectedRaces.length
        const isStarSelected = !!selectedStars.length

        let result: IObject[] = []

        for (const skill of leaderSkillData) {
            const tagArr = skill?.tag || []
            const monsterArr = skill?.monster || []

            if (isFunctionSelected || keywordArr.length) {
                if (andOr === "or") {
                    let isSkillMatch = false

                    for (const func of functionArr) {
                        if (
                            tagArr.some(
                                (tag: IObject) =>
                                    tag?.name === func ||
                                    tag?.name.includes(func)
                            )
                        ) {
                            if (
                                objectiveObj?.[func]?.length &&
                                activateObj?.[func]?.length
                            ) {
                                const funcArr = tagArr.filter(
                                    (tag: IObject) =>
                                        tag?.name === func ||
                                        tag?.name.includes(func)
                                )
                                for (const attrRace of objectiveObj[func]) {
                                    if (
                                        (!leaderSkillObjectString.includes(
                                            attrRace
                                        ) &&
                                            funcArr.some(
                                                (feat: IObject) =>
                                                    !feat?.object?.length ||
                                                    feat?.object?.includes(
                                                        attrRace
                                                    ) ||
                                                    feat?.object?.includes(
                                                        attrRace?.[0]
                                                    ) ||
                                                    feat?.object?.includes(
                                                        attrRace?.[1]
                                                    )
                                            )) ||
                                        (leaderSkillObjectString?.includes(
                                            attrRace
                                        ) &&
                                            funcArr.some((feat: IObject) =>
                                                feat?.object?.includes(attrRace)
                                            ))
                                    ) {
                                        const targetItems = funcArr.filter(
                                            (feat: IObject) =>
                                                feat?.object?.includes(
                                                    attrRace
                                                ) ||
                                                feat?.object?.includes(
                                                    attrRace?.[0]
                                                ) ||
                                                feat?.object?.includes(
                                                    attrRace?.[1]
                                                )
                                        )

                                        for (const activateOption of activateObj[
                                            func
                                        ]) {
                                            if (
                                                targetItems.some(
                                                    (item: IObject) =>
                                                        activateOption === "無"
                                                            ? !item?.limit
                                                                  ?.length
                                                            : item?.limit?.includes(
                                                                  activateOption
                                                              )
                                                )
                                            ) {
                                                isSkillMatch = true
                                                break
                                            }
                                        }
                                        if (isSkillMatch) break
                                    }
                                }
                            } else if (objectiveObj?.[func]?.length) {
                                const funcArr = tagArr.filter(
                                    (tag: IObject) =>
                                        tag?.name === func ||
                                        tag?.name?.includes(func)
                                )

                                for (const attrRace of objectiveObj[func]) {
                                    if (
                                        (!leaderSkillObjectString.includes(
                                            attrRace
                                        ) &&
                                            funcArr.some(
                                                (feat: IObject) =>
                                                    !feat?.object?.length ||
                                                    feat?.object?.includes(
                                                        attrRace
                                                    ) ||
                                                    feat?.object?.includes(
                                                        attrRace?.[0]
                                                    ) ||
                                                    feat?.object?.includes(
                                                        attrRace?.[1]
                                                    )
                                            )) ||
                                        (leaderSkillObjectString.includes(
                                            attrRace
                                        ) &&
                                            funcArr.some((feat: IObject) =>
                                                feat?.object?.includes(attrRace)
                                            ))
                                    ) {
                                        isSkillMatch = true
                                        break
                                    }
                                }
                            } else if (activateObj?.[func]?.length) {
                                const funcArr = tagArr.filter(
                                    (tag: IObject) =>
                                        tag?.name === func ||
                                        tag?.name?.includes(func)
                                )

                                for (const activateOption of activateObj[
                                    func
                                ]) {
                                    if (
                                        funcArr.some((feat: IObject) =>
                                            activateOption === "無"
                                                ? !feat?.limit?.length
                                                : feat?.limit?.includes(
                                                      activateOption
                                                  )
                                        )
                                    ) {
                                        isSkillMatch = true
                                        break
                                    }
                                }
                            } else {
                                isSkillMatch = true
                                break
                            }
                        }
                    }
                    if (!isSkillMatch && !keywordArr.length) continue

                    // Check for keywords

                    if (!isSkillMatch && keywordArr.length > 0) {
                        let isKeywordChecked = false
                        const skillDesc = textSanitizer(skill.description)

                        for (const keyword of keywordArr) {
                            if (skillDesc.includes(keyword)) {
                                isKeywordChecked = true
                                break
                            }
                        }

                        if (!isKeywordChecked) continue
                    }

                    for (const monsterId of monsterArr) {
                        const monster = getMonsterById(monsterId)

                        if (
                            !monster?.star ||
                            monster?.star <= 0 ||
                            (isAttrSelected &&
                                !selectedAttributes.includes(
                                    monster?.attribute
                                )) ||
                            (isRaceSelected &&
                                !selectedRaces.includes(monster?.race)) ||
                            (isStarSelected &&
                                !selectedStars
                                    .map((s) => +s[0])
                                    .includes(monster?.star))
                        )
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
                                (selectedTags.includes("自家") &&
                                    !monster?.crossOver) ||
                                (selectedTags.includes("合作") &&
                                    monster?.crossOver)
                            )
                                hasTag = true

                            if (!hasTag) continue
                        }

                        result.push({
                            id: monster.id,
                            skill: {
                                name: skill?.name,
                                description: skill?.description,
                                changedSkill: skill?.changedSkill || false,
                                type: "normal",
                            },
                            skillIndex: 0,
                        })
                    }
                } else if (andOr === "and") {
                    let isSkillMatch = true

                    for (const func of functionArr) {
                        if (
                            !tagArr.some(
                                (tag: IObject) =>
                                    tag?.name === func ||
                                    tag?.name.includes(func)
                            )
                        ) {
                            isSkillMatch = false
                            break
                        } else {
                            if (
                                objectiveObj?.[func]?.length &&
                                activateObj?.[func]?.length
                            ) {
                                const funcArr = tagArr.filter(
                                    (tag: IObject) =>
                                        tag?.name === func ||
                                        tag?.name.includes(func)
                                )
                                for (const attrRace of objectiveObj[func]) {
                                    if (
                                        (!leaderSkillObjectString.includes(
                                            attrRace
                                        ) &&
                                            funcArr.some(
                                                (feat: IObject) =>
                                                    !feat?.object?.length ||
                                                    feat?.object?.includes(
                                                        attrRace
                                                    ) ||
                                                    feat?.object?.includes(
                                                        attrRace?.[0]
                                                    ) ||
                                                    feat?.object?.includes(
                                                        attrRace?.[1]
                                                    )
                                            )) ||
                                        (leaderSkillObjectString?.includes(
                                            attrRace
                                        ) &&
                                            funcArr.some((feat: IObject) =>
                                                feat?.object?.includes(attrRace)
                                            ))
                                    ) {
                                        const targetItems = funcArr.filter(
                                            (feat: IObject) =>
                                                feat?.object?.includes(
                                                    attrRace
                                                ) ||
                                                feat?.object?.includes(
                                                    attrRace?.[0]
                                                ) ||
                                                feat?.object?.includes(
                                                    attrRace?.[1]
                                                )
                                        )

                                        for (const activateOption of activateObj[
                                            func
                                        ]) {
                                            if (
                                                !targetItems.some(
                                                    (item: IObject) =>
                                                        item?.limit?.includes(
                                                            activateOption
                                                        )
                                                )
                                            ) {
                                                isSkillMatch = false
                                                break
                                            }
                                        }
                                        if (!isSkillMatch) break
                                    }
                                }
                            } else if (objectiveObj?.[func]?.length) {
                                const funcArr = tagArr.filter(
                                    (tag: IObject) =>
                                        tag?.name === func ||
                                        tag?.name?.includes(func)
                                )

                                for (const attrRace of objectiveObj[func]) {
                                    if (
                                        !(
                                            (!leaderSkillObjectString.includes(
                                                attrRace
                                            ) &&
                                                funcArr.some(
                                                    (feat: IObject) =>
                                                        !feat?.object?.length ||
                                                        feat?.object?.includes(
                                                            attrRace
                                                        ) ||
                                                        feat?.object?.includes(
                                                            attrRace?.[0]
                                                        ) ||
                                                        feat?.object?.includes(
                                                            attrRace?.[1]
                                                        )
                                                )) ||
                                            (leaderSkillObjectString.includes(
                                                attrRace
                                            ) &&
                                                funcArr.some((feat: IObject) =>
                                                    feat?.object?.includes(
                                                        attrRace
                                                    )
                                                ))
                                        )
                                    ) {
                                        isSkillMatch = false
                                        break
                                    }
                                }
                            } else if (activateObj?.[func]?.length) {
                                const funcArr = tagArr.filter(
                                    (tag: IObject) =>
                                        tag?.name === func ||
                                        tag?.name?.includes(func)
                                )

                                for (const activateOption of activateObj[
                                    func
                                ]) {
                                    if (
                                        !funcArr.some((feat: IObject) =>
                                            activateOption === "無"
                                                ? !feat?.limit?.length
                                                : feat?.limit?.includes(
                                                      activateOption
                                                  )
                                        )
                                    ) {
                                        isSkillMatch = false
                                        break
                                    }
                                }
                            }

                            if (!isSkillMatch) break
                        }
                    }

                    if (!isSkillMatch) continue

                    // Check for keywords

                    if (keywordArr.length > 0) {
                        let isKeywordChecked = true
                        const skillDesc = textSanitizer(skill.description)

                        for (const keyword of keywordArr) {
                            if (!skillDesc.includes(keyword)) {
                                isKeywordChecked = false
                                break
                            }
                        }

                        if (!isKeywordChecked) continue
                    }

                    for (const monsterId of monsterArr) {
                        const monster = getMonsterById(monsterId)

                        if (
                            !monster?.star ||
                            monster?.star <= 0 ||
                            (isAttrSelected &&
                                !selectedAttributes.includes(
                                    monster?.attribute
                                )) ||
                            (isRaceSelected &&
                                !selectedRaces.includes(monster?.race)) ||
                            (isStarSelected &&
                                !selectedStars
                                    .map((s) => +s[0])
                                    .includes(monster?.star))
                        )
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
                                (selectedTags.includes("自家") &&
                                    !monster?.crossOver) ||
                                (selectedTags.includes("合作") &&
                                    monster?.crossOver)
                            )
                                hasTag = true

                            if (!hasTag) continue
                        }

                        result.push({
                            id: monster.id,
                            skill: {
                                name: skill?.name,
                                description: skill?.description,
                                changedSkill: skill?.changedSkill || false,
                                type: "normal",
                            },
                            skillIndex: 0,
                        })
                    }
                }
            } else {
                for (const monsterId of monsterArr) {
                    const monster = getMonsterById(monsterId)

                    if (
                        !monster?.star ||
                        monster?.star <= 0 ||
                        (isAttrSelected &&
                            !selectedAttributes.includes(monster?.attribute)) ||
                        (isRaceSelected &&
                            !selectedRaces.includes(monster?.race)) ||
                        (isStarSelected &&
                            !selectedStars
                                .map((s) => +s[0])
                                .includes(monster?.star))
                    )
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
                            (selectedTags.includes("自家") &&
                                !monster?.crossOver) ||
                            (selectedTags.includes("合作") &&
                                monster?.crossOver)
                        )
                            hasTag = true

                        if (!hasTag) continue
                    }

                    result.push({
                        id: monster.id,
                        skill: {
                            name: skill?.name,
                            description: skill?.description,
                            changedSkill: skill?.changedSkill || false,
                            type: "normal",
                        },
                        skillIndex: 0,
                    })
                }
            }
        }

        setResultData(result.filter((skill) => !skill?.skill?.changedSkill))
        setResultDataChange(
            result.filter((skill) => skill?.skill?.changedSkill)
        )
        setIsAfterFilter(true)

        const searchParam = {
            functions: selectedFunctions,
            keyword: textSanitizer(keyword).length ? keyword.split(",") : [],
            attribute: selectedAttributes,
            race: selectedRaces,
            star: selectedStars,
            tag: selectedTags,
        }
        setCurrentSearchParam(searchParam)

        setUrlParams({
            search: encodeMapping(leaderSkillFunctionString, selectedFunctions),
            attr: encodeMapping(attrTypeString, selectedAttributes),
            race: encodeMapping(raceTypeString, selectedRaces),
            star: encodeMapping(
                starTypeString,
                selectedStars.map((s) => s[0])
            ),
            tag: encodeMapping(tagString, selectedTags),
            keyword: textSanitizer(keyword).length
                ? stringToUnicode(textSanitizer(keyword))
                : "",
            or: ["or", "and"].indexOf(andOr).toString(),
        })

        if (loadingParams) removeUrlParams()

        setLoadingParams(false)
    }, [
        activateObj,
        andOr,
        keyword,
        loadingParams,
        objectiveObj,
        selectedAttributes,
        selectedFunctions,
        selectedRaces,
        selectedStars,
        selectedTags,
    ])

    const openObjectiveModal = useCallback(() => {
        if (!selectedFunctions.length) {
            errorAlert(2)
            return
        }
        setObjectiveModalOpen(true)
    }, [selectedFunctions])

    const openUserDataModal = useCallback(() => {
        setUserDataModalOpen(true)
    }, [])

    useEffect(() => {
        isAfterFilter &&
            resultRef?.current &&
            resultRef.current.scrollIntoView(true)
    }, [isAfterFilter, resultData])

    return (
        <ContextProvider
            toolId='leader-skill-filter'
            toggleButton={toggleButton}
            resetButton={resetButton}
            resetAll={resetAll}
            functions={selectedFunctions}
            keyword={keyword}
            changeKeyword={(value: string) => setKeyword(value)}
            resetKeyword={() => setKeyword("")}
            tag={selectedTags}
            attribute={selectedAttributes}
            race={selectedRaces}
            star={selectedStars}
            andOr={andOr}
            changeAndOr={(value: string) => setAndOr(value)}
            startFilter={startFilter}
            useInventory={useInventory}
            toggleUseInventory={() => {
                if (playerData?.uid) setUseInventory(!useInventory)
                else errorAlert(6)
            }}
        >
            <Header />
            <PageContainer
                openObjectiveModal={openObjectiveModal}
                openUserDataModal={openUserDataModal}
            >
                <>
                    <FilterRow
                        title={"功能"}
                        type={"functions"}
                        data={leaderSkillFunctionString}
                    />
                    <KeywordRow />
                    <FilterRow
                        title={"召喚獸標籤"}
                        type={"tag"}
                        data={tagString}
                        collapsible
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
                                resultDataCombine={resultDataChange}
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
            <ObjectiveModal
                open={objectiveModalOpen}
                onClose={() => setObjectiveModalOpen(false)}
                objectiveObj={objectiveObj}
                toggleObjective={toggleObjective}
                activateObj={activateObj}
                toggleActivate={toggleActivate}
            />
            <UserDataModal
                open={userDataModalOpen}
                onClose={() => setUserDataModalOpen(false)}
            />
            <Popover />
        </ContextProvider>
    )
}

export default LeaderSkillFilter
