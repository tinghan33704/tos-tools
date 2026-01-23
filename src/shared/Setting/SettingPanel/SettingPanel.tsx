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
                icon: config?.showNoData ? faExpand : faCompress,
                text: `${config?.showNoData ? "顯示" : "隱藏"}查無結果`,
                callback: config?.toggleShowNoData,
            },
            use_inventory: {
                icon: config?.useInventory ? faArchive : faDatabase,
                text: config?.useInventory ? "我的背包" : "全部結果",
                callback: config?.toggleUseInventory,
            },
            result_view: {
                icon:
                    config?.resultView === "table" ? faList : faTableCellsLarge,
                text: config?.resultView === "table" ? "表格檢視" : "簡略檢視",
                callback: config?.toggleResultView,
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
                    config?.category === "crossover"
                        ? "合作"
                        : config?.category === "non-crossover"
                          ? "自家"
                          : "全部"
                }角色`,
                callback: config?.toggleCategory,
            },
            sort: {
                icon: faArrowUpShortWide,
                text: config?.sort === "default" ? "預設排序" : "按持有數排序",
                callback: config?.toggleSort,
            },
            hide_had_monster: {
                icon: config?.hideHadMonster ? faCompress : faExpand,
                text: `${config?.hideHadMonster ? "隱藏" : "顯示"}已持有角色`,
                callback: config?.toggleHideHadMonster,
            },
            show_skill_icon: {
                icon: faCircleInfo,
                text: `${config?.showSkillIcon ? "顯示" : "隱藏"}技能圖示`,
                callback: config?.toggleShowSkillIcon,
            },
        }
    }, [
        theme,
        changeTheme,
        openDurationModal,
        openObjectiveModal,
        openUserDataModal,
        config?.showNoData,
        config?.toggleShowNoData,
        config?.useInventory,
        config?.toggleUseInventory,
        config?.resultView,
        config?.toggleResultView,
        config?.category,
        config?.toggleCategory,
        config?.sort,
        config?.toggleSort,
        config?.hideHadMonster,
        config?.toggleHideHadMonster,
        config?.showSkillIcon,
        config?.toggleShowSkillIcon,
        openInputModal,
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
