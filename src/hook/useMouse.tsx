import { useState, useCallback } from "react"

export const useMouseMove = () => {
    const [mouseX, setMouseX] = useState(0)
    const [mouseY, setMouseY] = useState(0)
    const [mouseTargetClassName, setMouseTargetClassName] = useState<string>("")

    const onMouseMove = useCallback((e: MouseEvent) => {
        setMouseX(e.pageX)
        setMouseY(e.pageY)
        setMouseTargetClassName(
            (e.target as HTMLElement).className?.toString() || ""
        )
    }, [])

    return { mouseX, mouseY, mouseTargetClassName, onMouseMove }
}
