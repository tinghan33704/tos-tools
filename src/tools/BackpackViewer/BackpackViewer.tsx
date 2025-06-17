import React, { useEffect, useState, useCallback, useContext } from "react"
import { Dropdown, DropdownButton } from "react-bootstrap"
import { faCaretDown } from "@fortawesome/free-solid-svg-icons"

import { sealContent, sealOpenPeriod } from "src/constant/filterConstants"

import {
    fetchPlayerData,
    getPlayerStoredData,
    getUrlParams,
} from "src/utilities/utils"
import { setFavIconAndTitle } from "src/utilities/toolSetting"
import DataContext from "src/utilities/Context/DataContext"
import { usePopover } from "src/hook/usePopover"
import { ContextProvider } from "src/utilities/Context/Context"
import Header from "../../shared/Header"
import PageContainer from "src/shared/PageContainer"
import UserDataModal from "src/shared/UserDataModal"
import Icon from "src/utilities/Icon"
import SeriesRow from "./component/SeriesRow"
import Inventory from "./component/Inventory"

interface IBackpackViewerProps {}

const cardCategories = ["all", "non-crossover", "crossover"]
const sortTypes = ["default", "by-number"]
const availablePages = Object.keys(sealContent).filter(
    (page) =>
        !sealOpenPeriod?.[page] ||
        (new Date().getTime() >=
            new Date(sealOpenPeriod?.[page]?.start).getTime() &&
            new Date().getTime() <=
                new Date(sealOpenPeriod?.[page]?.emd).getTime())
)

const BackpackViewer: React.FC<IBackpackViewerProps> = () => {
    const dataContext = useContext(DataContext)
    const { playerData, setPlayerData } = dataContext

    const [currentTab, setCurrentTab] = useState<string>(availablePages[0])
    const [currentCardCategory, setCurrentCardCategory] =
        useState<string>("all")
    const [currentSort, setCurrentSort] = useState<string>("default")
    const [userDataModalOpen, setUserDataModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isAfterInitLoad, setIsAfterInitLoad] = useState(false)

    const { Popover, togglePopover, setPopoverContent } = usePopover()

    useEffect(() => {
        setFavIconAndTitle("backpack-viewer")
        getInitData()
        setInitPage()
    }, [])

    useEffect(() => {
        if (isAfterInitLoad && !playerData?.uid) {
            openUserDataModal()
        }
    }, [isAfterInitLoad, currentTab])

    const setInitPage = useCallback(() => {
        const _page = localStorage?.getItem("CURRENT_PAGE") || ""
        const page = availablePages.includes(_page) ? _page : availablePages[0]

        setCurrentTab(page)
        localStorage.setItem("CURRENT_PAGE", page)
    }, [])

    const openUserDataModal = useCallback(() => {
        setUserDataModalOpen(true)
    }, [])

    const getInitData = useCallback(async () => {
        const params: IObject = getUrlParams()
        if (params?.uid) {
            setIsLoading(true)
            try {
                const data = await fetchPlayerData(params?.uid, "", "import")

                if (data) setPlayerData(data)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
                setIsAfterInitLoad(true)
            }
        } else if (!getPlayerStoredData()?.uid && !params?.uid) {
            openUserDataModal()
            setIsAfterInitLoad(true)
        }
    }, [openUserDataModal, setPlayerData])

    const renderSeriesSelector = useCallback(() => {
        return (
            <DropdownButton
                className='series-selector'
                title={
                    <>
                        <Icon icon={faCaretDown} />
                        {currentTab}
                        <Icon icon={faCaretDown} />
                    </>
                }
                onSelect={(value) => {
                    setCurrentTab(value as string)
                    localStorage.setItem("CURRENT_PAGE", value as string)
                }}
            >
                <div className='series-selector-options'>
                    {availablePages.map((title) => (
                        <Dropdown.Item
                            className={`series-selector-option${
                                currentTab === title ? " current" : ""
                            }`}
                            title={title}
                            eventKey={title}
                        >
                            {title}
                        </Dropdown.Item>
                    ))}
                </div>
            </DropdownButton>
        )
    }, [currentTab])

    return (
        <ContextProvider
            toolId='backpack-viewer'
            sort={currentSort}
            category={currentCardCategory}
            toggleSort={() =>
                setCurrentSort(
                    sortTypes[
                        (sortTypes.indexOf(currentSort) + 1) % sortTypes.length
                    ]
                )
            }
            toggleCategory={() =>
                setCurrentCardCategory(
                    cardCategories[
                        (cardCategories.indexOf(currentCardCategory) + 1) %
                            cardCategories.length
                    ]
                )
            }
        >
            <Header />
            <PageContainer
                openUserDataModal={openUserDataModal}
                backpackViewerPage={currentTab}
            >
                {isLoading ? (
                    <div
                        className='loading'
                        style={{
                            height: `${
                                window.innerHeight -
                                document
                                    .getElementsByClassName("tool-header")[0]
                                    ?.getBoundingClientRect()?.height -
                                60
                            }px`,
                        }}
                    >
                        載入資料中...
                    </div>
                ) : (
                    <>
                        {renderSeriesSelector()}
                        {currentTab === "完整背包" ? (
                            <Inventory
                                togglePopover={togglePopover}
                                setPopoverContent={setPopoverContent}
                            />
                        ) : (
                            <SeriesRow
                                tab={currentTab}
                                cardCategory={currentCardCategory}
                                sortBy={currentSort}
                                togglePopover={togglePopover}
                                setPopoverContent={setPopoverContent}
                            />
                        )}
                    </>
                )}
            </PageContainer>
            <UserDataModal
                open={userDataModalOpen}
                onClose={() => setUserDataModalOpen(false)}
            />
            <Popover />
        </ContextProvider>
    )
}

export default BackpackViewer
