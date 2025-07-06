import React, {
    useEffect,
    useRef,
    useState,
    useMemo,
    useCallback,
    useContext,
} from "react"
import _ from "lodash"

import {
    skillFunctionString,
    tagString,
    attrTypeString,
    raceTypeString,
    starTypeString,
    chargeTypeString,
    genreTypeString,
    optionText,
} from "src/constant/filterConstants"
import { monsterData } from "src/constant/monsterData"

import { ContextProvider } from "src/utilities/Context/Context"
import DataContext from "src/utilities/Context/DataContext"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import {
    addAlias,
    checkKeyword,
    decode,
    decodeMapping,
    encode,
    encodeMapping,
    errorAlert,
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
import DurationModal from "src/shared/DurationModal"
import UserDataModal from "src/shared/UserDataModal"
import FixedBoard from "src/shared/FixedBoard"
import DescriptionNote from "src/shared/DescriptionNote"

interface ISkillFilterProps {}

const SkillFilter: React.FC<ISkillFilterProps> = () => {
    const [keyword, setKeyword] = useState<string>("")
    const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
    const [selectedRaces, setSelectedRaces] = useState<string[]>([])
    const [selectedStars, setSelectedStars] = useState<string[]>([])
    const [selectedCharges, setSelectedCharges] = useState<string[]>([])
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [durationObj, setDurationObj] = useState<IObject>({})
    const [sortBy, setSortBy] = useState<string>("id")
    const [andOr, setAndOr] = useState<string>("or")
    const [resultData, setResultData] = useState<IObject[]>([])
    const [resultDataByCharge, setResultDataByCharge] = useState<IObject[]>([])
    const [resultDataCombine, setResultDataCombine] = useState<IObject[]>([])
    const [isAfterFilter, setIsAfterFilter] = useState<boolean>(false)
    const [showNoData, setShowNoData] = useState<boolean>(true)
    const [useInventory, setUseInventory] = useState<boolean>(false)
    const [durationModalOpen, setDurationModalOpen] = useState<boolean>(false)
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
            charge: [selectedCharges, setSelectedCharges],
            genre: [selectedGenres, setSelectedGenres],
            option: [durationObj, setDurationObj],
        }
    }, [
        durationObj,
        selectedAttributes,
        selectedCharges,
        selectedFunctions,
        selectedGenres,
        selectedRaces,
        selectedStars,
        selectedTags,
    ])

    const { Popover, togglePopover, setPopoverContent } = usePopover()

    useEffect(() => {
        setFavIconAndTitle("skill-filter")
        loadUrlParams()
    }, [])

    useEffect(() => {
        if (loadingParams) startFilter()
    }, [loadingParams])

    const loadUrlParams = useCallback(() => {
        const params: IObject = getUrlParams()

        if (!_.isEmpty(params)) {
            const selectedFunction = decodeMapping(
                skillFunctionString,
                params?.search
            )
            setSelectedFunctions(selectedFunction)
            setSelectedAttributes(decodeMapping(attrTypeString, params?.attr))
            setSelectedRaces(decodeMapping(raceTypeString, params?.race))
            setSelectedStars(
                decodeMapping(starTypeString, params?.star).map(
                    (star) => `${star} ★`
                )
            )
            setSelectedTags(decodeMapping(tagString, params?.tag))
            setSelectedCharges(decodeMapping(chargeTypeString, params?.charge))
            setSelectedGenres(decodeMapping(genreTypeString, params?.genre))
            setKeyword(unicodeToString(params?.keyword || ""))
            setAndOr(["or", "and", "m-and"][+params?.genre || 0])

            const durationArr =
                decode(params?.duration)
                    .match(/.{1,3}/g)
                    ?.map((arr) =>
                        arr
                            .split("")
                            .reduce(
                                (acc: string[], cur: string, index: number) => {
                                    if (cur === "1") {
                                        acc = [...acc, optionText[index]]
                                    }
                                    return acc
                                },
                                []
                            )
                    ) || []
            setDurationObj(
                durationArr?.length
                    ? selectedFunction.reduce((acc, cur, index) => {
                          return {
                              ...acc,
                              [cur]: durationArr?.[index],
                          }
                      }, {})
                    : {}
            )

            setLoadingParams(true)
        }
    }, [])

    const toggleDuration = useCallback(
        (func: string, duration: string) => {
            let _duration = durationObj

            if (func in _duration) {
                _duration = {
                    ...durationObj,
                    [func]: durationObj[func].includes(duration)
                        ? durationObj[func].filter(
                              (dur: string) => dur !== duration
                          )
                        : [...durationObj[func], duration],
                }
            } else {
                _duration = {
                    ...durationObj,
                    [func]: [duration],
                }
            }

            setDurationObj(
                Object.fromEntries(
                    Object.entries(_duration).filter(([_, v]) => v.length)
                )
            )
        },
        [durationObj]
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
                let _duration = durationObj
                delete _duration?.[text]

                setDurationObj(_duration)
            }
        },
        [durationObj, toggleValue, typeMap]
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
        const isTagSelected = !!selectedTags.length
        const isAttrSelected = !!selectedAttributes.length
        const isRaceSelected = !!selectedRaces.length
        const isStarSelected = !!selectedStars.length
        const isChargeSelected = !!selectedCharges.length
        const isGenreSelected = !!selectedGenres.length

        let result: IObject[] = []
        let resultByCharge: IObject[] = []
        let resultCombine: IObject[] = []

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

            if (isTagSelected) {
                let hasTag = false

                for (const tag of monster.monsterTag) {
                    if (selectedTags.includes(tag)) {
                        hasTag = true
                        break
                    }
                }

                if (
                    (selectedTags.includes("自家") && !monster.crossOver) ||
                    (selectedTags.includes("合作") && monster.crossOver)
                )
                    hasTag = true

                if (!hasTag) continue
            }

            if (isFunctionSelected || keywordArr.length) {
                let skillIndexArray: number[] = []
                let skillIndexArrayCombine: number[] = []

                if (andOr === "m-and") {
                    // M-AND
                    const allSkillTags = monster.skill.reduce(
                        (acc: IObject[], cur: IObject) => {
                            return acc.concat(cur.tag)
                        },
                        []
                    )

                    const allSkillCharge = monster.skill.map(
                        (skill: IObject) => skill.charge
                    )

                    const allSkillDescription = monster.skill.map(
                        (skill: IObject) => skill.description
                    )

                    if (
                        isChargeSelected &&
                        !selectedCharges.some((charge) =>
                            allSkillCharge.includes(charge)
                        )
                    )
                        continue

                    // Check for skill tags

                    let isMonsterMatch = functionArr.every(
                        (selectedFunction) => {
                            if (selectedFunction in durationObj) {
                                return allSkillTags.some(
                                    (tag: (string | number)[] | string) => {
                                        return (
                                            (tag === selectedFunction ||
                                                tag?.[0] ===
                                                    selectedFunction) &&
                                            ((durationObj[
                                                selectedFunction
                                            ].includes(optionText[0]) &&
                                                (!Array.isArray(tag) ||
                                                    +tag?.[1] === 1)) ||
                                                (durationObj[
                                                    selectedFunction
                                                ].includes(optionText[1]) &&
                                                    +tag?.[1] > 1) ||
                                                (durationObj[
                                                    selectedFunction
                                                ].includes(optionText[2]) &&
                                                    +tag?.[1] === -1) ||
                                                (!durationObj[
                                                    selectedFunction
                                                ].includes(optionText[0]) &&
                                                    !durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[1]) &&
                                                    !durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[2])))
                                        )
                                    }
                                )
                            } else {
                                return allSkillTags.some(
                                    (tag: (string | number)[] | string) =>
                                        tag === selectedFunction ||
                                        tag?.[0] === selectedFunction
                                )
                            }
                        }
                    )
                    if (!isMonsterMatch) continue

                    // Check for keywords
                    if (keywordArr.length) {
                        isMonsterMatch = keywordArr.every((keyword) => {
                            return allSkillDescription.some((desc: string) =>
                                textSanitizer(desc).includes(keyword)
                            )
                        })

                        if (!isMonsterMatch) continue
                    }

                    // All checks are done
                    // Get index of included skill of the monster

                    for (const [
                        monsterSkillIndex,
                        monsterSkill,
                    ] of monster.skill.entries()) {
                        let isMatch = false

                        for (const selectedFunction of functionArr) {
                            if (
                                (selectedFunction in durationObj &&
                                    monsterSkill.tag.some(
                                        (tag: (string | number)[] | string) => {
                                            return (
                                                (tag === selectedFunction ||
                                                    tag?.[0] ===
                                                        selectedFunction) &&
                                                ((durationObj[
                                                    selectedFunction
                                                ].includes(optionText[0]) &&
                                                    (!Array.isArray(tag) ||
                                                        +tag?.[1] === 1)) ||
                                                    (durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[1]) &&
                                                        +tag?.[1] > 1) ||
                                                    (durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[2]) &&
                                                        +tag?.[1] === -1) ||
                                                    (!durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[0]) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        ) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        )))
                                            )
                                        }
                                    )) ||
                                (!(selectedFunction in durationObj) &&
                                    monsterSkill.tag.some(
                                        (tag: (string | number)[] | string) =>
                                            tag === selectedFunction ||
                                            tag?.[0] === selectedFunction
                                    ))
                            ) {
                                let charge =
                                    "reduce" in monsterSkill
                                        ? monsterSkill.num - monsterSkill.reduce
                                        : monsterSkill.num

                                if (monsterSkill.type === "combine")
                                    skillIndexArrayCombine.push(
                                        monsterSkillIndex
                                    )
                                else skillIndexArray.push(monsterSkillIndex)

                                resultByCharge.push({
                                    id: monster.id,
                                    skillIndex: monsterSkillIndex,
                                    charge: charge,
                                })
                                isMatch = true

                                break
                            }
                        }

                        if (!isMatch && keywordArr.length) {
                            if (
                                keywordArr.some((keyword) =>
                                    textSanitizer(
                                        monsterSkill.description
                                    ).includes(keyword)
                                )
                            ) {
                                const charge =
                                    "reduce" in monsterSkill
                                        ? monsterSkill.num - monsterSkill.reduce
                                        : monsterSkill.num

                                if (monsterSkill.type === "combine")
                                    skillIndexArrayCombine.push(
                                        monsterSkillIndex
                                    )
                                else skillIndexArray.push(monsterSkillIndex)

                                resultByCharge.push({
                                    id: monster.id,
                                    skillIndex: monsterSkillIndex,
                                    charge: charge,
                                })
                            }
                        }
                    }
                } else {
                    for (const [
                        monsterSkillIndex,
                        monsterSkill,
                    ] of monster.skill.entries()) {
                        if (
                            isChargeSelected &&
                            !selectedCharges.includes(monsterSkill.charge)
                        )
                            continue

                        if (andOr === "or") {
                            // OR
                            // Check for skill tags
                            let isSkillMatch = false

                            for (const selectedFunction of functionArr) {
                                let isTagChecked = false

                                for (const tag of monsterSkill.tag) {
                                    if (Array.isArray(tag)) {
                                        // Tag with duration mark
                                        if (tag[0] === selectedFunction) {
                                            if (
                                                selectedFunction in durationObj
                                            ) {
                                                if (
                                                    (tag[1] === 1 &&
                                                        durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[0]
                                                        )) ||
                                                    (tag[1] > 1 &&
                                                        durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        )) ||
                                                    (tag[1] === -1 &&
                                                        durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        )) ||
                                                    (!durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[1]) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        ) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        ))
                                                ) {
                                                    isTagChecked = true
                                                }
                                            } else isTagChecked = true
                                        }
                                    } // Tag without duration mark
                                    else {
                                        if (tag === selectedFunction) {
                                            if (
                                                selectedFunction in durationObj
                                            ) {
                                                if (
                                                    durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[0]) ||
                                                    (!durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[0]) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        ) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        ))
                                                ) {
                                                    isTagChecked = true
                                                }
                                            } else isTagChecked = true
                                        }
                                    }

                                    if (isTagChecked) {
                                        isSkillMatch = true
                                        break
                                    }
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
                                let isTagChecked = false
                                for (const tag of monsterSkill.tag) {
                                    if (Array.isArray(tag)) {
                                        if (tag[0] === selectedFunction) {
                                            if (
                                                selectedFunction in durationObj
                                            ) {
                                                if (
                                                    (tag[1] === 1 &&
                                                        durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[0]
                                                        )) ||
                                                    (tag[1] > 1 &&
                                                        durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        )) ||
                                                    (tag[1] === -1 &&
                                                        durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        )) ||
                                                    (!durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[0]) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        ) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        ))
                                                ) {
                                                    isTagChecked = true
                                                    break
                                                }
                                            } else {
                                                isTagChecked = true
                                                break
                                            }
                                        }
                                    } else {
                                        if (tag === selectedFunction) {
                                            if (
                                                selectedFunction in durationObj
                                            ) {
                                                if (
                                                    durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[0]) ||
                                                    (!durationObj[
                                                        selectedFunction
                                                    ].includes(optionText[0]) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[1]
                                                        ) &&
                                                        !durationObj[
                                                            selectedFunction
                                                        ].includes(
                                                            optionText[2]
                                                        ))
                                                ) {
                                                    isTagChecked = true
                                                    break
                                                }
                                            } else {
                                                isTagChecked = true
                                                break
                                            }
                                        }
                                    }
                                }

                                if (!isTagChecked) {
                                    isSkillMatch = false
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

                        const charge =
                            "reduce" in monsterSkill
                                ? monsterSkill.num - monsterSkill.reduce
                                : monsterSkill.num

                        if (monsterSkill.type === "combine")
                            skillIndexArrayCombine.push(monsterSkillIndex)
                        else skillIndexArray.push(monsterSkillIndex)

                        resultByCharge.push({
                            id: monster.id,
                            skillIndex: monsterSkillIndex,
                            charge: charge,
                        })
                    }
                }

                skillIndexArray = _.sortBy(
                    [...new Set(skillIndexArray)],
                    (val) => val
                )
                skillIndexArrayCombine = _.sortBy(
                    [...new Set(skillIndexArrayCombine)],
                    (val) => val
                )

                if (
                    (!isGenreSelected ||
                        selectedGenres.includes(genreTypeString[0])) &&
                    skillIndexArray.length > 0
                )
                    result.push({
                        id: monster.id,
                        attr: monster.attribute,
                        race: monster.race,
                        skillIndexes: skillIndexArray,
                    })

                if (
                    (!isGenreSelected ||
                        selectedGenres.includes(genreTypeString[1])) &&
                    skillIndexArrayCombine.length > 0
                )
                    resultCombine.push({
                        id: monster.id,
                        attr: monster.attribute,
                        race: monster.race,
                        skillIndexes: skillIndexArrayCombine,
                        type: "combine",
                    })
            } else {
                let skillIndexArray = []
                let skillIndexArrayCombine = []

                for (const [
                    monsterSkillIndex,
                    monsterSkill,
                ] of monster.skill.entries()) {
                    if (
                        isChargeSelected &&
                        (!selectedCharges.includes(monsterSkill.charge) ||
                            !monsterSkill.name.length)
                    )
                        continue

                    let charge =
                        "reduce" in monsterSkill
                            ? monsterSkill.num - monsterSkill.reduce
                            : monsterSkill.num

                    if (monsterSkill.type === "combine")
                        skillIndexArrayCombine.push(monsterSkillIndex)
                    else skillIndexArray.push(monsterSkillIndex)

                    resultByCharge.push({
                        id: monster.id,
                        skillIndex: monsterSkillIndex,
                        charge: charge,
                    })
                }

                if (
                    (!isGenreSelected ||
                        selectedGenres.includes(genreTypeString[0])) &&
                    skillIndexArray.length > 0
                )
                    result.push({
                        id: monster.id,
                        attr: monster.attribute,
                        race: monster.race,
                        skillIndexes: skillIndexArray,
                    })

                if (
                    (!isGenreSelected ||
                        selectedGenres.includes(genreTypeString[1])) &&
                    skillIndexArrayCombine.length > 0
                )
                    resultCombine.push({
                        id: monster.id,
                        attr: monster.attribute,
                        race: monster.race,
                        skillIndexes: skillIndexArrayCombine,
                        type: "combine",
                    })
            }
        }
        setResultData(result)
        setResultDataByCharge(resultByCharge)
        setResultDataCombine(resultCombine)
        setIsAfterFilter(true)

        const searchParam = {
            functions: selectedFunctions.reduce((acc, cur) => {
                return {
                    ...acc,
                    [cur]: cur in durationObj ? durationObj[cur] : [],
                }
            }, []),
            keyword: textSanitizer(keyword).length ? keyword.split(",") : [],
            attribute: selectedAttributes,
            race: selectedRaces,
            star: selectedStars,
            tag: selectedTags,
            charge: selectedCharges,
            genre: selectedGenres,
        }
        setCurrentSearchParam(searchParam)

        setUrlParams({
            search: encodeMapping(skillFunctionString, selectedFunctions),
            attr: encodeMapping(attrTypeString, selectedAttributes),
            race: encodeMapping(raceTypeString, selectedRaces),
            star: encodeMapping(
                starTypeString,
                selectedStars.map((s) => s[0])
            ),
            tag: encodeMapping(tagString, selectedTags),
            charge: encodeMapping(chargeTypeString, selectedCharges),
            genre: encodeMapping(genreTypeString, selectedGenres),
            keyword: textSanitizer(keyword).length
                ? stringToUnicode(textSanitizer(keyword))
                : "",
            or: ["or", "and", "m-and"].indexOf(andOr).toString(),
            duration: encode(
                skillFunctionString
                    .flat()
                    .reduce((acc: string, cur: string) => {
                        if (Object.keys(durationObj).includes(cur)) {
                            return acc.concat(
                                optionText
                                    .map((opt) =>
                                        durationObj[cur].includes(opt)
                                            ? "1"
                                            : "0"
                                    )
                                    .join("")
                            )
                        } else if (selectedFunctions.includes(cur)) {
                            return acc + "000"
                        }
                        return acc
                    }, "")
            ),
        })

        if (loadingParams) removeUrlParams()

        setLoadingParams(false)
    }, [
        andOr,
        durationObj,
        keyword,
        loadingParams,
        selectedAttributes,
        selectedCharges,
        selectedFunctions,
        selectedGenres,
        selectedRaces,
        selectedStars,
        selectedTags,
    ])

    const openDurationModal = useCallback(() => {
        if (!selectedFunctions.length) {
            errorAlert(2)
            return
        }
        setDurationModalOpen(true)
    }, [selectedFunctions.length])

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
            toolId='skill-filter'
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
            charge={selectedCharges}
            genre={selectedGenres}
            sortBy={sortBy}
            changeSortBy={(value: string) => setSortBy(value)}
            andOr={andOr}
            changeAndOr={(value: string) => setAndOr(value)}
            startFilter={startFilter}
            showNoData={showNoData}
            toggleShowNoData={() => setShowNoData(!showNoData)}
            useInventory={useInventory}
            toggleUseInventory={() => {
                if (playerData?.uid) setUseInventory(!useInventory)
                else errorAlert(6)
            }}
        >
            <Header />
            <PageContainer
                openDurationModal={openDurationModal}
                openUserDataModal={openUserDataModal}
            >
                <>
                    <FilterRow
                        title={"功能"}
                        type={"functions"}
                        data={skillFunctionString}
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
                    <FilterRow
                        title={"技能累積方式"}
                        type={"charge"}
                        data={chargeTypeString}
                    />
                    <FilterRow
                        title={"技能種類"}
                        type={"genre"}
                        data={genreTypeString}
                    />
                    <div ref={resultRef}>
                        {isAfterFilter ? (
                            <ResultRow
                                resultData={resultData}
                                resultDataByCharge={resultDataByCharge}
                                resultDataCombine={resultDataCombine}
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
            <DurationModal
                open={durationModalOpen}
                onClose={() => setDurationModalOpen(false)}
                durationObj={durationObj}
                toggleDuration={toggleDuration}
            />
            <UserDataModal
                open={userDataModalOpen}
                onClose={() => setUserDataModalOpen(false)}
            />
            <Popover />
            <FixedBoard />
            <DescriptionNote />
        </ContextProvider>
    )
}

export default SkillFilter
