import React, { useEffect, useState, useCallback, useRef } from "react"
import _ from "lodash"
import { Table } from "react-bootstrap"

import { useMouseMove } from "src/hook/useMouse"
import { getMonsterById } from "src/utilities/utils"
import Image from "src/utilities/Image"

import "./style.scss"

export interface IFixedBoardProps {}

const FixedBoard: React.FC<IFixedBoardProps> = (props) => {
    const ref = useRef<HTMLDivElement>(null)

    const [boardData, setBoardData] = useState<IObject | string[]>({})
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [boardXOffset, setBoardXOffset] = useState<number>(20)
    const [boardYOffset, setBoardYOffset] = useState<number>(20)

    const { mouseX, mouseY, mouseTargetClassName, onMouseMove } = useMouseMove()

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove)
        return () => window.removeEventListener("mousemove", onMouseMove)
    }, [onMouseMove])

    useEffect(() => {
        if (mouseTargetClassName?.toString().startsWith("fixed-board-label")) {
            const boardInfo: string = mouseTargetClassName.replace(
                "fixed-board-label-",
                ""
            )
            const monsterId = parseInt(boardInfo.split("-")[0])
            const boardId = parseInt(boardInfo?.split("-")?.[1]) - 1 || 0
            const monsterObj: IObject = getMonsterById(monsterId)
            const boardData = monsterObj?.board?.[boardId]

            const refCurrent = ref?.current

            if (refCurrent) {
                const width = refCurrent?.clientWidth
                const height = refCurrent?.clientHeight

                const pageWidth = document.body.clientWidth
                // const pageX = window?.scrollX || window?.pageXOffset
                const pageY = window?.scrollY || window?.pageYOffset
                const offset = 20

                const left =
                    mouseX + width + offset > pageWidth
                        ? mouseX - width - offset
                        : mouseX + offset
                const top =
                    mouseY - pageY + height / 2 + offset > window.innerHeight
                        ? window.innerHeight - height - offset + pageY
                        : mouseY - height / 2

                setBoardXOffset(left)
                setBoardYOffset(top)
            }

            setBoardData(boardData)
            setIsOpen(true)
        } else {
            setBoardData({})
            setIsOpen(false)
            setBoardXOffset(20)
            setBoardYOffset(20)
        }
    }, [mouseTargetClassName, mouseX, mouseY])

    const renderRow = useCallback((data: string[]) => {
        return data.map((rune, index) => {
            const isNone = rune[0] === "-"
            const runeType = rune[0]
            const raceMark = rune[1]
            const isEnchanted =
                !/^\d+$/.test(runeType) && runeType === runeType.toUpperCase()
            const rune_img = `rune/rune_${
                isNone ? "none" : runeType.toLowerCase()
            }${!isNone && isEnchanted ? "_enc" : ""}`

            if (raceMark) {
                const race_img = `rune/race_${raceMark}`
                return (
                    <td className='rune-td' key={index}>
                        <Image path={rune_img} className='rune-img' />
                        <Image path={race_img} className='race-img' />
                    </td>
                )
            } else {
                return (
                    <td className='rune-td' key={index}>
                        <Image path={rune_img} className='rune-img' />
                    </td>
                )
            }
        })
    }, [])

    const renderRows = useCallback(
        (rowCount: number, columnCount: number, board: string[]) => {
            const rows = []

            for (let row = 0; row < rowCount; row++) {
                rows.push(
                    <tr className='rune-tr'>
                        {renderRow(
                            board?.slice(
                                row * columnCount,
                                (row + 1) * columnCount
                            ) || []
                        )}
                    </tr>
                )
            }
            return rows
        },
        [renderRow]
    )

    const renderNote = useCallback((notes: string[]) => {
        return notes.map((note, index) => {
            const rune_img = `rune/rune_${index + 1}`
            return (
                <div className='board-note'>
                    <div className='board-note-row'>
                        <Image
                            path={rune_img}
                            className='board-note-rune-img'
                        />
                        <div className='board-note-text'>{note}</div>
                    </div>
                </div>
            )
        })
    }, [])

    const renderBoard = useCallback(() => {
        const rowCount = (boardData as IObject)?.row ?? 5
        const columnCount = (boardData as IObject)?.column ?? 6
        const board = _.isPlainObject(boardData)
            ? (boardData as IObject)?.board
            : boardData

        return (
            <>
                <Table>{renderRows(rowCount, columnCount, board)}</Table>
                {(boardData as IObject)?.note &&
                    renderNote((boardData as IObject)?.note)}
            </>
        )
    }, [boardData, renderNote, renderRows])

    return (
        <>
            {isOpen ? (
                <div
                    ref={ref}
                    className='fixed-board'
                    style={{
                        left: `${boardXOffset}px`,
                        top: `${boardYOffset}px`,
                    }}
                >
                    {renderBoard()}
                </div>
            ) : (
                <></>
            )}
        </>
    )
}

export default FixedBoard
