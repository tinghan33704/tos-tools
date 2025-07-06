import _ from "lodash"
import React, {
    useEffect,
    useState,
    useMemo,
    useCallback,
    useContext,
} from "react"
import { Col, Row } from "react-bootstrap"
import {
    faBackward,
    faCaretLeft,
    faCaretRight,
    faForward,
    faFilter,
} from "@fortawesome/free-solid-svg-icons"

import DataContext from "src/utilities/Context/DataContext"

import {
    attrTypeString,
    attrZhToEn,
    raceTypeString,
    raceZhToEn,
} from "src/constant/filterConstants"
import { checkKeyword, getMonsterById } from "src/utilities/utils"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"
import InventoryFilterModal from "src/shared/InventoryFilterModal"
import {
    orderByCategories,
    sortByCategories,
} from "src/shared/InventoryFilterModal/InventoryFilterModal"
import MonsterImage from "./MonsterImage"

import "./style.scss"

interface IInventoryProps {
    togglePopover: (e: React.MouseEvent) => void
    setPopoverContent: (content: React.ReactElement) => void
}

const PAGE_SIZE = 50

const Inventory: React.FC<IInventoryProps> = ({
    togglePopover,
    setPopoverContent,
}) => {
    const { playerData } = useContext(DataContext)

    const [cards, setCards] = useState<IObject[]>(playerData?.wholeData || [])
    const [filteredCards, setFilteredCards] = useState<IObject[]>(
        playerData?.wholeData || []
    )
    const [currentPage, setCurrentPage] = useState(0)
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
    const [filters, setFilters] = useState<IObject>({
        sortBy:
            localStorage.getItem("SORT_BY") || Object.keys(sortByCategories)[0],
        orderBy:
            localStorage.getItem("ORDER_BY") ||
            Object.keys(orderByCategories)[0],
    })

    const totalPage = useMemo(
        () => Math.ceil(filteredCards.length / PAGE_SIZE),
        [filteredCards]
    )

    useEffect(() => {
        setCards(
            playerData?.wholeData?.sort(
                (a: IObject, b: IObject) => b?.acquiredAt - a?.acquiredAt
            ) || []
        )
    }, [])

    useEffect(() => {
        if (currentPage >= totalPage) setCurrentPage(totalPage - 1)
    }, [currentPage, totalPage])

    useEffect(() => {
        const _cards = cards
            .filter((card) =>
                filters?.attribute?.length
                    ? filters?.attribute.includes(
                          getMonsterById(card?.id)?.attribute
                      )
                    : true
            )
            .filter((card) =>
                filters?.race?.length
                    ? filters?.race.includes(getMonsterById(card?.id)?.race)
                    : true
            )
            .filter((card) =>
                filters?.star?.length
                    ? filters?.star.includes(getMonsterById(card?.id)?.star)
                    : true
            )
            .filter((card) =>
                filters?.keyword?.length
                    ? checkKeyword(filters?.keyword).some(
                          (word) =>
                              getMonsterById(card?.id)?.name?.includes(word) ||
                              getMonsterById(card?.id)?.monsterTag.some(
                                  (tag: string) => tag?.includes(word)
                              )
                      )
                    : true
            )

        const { sortBy, orderBy } = filters
        const defaultSort = (a: any, b: any) => a.id - b.id
        setFilteredCards(
            _cards.sort((a: IObject, b: IObject) => {
                const monsterA = getMonsterById(a?.id)
                const monsterB = getMonsterById(b?.id)

                switch (sortBy) {
                    case "time":
                        return orderBy === "asc"
                            ? a?.acquiredAt - b?.acquiredAt || defaultSort(a, b)
                            : b?.acquiredAt - a?.acquiredAt || defaultSort(a, b)
                    case "id":
                        return orderBy === "asc" ? a?.id - b?.id : b?.id - a?.id
                    case "attr":
                        return orderBy === "asc"
                            ? attrTypeString.indexOf(monsterA?.attribute) -
                                  attrTypeString.indexOf(monsterB?.attribute) ||
                                  defaultSort(a, b)
                            : attrTypeString.indexOf(monsterB?.attribute) -
                                  attrTypeString.indexOf(monsterA?.attribute) ||
                                  defaultSort(a, b)
                    case "race":
                        return orderBy === "asc"
                            ? raceTypeString.indexOf(monsterA?.race) -
                                  raceTypeString.indexOf(monsterB?.race) ||
                                  defaultSort(a, b)
                            : raceTypeString.indexOf(monsterB?.race) -
                                  raceTypeString.indexOf(monsterA?.race) ||
                                  defaultSort(a, b)
                    case "level":
                        return orderBy === "asc"
                            ? a?.level - b?.level || defaultSort(a, b)
                            : b?.level - a?.level || defaultSort(a, b)
                    case "skill_level":
                        return orderBy === "asc"
                            ? a?.skillLevel - b?.skillLevel || defaultSort(a, b)
                            : b?.skillLevel - a?.skillLevel || defaultSort(a, b)
                    case "enhance_level":
                        return orderBy === "asc"
                            ? a?.enhanceLevel - b?.enhanceLevel ||
                                  defaultSort(a, b)
                            : b?.enhanceLevel - a?.enhanceLevel ||
                                  defaultSort(a, b)
                    case "star":
                        return orderBy === "asc"
                            ? monsterA?.star - monsterB?.star ||
                                  defaultSort(a, b)
                            : monsterB?.star - monsterA?.star ||
                                  defaultSort(a, b)
                    case "number":
                        return orderBy === "asc"
                            ? playerData?.info?.[a.id]?.number -
                                  playerData?.info?.[b.id]?.number ||
                                  defaultSort(a, b)
                            : playerData?.info?.[b.id]?.number -
                                  playerData?.info?.[a.id]?.number ||
                                  defaultSort(a, b)

                    default:
                        return orderBy === "asc"
                            ? a?.acquiredAt - b?.acquiredAt
                            : b?.acquiredAt - a?.acquiredAt
                }
            })
        )

        setCurrentPage(0)
    }, [cards, filters, playerData])

    const renderMonsterInfoPopover = useCallback((card: IObject) => {
        const monster = getMonsterById(card?.id)

        return (
            <div className='monster-info-popover'>
                <Row>
                    <Col xs={12} sm={4} className='monster-info'>
                        <Image
                            path={`icon/icon_${attrZhToEn[monster?.attribute]}`}
                        />
                        <Image
                            path={`icon/icon_${raceZhToEn[monster?.race]}`}
                        />
                        <Image path={`icon/icon_${monster?.star}`} />
                    </Col>
                    <Col
                        xs={12}
                        sm={8}
                        className={`monster-name monster-name-${
                            attrZhToEn[monster?.attribute]
                        }`}
                    >
                        {monster?.name}
                    </Col>
                </Row>
                <Row className='monster-stat-row'>
                    <Col xs={4} className='monster-stat-title'>
                        等級
                    </Col>
                    <Col xs={8} className='monster-stat-value'>
                        <div>
                            <span
                                className={`${
                                    card?.level >= monster?.maxLevel
                                        ? "full-value"
                                        : ""
                                }`}
                            >
                                {card?.level || 0}
                            </span>{" "}
                            / <span>{monster?.maxLevel || 0}</span>
                        </div>
                    </Col>
                </Row>
                <Row className='monster-stat-row'>
                    <Col xs={4} className='monster-stat-title'>
                        技能等級
                    </Col>
                    <Col xs={8} className='monster-stat-value'>
                        <div>
                            <span
                                className={`${
                                    card?.skillLevel >= monster?.maxSkill
                                        ? "full-value"
                                        : ""
                                }`}
                            >
                                {card?.skillLevel || 0}
                            </span>{" "}
                            / <span>{monster?.maxSkill || 0}</span>
                        </div>
                    </Col>
                </Row>
                {monster?.maxRefine ? (
                    <Row className='monster-stat-row'>
                        <Col xs={4} className='monster-stat-title'>
                            昇華
                        </Col>
                        <Col xs={8} className='monster-stat-value'>
                            <div>
                                <span
                                    className={`${
                                        card?.enhanceLevel >= monster?.maxRefine
                                            ? "full-value"
                                            : ""
                                    }`}
                                >
                                    {card?.enhanceLevel || 0}
                                </span>{" "}
                                / <span>{monster?.maxRefine || 0}</span>
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <></>
                )}
            </div>
        )
    }, [])

    const onClickImage = useCallback(
        (e: React.MouseEvent, card: IObject) => {
            togglePopover(e)
            setPopoverContent(renderMonsterInfoPopover(card))
        },
        [renderMonsterInfoPopover, setPopoverContent, togglePopover]
    )

    const movePage = useCallback(
        (offset: number) => {
            const newPage = currentPage + offset
            setCurrentPage(
                newPage >= totalPage - 1
                    ? totalPage - 1
                    : newPage < 0
                    ? 0
                    : newPage
            )
        },
        [currentPage, totalPage]
    )

    const renderFilter = useCallback(() => {
        return (
            <div className='filter-row'>
                <div
                    className='filter-btn'
                    onClick={() => setIsFilterModalOpen(true)}
                >
                    <Icon icon={faFilter} />
                </div>
                <div className='filter-icons'>
                    {"attribute" in filters &&
                        [...filters?.attribute]
                            .sort((a: string, b: string) => {
                                const arr = Object.keys(attrZhToEn)
                                return arr.indexOf(a) - arr.indexOf(b)
                            })
                            .map((attr: string) => (
                                <Image path={`icon/icon_${attrZhToEn[attr]}`} />
                            ))}
                    {"race" in filters &&
                        [...filters?.race]
                            .sort((a: string, b: string) => {
                                const arr = Object.keys(raceZhToEn)
                                return arr.indexOf(a) - arr.indexOf(b)
                            })
                            .map((race: string) => (
                                <Image path={`icon/icon_${raceZhToEn[race]}`} />
                            ))}
                    {"star" in filters &&
                        filters?.star
                            .sort((a: number, b: number) => a - b)
                            .map((star: number) => (
                                <Image path={`icon/icon_${star}`} />
                            ))}
                </div>
            </div>
        )
    }, [filters])

    const renderHeader = useCallback(() => {
        return (
            <div className='inventory-header'>
                <Row className='pagination'>
                    <Col xs={2} sm={2} md={1}>
                        {currentPage > 0 && (
                            <div
                                className='inventory-pagination left'
                                onClick={() => movePage(-10)}
                            >
                                <Icon icon={faBackward} />
                            </div>
                        )}
                    </Col>
                    <Col xs={8} sm={8} md={10} className='page-count'>
                        <div>
                            <span className='current-page'>
                                {currentPage + 1}
                            </span>{" "}
                            / {totalPage}
                        </div>
                    </Col>
                    <Col xs={2} sm={2} md={1}>
                        {currentPage < totalPage - 1 && (
                            <div
                                className='inventory-pagination right'
                                onClick={() => movePage(10)}
                            >
                                <Icon icon={faForward} />
                            </div>
                        )}
                    </Col>
                </Row>
                <Row className='filter-display'>
                    <Col xs={9}>{renderFilter()}</Col>
                    <Col xs={3} className='card-count'>
                        {filteredCards.length} 張卡片
                    </Col>
                </Row>
            </div>
        )
    }, [currentPage, filteredCards, movePage, renderFilter, totalPage])

    const renderCards = useCallback(() => {
        const itemInRow = window.innerWidth <= 768 ? 5 : 10

        const cardRow = _.chunk(
            filteredCards.slice(
                currentPage * PAGE_SIZE,
                (currentPage + 1) * PAGE_SIZE
            ),
            itemInRow
        )

        return (
            <Row className='inventory-row-shell'>
                <Col xs={2} sm={2} md={1}>
                    {currentPage > 0 && (
                        <div
                            className='inventory-pagination left'
                            onClick={() => movePage(-1)}
                        >
                            <Icon icon={faCaretLeft} />
                        </div>
                    )}
                </Col>
                <Col xs={8} sm={8} md={10}>
                    {cardRow.map((row) => {
                        if (row.length < itemInRow) {
                            row = [...row, ...new Array(itemInRow - row.length)]
                        }

                        return (
                            <Row className='inventory-row'>
                                {row.map((monster) => {
                                    return (
                                        <Col className='inventory-col'>
                                            {monster && (
                                                <MonsterImage
                                                    playerData={playerData}
                                                    cardData={monster}
                                                    id={monster?.id}
                                                    notInInventory={false}
                                                    onClick={(e) =>
                                                        onClickImage(e, monster)
                                                    }
                                                />
                                            )}
                                        </Col>
                                    )
                                })}
                            </Row>
                        )
                    })}
                </Col>
                <Col xs={2} sm={2} md={1}>
                    {currentPage < totalPage - 1 && (
                        <div
                            className='inventory-pagination right'
                            onClick={() => movePage(1)}
                        >
                            <Icon icon={faCaretRight} />
                        </div>
                    )}
                </Col>
            </Row>
        )
    }, [
        currentPage,
        filteredCards,
        movePage,
        onClickImage,
        playerData,
        totalPage,
    ])

    return (
        <>
            {renderHeader()}
            {renderCards()}
            <InventoryFilterModal
                open={isFilterModalOpen}
                filters={filters}
                onClose={(filters: IObject) => {
                    setIsFilterModalOpen(false)
                    setFilters(filters)
                    localStorage.setItem(
                        "SORT_BY",
                        filters?.sortBy || Object.keys(sortByCategories)[0]
                    )
                    localStorage.setItem(
                        "ORDER_BY",
                        filters?.orderBy || Object.keys(orderByCategories)[0]
                    )
                }}
            />
        </>
    )
}

export default Inventory
