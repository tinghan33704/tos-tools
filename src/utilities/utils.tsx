import axios from "axios"
import _ from "lodash"

import { armedCraftData } from "src/constant/armedCraftData"
import { craftData } from "src/constant/craftData"
import {
    inputMaxLength,
    myAuth,
    skillAlias,
} from "src/constant/filterConstants"
import { monsterData } from "src/constant/monsterData"

/* prettier-ignore */
const encodeChart = [
    '0','1','2','3','4','5','6','7','8','9',
    'a','b','c','d','e','f','g','h','i','j',
    'k','l','m','n','o','p','q','r','s','t',
    'u','v','w','x','y','z','A','B','C','D',
    'E','F','G','H','I','J','K','L','M','N',
    'O','P','Q','R','S','T','U','V','W','X',
    'Y','Z','+','-'
]

export const getMonsterById = (id: number) => {
    return monsterData.find((monster) => monster?.id === id) ?? {}
}

export const getCraftById = (id: number) => {
    return (
        [...craftData, ...armedCraftData].find((craft) => craft?.id === id) ??
        {}
    )
}

export const paddingZeros = (str: string | number, padCount: number) => {
    const _str = str.toString()
    return _str.length < padCount
        ? "0".repeat(padCount - _str.length) + _str
        : _str
}

export const textSanitizer = (text: string) => {
    return text
        .replace(/<board\s*(\d*)>([\S\s]*?)<\/board>/g, `$2`)
        .replace(/<span([\S\s]*?)>([\S\s]*?)<\/span>/g, `$2`)
        .replace(/<font([\S\s]*?)>([\S\s]*?)<\/font>/g, `$2`)
        .replace(/<br>/g, "")
        .replace(/\s/g, "")
        .toLowerCase()
}

export const stringToUnicode = (str: string) => {
    return str
        .split("")
        .map((c: string) => `u${c.charCodeAt(0).toString(16)}`)
        .join("")
}

export const unicodeToString = (str: string) => {
    return str
        .split("u")
        .slice(1)
        .map((c) => String.fromCharCode(parseInt(c, 16)))
        .join("")
}

export const isValidInputString = (text: string) => {
    // only accept number and space
    return /^[\d ]*$/.test(text)
}

export const checkKeyword = (keywordStr: string) => {
    let sanitizedKeywordStr = textSanitizer(keywordStr)

    if (sanitizedKeywordStr.length > inputMaxLength) {
        errorAlert(4)
        return []
    } else {
        return sanitizedKeywordStr.length ? sanitizedKeywordStr.split(",") : []
    }
}

export const addAlias = (skillArr: string[], keywords: string[]) => {
    let _skillArr = [...skillArr]
    Object.keys(skillAlias).forEach((skill) => {
        const keyword_alias_arr = skillAlias[skill]

        Object.keys(keywords).forEach((keyword) => {
            if (keyword_alias_arr.includes(keyword)) {
                _skillArr.push(skill)
                return false
            }
        })
    })

    return _skillArr
}

export const errorAlert = (index: number) => {
    const errorPrefix = `[Error Code ${paddingZeros(index, 2)}] `
    switch (index) {
        case 1:
            alert(`${errorPrefix}請檢查網址是否正確`)
            break
        case 2:
            alert(`${errorPrefix}請先選擇功能`)
            break
        case 3:
            alert(`${errorPrefix}請輸入技能關鍵字`)
            break
        case 4:
            alert(`${errorPrefix}技能關鍵字數量不得超過 ${inputMaxLength}`)
            break
        case 5:
            alert(`${errorPrefix}請輸入 UID`)
            break
        case 6:
            alert(`${errorPrefix}未發現背包資料，請先匯入背包`)
            break
        case 7:
            alert(`${errorPrefix}請輸入驗證碼`)
            break
        case 8:
            alert(`${errorPrefix}請先選擇龍刻`)
            break
        case 9:
            alert(`${errorPrefix}輸入格式錯誤 (僅接受數字及空格)`)
            break
        case 10:
            alert(
                `${errorPrefix}無法取得背包資料\n請確認是否已於官方健檢中心的個人資料勾選「公開背包」`
            )
            break
        case 11:
            alert(`${errorPrefix}請先選擇標籤`)
            break
        case 12:
            alert(`${errorPrefix}本工具不支援此帳號`)
            break
        case 13:
            alert(`${errorPrefix}請輸入編號`)
            break
        default:
    }
}

export const fetchPlayerData = async (
    uid: string,
    veri: string,
    action: string,
    setInputDisabled?: (disable: boolean) => void,
    setDataStatus?: (status: string, text: string) => void
) => {
    const playerId = uid.trim()
    const playerVeri = veri.trim()
    const verb = action === "import" ? "匯入" : "更新"

    const blackList = [
        "811310887",
        "795656880", // https://forum.gamer.com.tw/C.php?bsn=23805&snA=706545
    ]
    const isBlackList = blackList.includes(playerId)

    if (playerId.length === 0) {
        errorAlert(5)
        return null
    } else if (action === "update" && playerVeri.length === 0) {
        errorAlert(7)
        return null
    }

    setInputDisabled?.(true)
    setDataStatus?.("waiting", `正在${verb} ${playerId} 的背包...`)

    const userId =
        action === "update" ? playerId : atob(myAuth).substring(0, 10)
    const userAuth =
        action === "update" ? playerVeri : atob(myAuth).substring(10, 16)

    try {
        if (isBlackList) {
            throw new Error("black list detected")
        }

        let token: string = ""
        await axios
            .post(
                `https://website-api.tosgame.com/api/checkup/login?token=&uid=${userId}&auth=${userAuth}`
            )
            .then((response: IObject) => {
                token = response?.data?.token
            })
            .catch((error: IObject) => {
                throw new Error("Failed to get token")
            })

        let inventoryData: any = null
        await axios
            .get(
                `https://website-api.tosgame.com/api/checkup/getUserProfile?targetUid=${playerId}&token=${token}`
            )
            .then((response: IObject) => {
                inventoryData = response?.data
            })
            .catch((error: IObject) => {
                throw new Error("Failed to get inventory data")
            })

        if (inventoryData) {
            const cardSet = new Set()
            const cardInfo: IObject = {}

            inventoryData?.userData?.cards.forEach((card: IObject) => {
                cardSet.add(card.id)

                if (cardInfo?.[card.id]) {
                    cardInfo[card.id].number = cardInfo[card.id].number + 1

                    if (
                        cardInfo[card.id]?.level < card.level ||
                        cardInfo[card.id]?.skillLevel < card.skillLevel ||
                        cardInfo[card.id]?.enhanceLevel < card.enhanceLevel
                    ) {
                        cardInfo[card.id].level = card.level
                        cardInfo[card.id].skillLevel = card.skillLevel
                        cardInfo[card.id].enhanceLevel = card.enhanceLevel
                    }
                } else {
                    cardInfo[card.id] = {
                        number: 1,
                        level: card?.level || 0,
                        skillLevel: card?.skillLevel || 0,
                        enhanceLevel: card?.enhanceLevel || 0,
                    }
                }
            })

            const sortedCardArr: number[] = [...cardSet].sort(
                (a: any, b: any) => a - b
            ) as number[]
            const lastUpdateTime: string =
                inventoryData?.userData?.cardsUpdatedAt
            const playerData = {
                uid: playerId,
                name: inventoryData?.userData?.displayName || "",
                card: addCombinedCard(
                    addTransformedCard(addVirtualRebirthCard(sortedCardArr))
                ),
                info: cardInfo,
                lastUpdated: lastUpdateTime
                    ? new Date(
                          new Date(lastUpdateTime).valueOf() -
                              new Date().getTimezoneOffset().valueOf()
                      ).toLocaleString()
                    : null,
                wholeData: inventoryData?.userData?.cards,
            }

            setDataStatus?.("success", `${verb}完成`)
            setInputDisabled?.(false)

            return playerData
        }

        return {}
    } catch (e) {
        console.error(e)

        setDataStatus?.(
            "error",
            isBlackList
                ? `本工具不支援此帳號`
                : `${verb}失敗${
                      action === "import" ? "，請嘗試使用更新背包功能" : ""
                  }`
        )
        setInputDisabled?.(false)
        errorAlert(isBlackList ? 12 : 10)

        return null

        // playerData = {uid: '', card: [], info: {}, wholeData: []}
        // $('.uid-banner').length && $('.uid-banner').html(`UID: ${playerId}`)
        // setUpdateBanner()
        // showSeal && showSeal(currentSeal)
    }
}

export const getPlayerStoredData = () => {
    return JSON.parse(localStorage.getItem("PLAYER_DATA") || "{}")
}

export const addVirtualRebirthCard = (allCard: number[]) => {
    const virtualRebirth = new Set<number>()

    allCard.forEach((card) => {
        const vrId = monsterData.find((monster) => monster.id === card)?.vrPair
        virtualRebirth.add(vrId)
    })

    return allCard.concat(Array.from(virtualRebirth))
}

export const addTransformedCard = (allCard: number[]) => {
    let allCards = allCard
    let transformed: number[] = []
    let currentStage = allCard

    // need to check multiple stage transform monster
    while (currentStage.length > 0) {
        for (const card of currentStage) {
            const transformedSkill =
                monsterData
                    .find((monster) => monster.id === card)
                    ?.skill?.filter((skill: IObject) => "transform" in skill) ??
                []

            for (const skill of transformedSkill) {
                if (!allCards.includes(skill.transform))
                    transformed.push(skill.transform)
            }
        }
        currentStage = transformed
        allCards = allCards.concat(transformed)
        transformed = []
    }

    return allCards
}

export const addCombinedCard = (allCard: number[]) => {
    const combined = new Set<number>()

    allCard.forEach((card) => {
        const combineSkill =
            monsterData
                .find((monster) => monster.id === card)
                ?.skill?.filter((skill: IObject) => "combine" in skill) ?? []

        combineSkill.forEach((skill: IObject) => {
            const members: number[] = skill.combine.member
            let canCombine = true
            for (const member of members) {
                if (!allCard.includes(member)) {
                    canCombine = false
                    break
                }
            }
            canCombine && combined.add(skill.combine.out)
        })
    })

    return allCard.concat(Array.from(combined))
}

export const descriptionTranslator = (
    monsterId: number,
    description: string,
    simple?: boolean
) => {
    return !simple
        ? description
              .replace(/\n[^\S\n]*/g, `<br />`)
              .replace(/<br \/>/, "")
              .replace(
                  /<board\s*(\d*)>(.*?)<\/board>/g,
                  `<span class='fixed-board-label-${monsterId}-$1' >$2</span>`
              )
              .replace(
                  /<anno>(.*?)<\/anno>/g,
                  `<font class='desc-anno-label'>$1</font>`
              )
              .replace(
                  /【階段 (\d*)】/g,
                  `<font class='desc-multiple-label'>【階段 $1】</font>`
              )
              .replace(
                  /效果(\d+)：/g,
                  `<font class='desc-multiple-label'>效果$1：</font>`
              )
              .replace(
                  /<meff>(.*?)<\/meff>/g,
                  `<font class='desc-multiple-label'>$1</font>`
              )
              .replace(
                  /【連攜魔導式】/g,
                  `<span class='desc-note-label-0 desc-multiple-label'>【連攜魔導式】</span>`
              )
              .replace(
                  /亢奮(狀態)?/g,
                  `<span class='desc-note-label-1 desc-positive-label'>亢奮$1</span>`
              )
              .replace(
                  /疲憊(狀態)?/g,
                  `<span class='desc-note-label-2 desc-negative-label'>疲憊$1</span>`
              )
              .replace(
                  /暴擊(狀態)?/g,
                  `<span class='desc-note-label-1 desc-positive-label'>暴擊$1</span>`
              )
              .replace(
                  /暴怒(狀態)?/g,
                  `<span class='desc-note-label-3 desc-positive-label'>暴怒$1</span>`
              )
              .replace(
                  /神選(狀態)?/g,
                  `<span class='desc-note-label-4 desc-positive-label'>神選$1</span>`
              )
              .replace(
                  /風壓(狀態)?/g,
                  `<span class='desc-note-label-5 desc-negative-label'>風壓$1</span>`
              )
              .replace(
                  /休眠(狀態)?/g,
                  `<span class='desc-note-label-6 desc-negative-label'>休眠$1</span>`
              )
              .replace(
                  /麻痺(狀態)?/g,
                  `<span class='desc-note-label-7 desc-negative-label'>麻痺$1</span>`
              )
              .replace(
                  /沉默(狀態)?/g,
                  `<span class='desc-note-label-8 desc-negative-label'>沉默$1</span>`
              )
              .replace(
                  /「道」狀態?/g,
                  `<span class='desc-note-label-9 positive-note-label'>「道」狀態</span>`
              )
        : (description || "")
              ?.replace(/\n[^\S\n]*/g, "<br>")
              ?.replace(/^<br>/, "")
}

export const getUrlParams = () => {
    const params =
        window.location.href
            ?.split("?")?.[1]
            ?.split("&")
            ?.map((query) => query?.split("=")) || []

    let paramObj = {}
    for (const [key, value] of params) {
        paramObj = {
            ...paramObj,
            [key]: value,
        }
    }

    return paramObj
}

export const setUrlParams = (newParams: IObject) => {
    let queryStr = "?"
    for (const [key, value] of Object.entries(newParams)) {
        if (value?.length) queryStr = `${queryStr}${key}=${value}&`
    }

    if (queryStr.slice(-1) === "&") queryStr = queryStr.slice(0, -1)

    removeUrlParams()

    window.history.pushState(null, "", window.location.href + queryStr)
}

export const removeUrlParams = () => {
    window.history.pushState({}, "", window.location.href.split("?")[0])
}

export const encodeMapping = (allValue: any[], selected: any[]) => {
    if (!selected?.length) return ""

    const input = allValue
        .flat()
        .map((func) => (selected.includes(func) ? "1" : "0"))
        .join("")

    return encode(input)
}

export const encode = (input: string) => {
    const base = 6
    const paddedInput = _.padEnd(
        input,
        input.length % base === 0
            ? input.length
            : (Math.floor(input.length / base) + 1) * base,
        "0"
    )
    const inputArr = paddedInput.match(/.{1,6}/g) || []

    return inputArr.map((str) => encodeChart[parseInt(str, 2)]).join("")
}

export const decodeMapping = (allValue: any[], input: string) => {
    if (!input?.length) return []

    const _allValue = allValue.flat()
    return decode(input)
        .split("")
        .reduce((acc: any[], cur: string, index: number) => {
            if (cur === "1") {
                acc = [...acc, _allValue?.[index]]
            }
            return acc
        }, [])
}

export const decode = (input: string) => {
    if (!input?.length) return ""

    const base = 6
    return input
        .split("")
        .map((ch) => {
            const str = encodeChart.indexOf(ch).toString(2)
            return str.padStart(base, "0")
        })
        .join("")
}
