import React, {
    useContext,
    useCallback,
    useMemo,
    useRef,
    useEffect,
    useLayoutEffect,
    useState,
} from "react"
import {
    faAdjust,
    faArchive,
    faArrowUpShortWide,
    faChevronLeft,
    faChevronRight,
    faCircleInfo,
    faCompress,
    faDatabase,
    faExpand,
    faFile,
    faFilter,
    faInbox,
    faLayerGroup,
    faList,
    faSliders,
    faTableCellsLarge,
    faUser,
} from "@fortawesome/free-solid-svg-icons"

import { sealContent } from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import ThemeContext from "src/utilities/Context/ThemeContext"
import LayoutContext from "src/utilities/Context/LayoutContext"
import { toolConfig } from "src/constant/toolConfig"
import Icon from "src/utilities/Icon"

import "./style.scss"

export interface ISettingGroup {
    group: string
    children: string[]
}

export type SettingItem = string | ISettingGroup

type SlideDirection = "none" | "forward" | "backward"

export interface ISettingPanelProps {
    panelOpen: boolean
    onClosePanel: () => void
    openDurationModal?: () => void
    openUserDataModal?: () => void
    openObjectiveModal?: () => void
    openInputModal?: () => void
    iconRef: React.RefObject<HTMLDivElement | null>
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
    const { isTagTab, toggleTagTab } = useContext(LayoutContext)
    const [openGroup, setOpenGroup] = useState<string | null>(null)
    const [direction, setDirection] = useState<SlideDirection>("none")

    const panelMapping: IObject = useMemo(() => {
        return {
            display_group: {
                icon: faSliders,
                text: "顯示設定",
            },
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
            tag_tab: {
                icon: isTagTab ? faLayerGroup : faFile,
                text: `${isTagTab ? "分頁式" : "一頁式"}標籤`,
                callback: toggleTagTab,
            },
        }
    }, [
        theme,
        changeTheme,
        isTagTab,
        toggleTagTab,
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
        (e: MouseEvent) => {
            const path = e.composedPath()
            if (
                panelOpen &&
                !(ref.current && path.includes(ref.current)) &&
                !(iconRef.current && path.includes(iconRef.current))
            ) {
                onClosePanel()
            }
        },
        [iconRef, onClosePanel, panelOpen],
    )

    useEffect(() => {
        window.addEventListener("click", onClick)
        return () => {
            window.removeEventListener("click", onClick)
        }
    }, [onClick])

    useLayoutEffect(() => {
        if (panelOpen) {
            setOpenGroup(null)
            setDirection("none")
        }
    }, [panelOpen])

    const goToGroup = useCallback((group: string | null) => {
        setDirection(group ? "forward" : "backward")
        setOpenGroup(group)
    }, [])

    const toolSettings: SettingItem[] = useMemo(
        () =>
            (config?.toolId === "backpack-viewer"
                ? toolConfig[config.toolId]?.setting?.[backpackViewerPage]
                : toolConfig[config.toolId]?.setting) || [],
        [backpackViewerPage, config?.toolId],
    )

    const currentGroup = useMemo(
        () =>
            toolSettings.find(
                (item): item is ISettingGroup =>
                    typeof item !== "string" && item.group === openGroup,
            ),
        [openGroup, toolSettings],
    )

    const renderRow = useCallback(
        (
            key: string,
            id: string,
            onRowClick?: () => void,
            options?: {
                leading?: React.ReactNode
                trailing?: React.ReactNode
                text?: string
            },
        ) => {
            const toolSetting = panelMapping[id]
            if (!toolSetting) return null
            return (
                <div key={key} className='setting-panel' onClick={onRowClick}>
                    <div className='setting-panel-icon'>
                        {options?.leading ?? <Icon icon={toolSetting.icon} />}
                    </div>
                    <div className='setting-panel-desc'>
                        {options?.text ?? toolSetting.text}
                    </div>
                    {options?.trailing}
                </div>
            )
        },
        [panelMapping],
    )

    const renderItem = useCallback(
        (item: SettingItem) => {
            if (typeof item !== "string") {
                return renderRow(
                    item.group,
                    item.group,
                    () => goToGroup(item.group),
                    {
                        trailing: (
                            <div className='setting-panel-arrow'>
                                <Icon icon={faChevronRight} />
                            </div>
                        ),
                    },
                )
            }
            const toolSetting = panelMapping[item]
            return renderRow(
                item,
                item,
                toolSetting?.autoClose
                    ? () => {
                          onClosePanel()
                          toolSetting.callback?.()
                      }
                    : toolSetting?.callback,
            )
        },
        [goToGroup, onClosePanel, panelMapping, renderRow],
    )

    return (
        <div
            className={`setting-panel-row${panelOpen ? "" : " hide"}`}
            ref={ref}
        >
            <div
                key={currentGroup?.group ?? "root"}
                className={`setting-panel-list ${direction}`}
            >
                {currentGroup
                    ? [
                          ...currentGroup.children.map(renderItem),
                          renderRow(
                              "back",
                              currentGroup.group,
                              () => goToGroup(null),
                              {
                                  leading: <Icon icon={faChevronLeft} />,
                                  text: "返回",
                              },
                          ),
                      ]
                    : toolSettings.map(renderItem)}
            </div>
        </div>
    )
}

export default SettingPanel
