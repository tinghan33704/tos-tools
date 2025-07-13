import React, { useRef, useState, useCallback } from "react"
import {
    Col,
    Dropdown,
    DropdownButton,
    Form,
    Modal,
    Row,
} from "react-bootstrap"
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons"

import {
    attrZhToEn,
    inputMaxLength,
    raceZhToEn,
} from "src/constant/filterConstants"
import Image from "src/utilities/Image"
import Icon from "src/utilities/Icon"

import "./style.scss"

export interface IInventoryFilterModalProps {
    open: boolean
    filters: IObject
    onClose: (filters: IObject) => void
}

export const sortByCategories: IObject = {
    time: "入手時間",
    id: "編號",
    attr: "屬性",
    race: "種族",
    level: "等級",
    skill_level: "技能等級",
    enhance_level: "昇華階數",
    star: "稀有度",
    number: "持有數量",
}

export const orderByCategories: IObject = {
    asc: "升序",
    desc: "降序",
}

const InventoryFilterModal: React.FC<IInventoryFilterModalProps> = (props) => {
    const { open, onClose, filters: _filters } = props
    const ref = useRef(null)

    const [filters, setFilters] = useState<IObject>(_filters)

    const onCloseModal = useCallback(() => {
        onClose(filters)
    }, [filters, onClose])

    const resetFilter = useCallback(() => {
        setFilters({
            sortBy: Object.keys(sortByCategories)[0],
            orderBy: Object.keys(orderByCategories)[0],
        })
    }, [])

    const onChangeFilter = useCallback(
        (type: string, value: string | number) => {
            const changed = !(type in filters)
                ? [value]
                : filters[type].includes(value)
                ? filters[type].filter(
                      (item: string | number) => item !== value
                  )
                : [...filters[type], value]
            setFilters({
                ...filters,
                [type]: changed,
            })
        },
        [filters]
    )

    const onInputKeyPress = useCallback((event: any) => {
        if (event?.key === "Enter") {
            // prevent pressing enter cause reload of page
            event.preventDefault()
        }
    }, [])

    const renderPanel = useCallback(() => {
        return (
            <>
                <Row>
                    <Col className='title' xs={12} sm={2}>
                        屬性
                    </Col>
                    <Col className='field' xs={12} sm={10}>
                        {Object.keys(attrZhToEn).map((attr) => (
                            <Image
                                path={`icon/icon_${attrZhToEn[attr]}`}
                                onClick={() =>
                                    onChangeFilter("attribute", attr)
                                }
                                style={{
                                    filter: `brightness(${
                                        filters?.attribute?.includes(attr)
                                            ? "100%"
                                            : "50%"
                                    })`,
                                }}
                            />
                        ))}
                    </Col>
                </Row>
                <Row>
                    <Col className='title' xs={12} sm={2}>
                        種族
                    </Col>
                    <Col className='field' xs={12} sm={10}>
                        {Object.keys(raceZhToEn).map((race) => (
                            <Image
                                path={`icon/icon_${raceZhToEn[race]}`}
                                onClick={() => onChangeFilter("race", race)}
                                style={{
                                    filter: `brightness(${
                                        filters?.race?.includes(race)
                                            ? "100%"
                                            : "50%"
                                    })`,
                                }}
                            />
                        ))}
                    </Col>
                </Row>
                <Row>
                    <Col className='title' xs={12} sm={2}>
                        稀有度
                    </Col>
                    <Col className='field' xs={12} sm={10}>
                        {[...Array(8).keys()].map((star) => (
                            <Image
                                path={`icon/icon_${star + 1}`}
                                onClick={() => onChangeFilter("star", star + 1)}
                                style={{
                                    filter: `brightness(${
                                        filters?.star?.includes(star + 1)
                                            ? "100%"
                                            : "50%"
                                    })`,
                                }}
                            />
                        ))}
                    </Col>
                </Row>
                <Row>
                    <Col className='title' xs={12} sm={2}>
                        名稱/標籤
                    </Col>
                    <Col className='field' xs={12} sm={10}>
                        <Form>
                            <Form.Group>
                                <Form.Control
                                    type='input'
                                    className='keyword-input'
                                    placeholder=''
                                    value={filters?.keyword || ""}
                                    maxLength={inputMaxLength}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            keyword: e.target.value,
                                        })
                                    }
                                    onKeyDown={onInputKeyPress}
                                />
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col className='title' xs={12} sm={2}>
                        排序
                    </Col>
                    <Col className='field' xs={6} sm={5}>
                        <DropdownButton
                            className='dropdown-selector'
                            title={
                                sortByCategories?.[filters?.sortBy] ||
                                Object.values(sortByCategories)[0]
                            }
                            onSelect={(value) => {
                                setFilters({
                                    ...filters,
                                    sortBy: value,
                                })
                            }}
                        >
                            <div>
                                {Object.keys(sortByCategories).map((title) => (
                                    <Dropdown.Item
                                        title={title}
                                        eventKey={title}
                                    >
                                        {sortByCategories[title]}
                                    </Dropdown.Item>
                                ))}
                            </div>
                        </DropdownButton>
                    </Col>
                    <Col className='field' xs={6} sm={5}>
                        <DropdownButton
                            className='dropdown-selector'
                            title={
                                orderByCategories?.[filters?.orderBy] ||
                                Object.values(orderByCategories)[0]
                            }
                            onSelect={(value) => {
                                setFilters({
                                    ...filters,
                                    orderBy: value,
                                })
                            }}
                        >
                            <div>
                                {Object.keys(orderByCategories).map((title) => (
                                    <Dropdown.Item
                                        title={title}
                                        eventKey={title}
                                    >
                                        {orderByCategories[title]}
                                    </Dropdown.Item>
                                ))}
                            </div>
                        </DropdownButton>
                    </Col>
                </Row>
            </>
        )
    }, [filters, onChangeFilter])

    return (
        <div ref={ref}>
            <Modal
                show={open}
                onHide={onCloseModal}
                dialogClassName='filter-modal'
                container={ref}
            >
                <Modal.Header closeButton>
                    <div className='reset-filters' onClick={resetFilter}>
                        <Icon icon={faRotateLeft} />
                        重置
                    </div>
                </Modal.Header>
                <Modal.Body>{renderPanel()}</Modal.Body>
            </Modal>
        </div>
    )
}

export default InventoryFilterModal
