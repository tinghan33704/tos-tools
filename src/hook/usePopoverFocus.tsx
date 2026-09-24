import { useCallback, useSyncExternalStore } from "react"

type Listener = () => void

let focusedTarget: HTMLElement | null = null
const listeners = new Set<Listener>()

export const setPopoverFocusTarget = (target: HTMLElement | null) => {
    if (focusedTarget === target) return
    focusedTarget = target
    listeners.forEach((listener) => listener())
}

const subscribe = (listener: Listener) => {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

export const useIsPopoverFocused = (
    ref: React.RefObject<HTMLElement>,
): boolean => {
    const getSnapshot = useCallback(
        () => !!focusedTarget && !!ref.current?.contains(focusedTarget),
        [ref],
    )

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
