import React, { useRef } from "react"
import { createPortal } from "react-dom"
import { useState, useCallback, useEffect } from "react"

import "./style.scss"

export const usePopover = () => {
    const [target, setTarget] = useState<any>()
    const [prevTarget, setPrevTarget] = useState<any>()
    const [content, setContent] = useState<React.ReactElement>(<></>)
    const [isOpen, setIsOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false) // Control visibility of popover. Make sure popover is not visible until the positioning is done
    const [dynamicPos, setDynamicPos] = useState<IObject>({})
    const [isDomReady, setIsDomReady] = React.useState(false)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [size, setSize] = useState([0, 0])

    const ref = useRef<any>(null)

    useEffect(() => {
        setIsDomReady(true)

        window.addEventListener("scroll", onScroll)
        window.addEventListener("resize", onResize)
        window.addEventListener("click", onClick as any)
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.addEventListener("resize", onResize)
            window.removeEventListener("click", onClick as any)
        }
    }, [])

    const closePopover = useCallback(() => {
        setIsVisible(false)
        setIsOpen(false)
    }, [])

    const onClick = useCallback(
        (e: React.MouseEvent) => {
            if (
                isOpen &&
                ref?.current &&
                !ref?.current.contains(e?.target) &&
                target &&
                !target?.contains(e?.target)
            ) {
                closePopover()
            }
        },
        [closePopover, isOpen, target]
    )

    useEffect(() => {
        window.addEventListener("click", onClick as any)
        return () => {
            window.removeEventListener("click", onClick as any)
        }
    }, [isOpen, onClick])

    useEffect(() => {
        if (isOpen) {
            setIsVisible(false)
            setPopoverPosition()
        }
    }, [content, isOpen])

    useEffect(() => {
        setPopoverPosition()
    }, [scrollPosition, size])

    const toggleBorder = useCallback(() => {
        prevTarget?.setAttribute("style", "")
        target?.setAttribute(
            "style",
            isOpen ? "outline: 3.5px #FF6666 dashed" : ""
        )
    }, [isOpen, prevTarget, target])

    useEffect(() => {
        toggleBorder()
    }, [isOpen, target])

    const onResize = useCallback(() => {
        setSize([window.innerWidth, window.innerHeight])
    }, [])

    const onScroll = useCallback(() => {
        setScrollPosition(window.pageYOffset)
    }, [])

    const setPopoverPosition = useCallback(() => {
        const refCurrent = ref?.current

        if (refCurrent) {
            const overlayPos = target?.getBoundingClientRect()

            const overlayTop = overlayPos?.top || 0
            const overlayBottom = overlayPos?.bottom || 0
            const overlayLeft = overlayPos?.left || 0
            const overlayRight = overlayPos?.right || 0
            const overlayHeight = overlayPos?.height || 0
            const overlayWidth = overlayPos?.width || 0
            const offset = 5

            const popoverWidth = refCurrent?.offsetWidth || 0
            const popoverHeight = refCurrent?.offsetHeight || 0

            const pageWidth = document.body.clientWidth
            const pageX = window?.scrollX || window?.pageXOffset
            const pageY = window?.scrollY || window?.pageYOffset

            const top =
                overlayBottom + offset + popoverHeight > window.innerHeight - 0
                    ? overlayTop + pageY - popoverHeight - offset
                    : overlayBottom + pageY + offset

            const left =
                overlayLeft + overlayWidth / 2 - popoverWidth / 2 - offset <= 0
                    ? offset
                    : overlayRight -
                          overlayWidth / 2 +
                          popoverWidth / 2 +
                          offset >=
                      pageWidth
                    ? pageWidth - offset - popoverWidth
                    : overlayLeft + pageX + overlayWidth / 2 - popoverWidth / 2

            const position = {
                top,
                left,
            }

            if (
                Math.floor(top) !== Math.floor(dynamicPos?.top) ||
                Math.floor(left) !== Math.floor(dynamicPos?.left)
            ) {
                setDynamicPos(position)
            }
            setIsVisible(isOpen)
        }
    }, [dynamicPos, isOpen, target])

    const setPopoverContent = useCallback((content: React.ReactElement) => {
        setContent(content)
    }, [])

    const togglePopover = useCallback(
        (e: React.MouseEvent) => {
            if (e?.target) {
                setIsOpen(true)
                setPrevTarget(target)
                setTarget(e?.target)
            }
        },
        [target]
    )

    const renderPopoverContent = useCallback(() => {
        return (
            <div
                className={`popover-content ${isVisible ? "open" : "close"}`}
                ref={ref}
                style={{
                    ...dynamicPos,
                }}
            >
                {content}
            </div>
        )
    }, [content, dynamicPos, isVisible])

    const Popover = useCallback(
        ({ children }: any) => {
            // wait until DOM loaded then render portal
            return (
                <>
                    {isDomReady ? (
                        createPortal(
                            renderPopoverContent(),
                            document.getElementsByClassName("App")?.[0]
                        )
                    ) : (
                        <></>
                    )}
                </>
            )
        },
        [isDomReady, renderPopoverContent]
    )

    return { Popover, togglePopover, setPopoverContent }
}
