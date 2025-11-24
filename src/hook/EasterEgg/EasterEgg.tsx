import { useCallback, useState } from "react"
import { renderToString } from "react-dom/server"

import "./style.scss"

/***** EASTER EGG *****/

const toggleClass = (element: Element | null, className: string) => {
    element?.classList?.toggle(className)
}

const showImpact = (x: number, y: number) => {
    const scale = 0.7
    const angle = Math.random() * 360
    const posRange = { min: 0, max: 20 }

    const posOffset = {
        x:
            (posRange.min + Math.random() * (posRange.max - posRange.min)) *
            (Math.round(Math.random()) * 2 - 1),
        y:
            (posRange.min + Math.random() * (posRange.max - posRange.min)) *
            (Math.round(Math.random()) * 2 - 1),
    }

    const ele = document.createElement("div")

    ele.className = "impact"
    ele.style = `position: absolute; left: ${x - 100 + posOffset.x}px; top: ${
        y - 100 + posOffset.y
    }px;z-index: 10000; pointer-events: none; user-select: none;`
    ele.innerHTML = renderToString(
        <img
            src={`./src/img/other/impact.png`}
            style={{
                transform: `rotate(${angle}deg) scale(${scale})`,
            }}
            unselectable='on'
        />
    )
    document.getElementById("root")?.append(ele)

    toggleClass(ele, "fade-out")
    setTimeout(() => {
        ele?.remove()
    }, 500)
}

// Click on Saitama's image breaks the screen
// Click on Josuke's image fix the screen
export const useGlassBreak = () => {
    const setGlassBreak = useCallback(
        (target: HTMLElement, x: number, y: number) => {
            const scale = 0.8 + Math.random() * 0.6
            const angle = Math.random() * 360

            const ele = document.createElement("div")

            ele.className = "glass-break"
            ele.innerHTML = renderToString(
                <img
                    src='./src/img/other/glass_break.png'
                    style={{
                        position: "absolute",
                        left: `${x - 100}px`,
                        top: `${y - 100}px`,
                        pointerEvents: "none",
                        userSelect: "none",
                        opacity: 0.8,
                        transform: `rotate(${angle}deg) scale(${scale})`,
                    }}
                />
            )
            document.getElementById("root")?.append(ele)

            toggleClass(target, "shake-small")
            setTimeout(() => toggleClass(target, "shake-small"), 200)
        },
        []
    )

    const repairGlass = useCallback(() => {
        document
            .querySelectorAll(".glass-break")
            .forEach((element) => element.remove())
    }, [])

    return { setGlassBreak, repairGlass }
}

// Click on Joestars, Dio and Bucciarati's image shows manga voice text
export const useMangaVoiceText = () => {
    const setMangaVoiceText = useCallback(
        (target: HTMLElement, x: number, y: number, text: string) => {
            const scaleRange = { min: 0.5, max: 0.8 }
            const angleRange = { min: -20, max: 20 }
            const posRange = { min: 50, max: 80 }

            const scale =
                scaleRange.min +
                Math.random() * (scaleRange.max - scaleRange.min)
            const angle =
                angleRange.min +
                Math.random() * (angleRange.max - angleRange.min)
            const posOffset = {
                x:
                    (posRange.min +
                        Math.random() * (posRange.max - posRange.min)) *
                    (Math.round(Math.random()) * 2 - 1),
                y:
                    (posRange.min +
                        Math.random() * (posRange.max - posRange.min)) *
                    (Math.round(Math.random()) * 2 - 1),
            }

            const ele = document.createElement("div")

            ele.className = "manga-voice-text"
            ele.style = `position: absolute; left: ${
                x - 100 + posOffset.x
            }px; top: ${
                y - 100 + posOffset.y
            }px;z-index: 10000; pointer-events: none; user-select: none;`
            ele.innerHTML = renderToString(
                <img
                    src={`./src/img/other/${text}.png`}
                    style={{
                        transform: `rotate(${angle}deg) scale(${scale})`,
                    }}
                    unselectable='on'
                />
            )
            document.getElementById("root")?.append(ele)

            showImpact(x, y)

            toggleClass(ele, "fade-out")
            !target?.classList?.contains("shake-small") &&
                toggleClass(target, "shake-small")
            setTimeout(() => {
                ele?.remove()
                target?.classList?.contains("shake-small") &&
                    toggleClass(target, "shake-small")
            }, 500)
        },
        []
    )

    return { setMangaVoiceText }
}

// Click on Kira's image explodes
export const useExplode = () => {
    const setExplode = useCallback(
        (target: HTMLElement, x: number, y: number) => {
            const scaleRange = { min: 0.8, max: 0.8 }
            const angleRange = { min: 0, max: 360 }
            const posRange = { min: 20, max: 50 }

            const scale =
                scaleRange.min +
                Math.random() * (scaleRange.max - scaleRange.min)
            const angle =
                angleRange.min +
                Math.random() * (angleRange.max - angleRange.min)
            const posOffset = {
                x:
                    (posRange.min +
                        Math.random() * (posRange.max - posRange.min)) *
                    (Math.round(Math.random()) * 2 - 1),
                y:
                    (posRange.min +
                        Math.random() * (posRange.max - posRange.min)) *
                    (Math.round(Math.random()) * 2 - 1),
            }

            const ele = document.createElement("div")

            ele.className = "explode"
            ele.style = `position: absolute; left: ${
                x - 100 + posOffset.x
            }px; top: ${
                y - 100 + posOffset.y
            }px;z-index: 10000; pointer-events: none; user-select: none;`
            ele.innerHTML = renderToString(
                <img
                    src={`./src/img/other/explode.png`}
                    style={{
                        transform: `rotate(${angle}deg) scale(${scale})`,
                    }}
                    unselectable='on'
                />
            )
            document.getElementById("root")?.append(ele)

            showImpact(x, y)

            toggleClass(ele, "fade-out")
            !target?.classList?.contains("shake-small") &&
                toggleClass(target, "shake-small")
            setTimeout(() => {
                ele?.remove()
                target?.classList?.contains("shake-small") &&
                    toggleClass(target, "shake-small")
            }, 500)
        },
        []
    )

    return { setExplode }
}

// Click on A Song of Farewell - Hatsune Miku's image she disappears
export const useMikuDisappear = () => {
    const mikuDisappear = useCallback((target: HTMLElement) => {
        !target?.classList?.contains("miku-disappear") &&
            toggleClass(target, "miku-disappear")
    }, [])

    return { mikuDisappear }
}

// Theme switch can be broken after clicking too many times
export const useThemeSwitch = () => {
    const [switchTime, setSwitchTime] = useState(0)

    const toggleTheme = useCallback(
        (callback: () => void) => {
            const _switchTime = switchTime + 1

            if (_switchTime >= 30) {
                if (_switchTime === 30) {
                    alert("...看來電燈開關被按壞了\n\n請重新整理頁面以修好開關")
                } else if (_switchTime === 60) {
                    alert("不是，多按幾次也不會修好，真的")
                } else if (_switchTime === 90) {
                    alert("看吧，我就說不會這樣就修好的")
                } else if (_switchTime === 120) {
                    alert("太有毅力了吧\n...雖然開關依舊是壞的")
                } else if (_switchTime === 150) {
                    alert("要不要猜猜看再多按幾次會怎樣？")
                } else if (_switchTime === 180) {
                    alert(
                        "等等我開玩笑的，真的沒東西了\n\n請重新整理頁面以修好開關"
                    )
                } else if (_switchTime >= 181) {
                    alert("請重新整理頁面以修好開關")
                }
            } else {
                callback()
            }
            setSwitchTime(_switchTime)
        },
        [switchTime]
    )

    const repairThemeSwitch = useCallback(() => {
        setSwitchTime(0)
    }, [])

    return { toggleTheme, repairThemeSwitch }
}

// Click on Doomsday Titan's image trigger chinarashi
export const useChinarashi = () => {
    const setChinarashi = useCallback(() => {
        const elements = [
            ...document.querySelectorAll(".page-container > .row"),
            document.querySelector(".page-container .result-row"),
            document.querySelector(".page-container .result-wrapper"),
        ]

        elements.forEach((element) => {
            !element?.classList?.contains("shake") &&
                toggleClass(element, "shake")
        })

        setTimeout(() => {
            elements.forEach((element) => {
                element?.classList?.contains("shake") &&
                    toggleClass(element, "shake")
            })
        }, 500)
    }, [])

    return { setChinarashi }
}

// Click on Kirito's image 16 times in 10 seconds show congratulations banner
export const useCongratsClicker = () => {
    const [clickCount, setClickCount] = useState(0)
    const [clickLock, setClickLock] = useState(false)
    const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
        null
    )

    const showCongrats = useCallback(() => {
        timer && clearTimeout(timer)

        const ele = document.createElement("div")

        ele.className = "congrats-mask"
        ele.style = `position: fixed; top: 0; width: ${window.innerWidth}px; height: ${window.innerHeight}px; background-color: rgba(0, 0, 0, 0.75); opacity: 0; z-index: 100000;`
        ele.innerHTML = renderToString(
            <img
                className='congrat-banner'
                src='./src/img/other/congrat.png'
                style={{
                    position: "absolute",
                    width: "50%",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    opacity: 0,
                    zIndex: 100000,
                    userSelect: "none",
                }}
            />
        )
        document.getElementById("root")?.prepend(ele)

        const banner =
            document.querySelector(".congrat-banner") ||
            document.createElement("div")

        const fadeTime = 50
        for (let i = 1; i <= fadeTime; i++) {
            setTimeout(function () {
                ele.style.opacity = `${(1 / fadeTime) * i}`
            }, i * 10)
        }
        for (let i = 1; i <= fadeTime; i++) {
            setTimeout(function () {
                ;(banner as HTMLDivElement).style.opacity = `${
                    (1 / fadeTime) * i
                }`
            }, 1000 + i * 10)
        }
        for (let i = 1; i <= fadeTime; i++) {
            setTimeout(function () {
                ele.style.opacity = `${1 - (1 / fadeTime) * i}`
                ;(banner as HTMLDivElement).style.opacity = `${
                    1 - (1 / fadeTime) * i
                }`
            }, 6000 + i * 10)
        }

        setTimeout(function () {
            setClickLock(false)
            setClickCount(0)
            ele?.remove()
        }, 6500)
    }, [timer])

    const checkComboCount = useCallback(() => {
        timer && clearTimeout(timer)
        if (clickCount < 16) {
            setClickCount(0)
        }
    }, [clickCount, timer])

    const onClickKirito = useCallback(() => {
        if (clickLock) return

        const _clickCount = clickCount + 1

        if (_clickCount === 1) {
            setTimer(setTimeout(checkComboCount, 10 * 1000))
        } else if (_clickCount >= 16) {
            setClickLock(true)
            showCongrats()
        }
        setClickCount(_clickCount)
    }, [checkComboCount, clickCount, clickLock, showCongrats])

    return { onClickKirito }
}

/***** EASTER EGG *****/
