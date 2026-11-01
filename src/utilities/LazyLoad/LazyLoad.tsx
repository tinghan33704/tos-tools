import React, { useEffect, useRef, useState } from "react"

export interface ILazyLoadProps {
    children: React.ReactNode
    placeholder?: React.ReactNode
    offset?: number
    once?: boolean
}

const LazyLoad: React.FC<ILazyLoadProps> = (props) => {
    const { children, placeholder = null, offset = 0, once = false } = props

    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element || (once && isVisible)) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (once && !entry.isIntersecting) return
                setIsVisible(entry.isIntersecting)
            },
            { rootMargin: `${offset}px` },
        )
        observer.observe(element)

        return () => observer.disconnect()
    }, [offset, once, isVisible])

    return (
        <div ref={ref} className='lazyload-wrapper'>
            {isVisible ? children : placeholder}
        </div>
    )
}

export default LazyLoad
