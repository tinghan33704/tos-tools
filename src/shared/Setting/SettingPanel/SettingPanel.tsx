import React, {
    useContext,
    useCallback,
    useMemo,
    useRef,
    useEffect,
} from "react"
import {
    faAdjust,
    faArchive,
    faArrowUpShortWide,
    faCircleInfo,
    faCompress,
    faDatabase,
    faExpand,
    faFilter,
    faInbox,
    faList,
    faTableCellsLarge,
    faUser,
} from "@fortawesome/free-solid-svg-icons"

import { sealContent } from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import ThemeContext from "src/utilities/Context/ThemeContext"
import { toolConfig } from "src/constant/toolConfig"
import Icon from "src/utilities/Icon"

import "./style.scss"

export interface ISettingPanelProps {
    panelOpen: boolean
    onClosePanel: () => void
    openDurationModal?: () => void
    openUserDataModal?: () => void
    openObjectiveModal?: () => void
    openInputModal?: () => void
    iconRef: React.RefObject<HTMLDivElement>
    backpackViewerPage?: string

    showNoData?: boolean
    toggleShowNoData?: () => void
    useInventory?: boolean
    toggleUseInventory?: () => void
    showSkillIcon?: boolean
    toggleShowSkillIcon?: () => void
    resultView?: string
    toggleResultView?: () => void
    sort?: string
    toggleSort?: () => void
    category?: string
    toggleCategory?: () => void
    hideHadMonster?: boolean
    toggleHideHadMonster?: () => void
}

const SettingPanel: React.FC<ISettingPanelProps> = (props) => {
    const {
        onClosePanel,
        openDurationModal,
        openUserDataModal,
        openObjectiveModal,
        openInputModal,
        panelOpen,
        iconRef,
        backpackViewerPage = Object.keys(sealContent)[1],
        showNoData,
        toggleShowNoData,
        useInventory,
        toggleUseInventory,
        showSkillIcon,
        toggleShowSkillIcon,
        resultView,
        toggleResultView,
        sort,
        toggleSort,
        category,
        toggleCategory,
        hideHadMonster,
        toggleHideHadMonster,
    } = props
    const config = useContext(Context)
    const ref = useRef<HTMLDivElement>(null)
    const { theme, changeTheme } = useContext(ThemeContext)
    const panelMapping: IObject = useMemo(() => {
        return {
            theme: {
                icon: faAdjust,
                text: `${theme === "light" ? "淺" : "深"}色主題`,
                callback: changeTheme,
            },
            duration_option: {
                icon: faFilter,
                text: "進階篩選",
                callback: openDurationModal,
                autoClose: true,
            },
            objective_option: {
                icon: faFilter,
                text: "進階篩選",
                callback: openObjectiveModal,
                autoClose: true,
            },
            backpack: {
                icon: faArchive,
                text: "匯入/更新背包",
                callback: openUserDataModal,
                autoClose: true,
            },
            show_no_data: {
                icon: showNoData ? faExpand : faCompress,
                text: `${showNoData ? "顯示" : "隱藏"}查無結果`,
                callback: toggleShowNoData,
            },
            use_inventory: {
                icon: useInventory ? faArchive : faDatabase,
                text: useInventory ? "我的背包" : "全部結果",
                callback: toggleUseInventory,
            },
            result_view: {
                icon: resultView === "table" ? faList : faTableCellsLarge,
                text: resultView === "table" ? "表格檢視" : "簡略檢視",
                callback: toggleResultView,
            },
            input_id: {
                icon: faInbox,
                text: "匯入編號",
                callback: openInputModal,
                autoClose: true,
            },
            category: {
                icon: faUser,
                text: `顯示${
                    category === "crossover"
                        ? "合作"
                        : category === "non-crossover"
                          ? "自家"
                          : "全部"
                }角色`,
                callback: toggleCategory,
            },
            sort: {
                icon: faArrowUpShortWide,
                text: sort === "default" ? "預設排序" : "按持有數排序",
                callback: toggleSort,
            },
            hide_had_monster: {
                icon: hideHadMonster ? faCompress : faExpand,
                text: `${hideHadMonster ? "隱藏" : "顯示"}已持有角色`,
                callback: toggleHideHadMonster,
            },
            show_skill_icon: {
                icon: faCircleInfo,
                text: `${showSkillIcon ? "顯示" : "隱藏"}技能圖示`,
                callback: toggleShowSkillIcon,
            },
        }
    }, [
        theme,
        changeTheme,
        openDurationModal,
        openObjectiveModal,
        openUserDataModal,
        showNoData,
        toggleShowNoData,
        useInventory,
        toggleUseInventory,
        resultView,
        toggleResultView,
        openInputModal,
        category,
        toggleCategory,
        sort,
        toggleSort,
        hideHadMonster,
        toggleHideHadMonster,
        showSkillIcon,
        toggleShowSkillIcon,
    ])

    const onClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (
                panelOpen &&
                !ref?.current?.contains(e.target as Node) &&
                !iconRef?.current?.contains(e.target as Node)
            ) {
                onClosePanel()
            }
        },
        [iconRef, onClosePanel, panelOpen],
    )

    useEffect(() => {
        window.addEventListener("click", onClick as any)
        return () => {
            window.removeEventListener("click", onClick as any)
        }
    }, [panelOpen])

    const renderPanels = useCallback(() => {
        const toolSettings =
            config?.toolId === "backpack-viewer"
                ? toolConfig[config.toolId]?.setting?.[backpackViewerPage] || []
                : toolConfig[config.toolId]?.setting || []

        return toolSettings.map((setting: string) => {
            const toolSetting = panelMapping[setting]
            return (
                <div
                    className='setting-panel'
                    onClick={
                        toolSetting?.autoClose
                            ? () => {
                                  onClosePanel()
                                  toolSetting.callback()
                              }
                            : toolSetting.callback
                    }
                >
                    <div className='setting-panel-icon'>
                        <Icon icon={toolSetting.icon} />
                    </div>
                    <div className='setting-panel-desc'>{toolSetting.text}</div>
                </div>
            )
        })
    }, [backpackViewerPage, config.toolId, onClosePanel, panelMapping])

    return (
        <div
            className={`setting-panel-row${panelOpen ? "" : " hide"}`}
            ref={ref}
        >
            {renderPanels()}
        </div>
    )
}

export default SettingPanel
