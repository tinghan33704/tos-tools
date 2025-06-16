import React, { useCallback, useEffect, useState } from "react"

import { useMouseMove } from "src/hook/useMouse"

import "./style.scss"

export interface IDescriptionNoteProps {}

const DescriptionNote: React.FC<IDescriptionNoteProps> = (props) => {
    const [note, setNote] = useState<number>(0)
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const { mouseX, mouseY, mouseTargetClassName, onMouseMove } = useMouseMove()

    useEffect(() => {
        window.addEventListener("mousemove", onMouseMove)
        return () => window.removeEventListener("mousemove", onMouseMove)
    }, [onMouseMove])

    useEffect(() => {
        if (mouseTargetClassName?.toString().includes("desc-note-label")) {
            const noteInfo: string = mouseTargetClassName
                .replace("desc-note-label-", "")
                .split(" ")[0]
            const noteId = parseInt(noteInfo)
            setNote(noteId)
            setIsOpen(true)
        } else {
            setNote(0)
            setIsOpen(false)
        }
    }, [mouseTargetClassName])

    const renderDescriptionNote = useCallback((desc_index: number) => {
        switch (desc_index) {
            case 0:
                return (
                    <span className='desc-note-label'>
                        場上有【連攜魔導式】技能生效時
                        <br />
                        ⓵【連攜魔導式】類別技能
                        <br />⇒ 不能發動
                        <br />⓶ 改為可發動另一技能：
                        <br />
                        延長當前【連攜魔導式】 1 回合效果
                        <br />⇒ 最多可延長至 6 回合
                    </span>
                )
            case 1:
                return <span className='positive-note-label'>攻擊力 2 倍</span>
            case 2:
                return <span className='negative-note-label'>攻擊力降為 0</span>
            case 3:
                return <span className='positive-note-label'>攻擊力 5 倍</span>
            case 4:
                return (
                    <span className='positive-note-label'>
                        每有 1 個成員置身神選狀態，增加 5 連擊 (Combo)
                        <br /> (需消除符石)
                    </span>
                )
            case 5:
                return (
                    <span className='negative-note-label'>
                        陷入風壓狀態的角色：
                        <br />⓵ 不能發動技能及攻擊
                        <br />⓶ 不能發動角色符石
                    </span>
                )
            case 6:
                return (
                    <span className='negative-note-label'>
                        陷入休眠狀態的角色：
                        <br />⓵ 無法使用技能
                        <br />⓶ 攻擊力變 0
                    </span>
                )
            case 7:
                return (
                    <span className='negative-note-label'>
                        陷入痲痺狀態的角色：
                        <br />⓵ 不能發動攻擊
                        <br />⓶ 自身技能不會冷卻
                        <br />⓷ 自身 EP 不會增加
                        <br />⓸ 自身不受回技或回 EP 影響
                    </span>
                )

            case 8:
                return (
                    <span className='negative-note-label'>
                        ⓵ 隊伍中有陷入沉默狀態的角色時不能發動龍刻脈動及龍刻技能
                        <br />⓶ 陷入沉默狀態的角色無法使用技能
                    </span>
                )
            case 9:
                return (
                    <span className='positive-note-label'>
                        ⓵ 自身攻擊力 1.5 倍<br />⓶
                        無視人類、妖精類及神族敵人的防禦力
                        <br />⓷ 自身以 50% 攻擊力追打自身原屬性攻擊 2 次
                    </span>
                )
            default:
                return <></>
        }
    }, [])

    return (
        <>
            {isOpen ? (
                <div
                    className='desc-note'
                    style={{
                        left: `${mouseX + 20}px`,
                        top: `${mouseY}px`,
                    }}
                >
                    {renderDescriptionNote(note)}
                </div>
            ) : (
                <></>
            )}
        </>
    )
}

export default DescriptionNote
