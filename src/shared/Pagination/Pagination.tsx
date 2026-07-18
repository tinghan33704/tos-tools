import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
    faChevronLeft,
    faChevronRight,
    faEllipsis,
} from "@fortawesome/free-solid-svg-icons"

import Icon from "src/utilities/Icon"
import "./style.scss"

export interface IPaginationProps {
    currentPage: number // 1-indexed
    totalPages: number
    onPageChange: (page: number) => void
    boundaryCount?: number // number of buttons at each end
}

type PageItem = number | "input"

const isMobile = window.innerWidth <= 768

const Pagination: React.FC<IPaginationProps> = (props) => {
    const {
        currentPage,
        totalPages,
        onPageChange,
        boundaryCount = isMobile ? 1 : 3,
    } = props

    const [inputValue, setInputValue] = useState<string>(String(currentPage))

    // Sync local input value when page changes from outside (e.g. page buttons)
    useEffect(() => {
        setInputValue(String(currentPage))
    }, [currentPage])

    const pageItems: PageItem[] = useMemo(() => {
        // Show all pages when they fit without a middle input slot
        if (totalPages <= boundaryCount * 2 + 1) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const head = Array.from({ length: boundaryCount }, (_, i) => i + 1)
        const tail = Array.from(
            { length: boundaryCount },
            (_, i) => totalPages - boundaryCount + i + 1,
        )
        return [...head, "input", ...tail]
    }, [totalPages, boundaryCount])

    const changePage = useCallback(
        (page: number) => {
            const clamped = Math.min(Math.max(page, 1), totalPages)
            if (clamped !== currentPage) onPageChange(clamped)
        },
        [currentPage, totalPages, onPageChange],
    )

    const commitInput = useCallback(() => {
        const parsed = parseInt(inputValue, 10)
        if (Number.isNaN(parsed)) {
            setInputValue(String(currentPage))
            return
        }
        const clamped = Math.min(Math.max(parsed, 1), totalPages)
        setInputValue(String(clamped))
        changePage(clamped)
    }, [inputValue, currentPage, totalPages, changePage])

    const onInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                commitInput()
                e.currentTarget.blur()
            }
        },
        [commitInput],
    )

    if (totalPages < 1) return null

    return (
        <div className='pagination-row'>
            <button
                type='button'
                className='page-btn page-arrow arrow-left'
                disabled={currentPage === 1}
                onClick={() => changePage(currentPage - 1)}
                aria-label='上一頁'
            >
                <Icon icon={faChevronLeft} />
            </button>
            {pageItems.map((item) =>
                item === "input" ? (
                    <>
                        <Icon icon={faEllipsis} className='ellipsis' />
                        <input
                            key='page-input'
                            className='page-input'
                            type='number'
                            inputMode='numeric'
                            pattern='[0-9]*'
                            min={1}
                            max={totalPages}
                            value={inputValue}
                            onChange={(e) =>
                                setInputValue(e.target.value.replace(/\D/g, ""))
                            }
                            onBlur={commitInput}
                            onKeyDown={onInputKeyDown}
                            aria-label='輸入頁碼'
                        />
                        <Icon icon={faEllipsis} className='ellipsis' />
                    </>
                ) : (
                    <button
                        type='button'
                        key={`page_${item}`}
                        className={`page-btn${
                            item === currentPage ? " active" : ""
                        }`}
                        onClick={() => changePage(item)}
                    >
                        {item}
                    </button>
                ),
            )}
            <button
                type='button'
                className='page-btn page-arrow arrow-right'
                disabled={currentPage === totalPages}
                onClick={() => changePage(currentPage + 1)}
                aria-label='下一頁'
            >
                <Icon icon={faChevronRight} />
            </button>
        </div>
    )
}

export default React.memo(Pagination)
