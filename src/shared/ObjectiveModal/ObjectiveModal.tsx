import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons"
import React, { useCallback, useContext, useRef } from "react"
import {
    Accordion,
    AccordionContext,
    Col,
    Modal,
    Row,
    useAccordionButton,
} from "react-bootstrap"

import {
    attr_type_string,
    leader_skill_function_string,
    leader_skill_limit_string,
    leader_skill_object_string,
    leader_skill_type_no_object,
    race_type_string,
} from "src/constant/filterConstants"
import Context from "src/utilities/Context/Context"
import Icon from "src/utilities/Icon"
import FilterButton from "../FilterRow/FilterButton"

import "./style.scss"

export interface IObjectiveModalProps {
    open: boolean
    onClose: () => void
    objectiveObj: IObject
    toggleObjective: (
        func: string,
        attribute: string,
        race: string,
        all?: boolean
    ) => void
    activateObj: IObject
    toggleActivate: (func: string, activate: string) => void
}

interface ICollapseHeaderProps {
    text: string
    eventKey: string
}

const CollapseHeader: React.FC<ICollapseHeaderProps> = ({ text, eventKey }) => {
    const { activeEventKey } = useContext(AccordionContext)
    const onClick = useAccordionButton(eventKey, () => {})
    const isOpen = activeEventKey === eventKey

    const icon = <Icon icon={isOpen ? faCaretUp : faCaretDown} />

    return (
        <div className={"collapse-header"} onClick={onClick}>
            {icon}
            {text}
            {icon}
        </div>
    )
}

const ObjectiveModal: React.FC<IObjectiveModalProps> = (props) => {
    const {
        open,
        onClose,
        objectiveObj,
        toggleObjective,
        activateObj,
        toggleActivate,
    } = props
    const ref = useRef(null)
    const { functions } = useContext(Context)

    const attrTypeString = attr_type_string
    const raceTypeString = race_type_string.slice(0, 7).map((str) => str[0])

    const renderOptionRows = useCallback(() => {
        const selectedFunctions = leader_skill_function_string
            .flat()
            .filter((skill_function: string) => {
                return (functions as string[]).includes(skill_function)
            })

        return selectedFunctions.map((func, func_index) => (
            <>
                <Row className='option-row' key={`option-row-${func_index}`}>
                    <Col xs={12} md={12} lg={4} className='option-text'>
                        {func}
                    </Col>
                    <Col xs={12} md={12} lg={8}>
                        <Row>
                            {!leader_skill_type_no_object.includes(func) && (
                                <Col
                                    xs={12}
                                    md={12}
                                    lg={12}
                                    className='objective-row'
                                >
                                    <Accordion defaultActiveKey=''>
                                        <Accordion.Item
                                            eventKey={`${func_index}-0`}
                                        >
                                            <Accordion.Header>
                                                <CollapseHeader
                                                    text={"作用對象"}
                                                    eventKey={`${func_index}-0`}
                                                />
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Row>
                                                    {[
                                                        " ",
                                                        ...attrTypeString,
                                                    ].map((attr) => (
                                                        <Col
                                                            className='objective-text'
                                                            xs={2}
                                                            onClick={(e) =>
                                                                attr !== " "
                                                                    ? toggleObjective(
                                                                          func,
                                                                          attr,
                                                                          "",
                                                                          true
                                                                      )
                                                                    : null
                                                            }
                                                        >
                                                            {attr}
                                                        </Col>
                                                    ))}
                                                </Row>
                                                {raceTypeString.map(
                                                    (race, race_index) => (
                                                        <Row>
                                                            <Col
                                                                className='objective-text'
                                                                xs={2}
                                                                onClick={(e) =>
                                                                    toggleObjective(
                                                                        func,
                                                                        "",
                                                                        race,
                                                                        true
                                                                    )
                                                                }
                                                            >
                                                                {race}
                                                            </Col>
                                                            {attrTypeString.map(
                                                                (
                                                                    attr,
                                                                    attr_index
                                                                ) => {
                                                                    const index =
                                                                        (attrTypeString.length *
                                                                            raceTypeString.length +
                                                                            leader_skill_object_string.length) *
                                                                            func_index +
                                                                        race_index *
                                                                            attrTypeString.length +
                                                                        attr_index

                                                                    return (
                                                                        <FilterButton
                                                                            group='objective'
                                                                            index={
                                                                                index
                                                                            }
                                                                            text={`　`}
                                                                            checked={
                                                                                !!objectiveObj?.[
                                                                                    func
                                                                                ]?.includes(
                                                                                    `${attr}${race}`
                                                                                )
                                                                            }
                                                                            callback={(
                                                                                e
                                                                            ) =>
                                                                                toggleObjective(
                                                                                    func,
                                                                                    attr,
                                                                                    race
                                                                                )
                                                                            }
                                                                            size={{
                                                                                xs: 2,
                                                                                md: 2,
                                                                                lg: 2,
                                                                            }}
                                                                            key={`objective-${index}`}
                                                                        />
                                                                    )
                                                                }
                                                            )}
                                                        </Row>
                                                    )
                                                )}
                                                <Row className='mt-4'>
                                                    {leader_skill_object_string.map(
                                                        (
                                                            object,
                                                            object_index
                                                        ) => {
                                                            const index =
                                                                (attrTypeString.length *
                                                                    raceTypeString.length +
                                                                    leader_skill_object_string.length) *
                                                                    func_index +
                                                                attrTypeString.length *
                                                                    raceTypeString.length +
                                                                object_index
                                                            return (
                                                                <>
                                                                    <Col
                                                                        className='objective-text'
                                                                        xs={2}
                                                                    >
                                                                        {object}
                                                                    </Col>
                                                                    <FilterButton
                                                                        group='objective'
                                                                        index={
                                                                            index
                                                                        }
                                                                        text={`　`}
                                                                        checked={
                                                                            !!objectiveObj?.[
                                                                                func
                                                                            ]?.includes(
                                                                                `${object}`
                                                                            )
                                                                        }
                                                                        callback={(
                                                                            e
                                                                        ) =>
                                                                            toggleObjective(
                                                                                func,
                                                                                object,
                                                                                ""
                                                                            )
                                                                        }
                                                                        size={{
                                                                            xs: 2,
                                                                            md: 2,
                                                                            lg: 2,
                                                                        }}
                                                                        key={`objective-${index}`}
                                                                    />
                                                                </>
                                                            )
                                                        }
                                                    )}
                                                </Row>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Col>
                            )}
                            <Col
                                xs={12}
                                md={12}
                                lg={12}
                                className='activate-row'
                            >
                                <Accordion defaultActiveKey=''>
                                    <Accordion.Item
                                        eventKey={`${func_index}-1`}
                                    >
                                        <Accordion.Header>
                                            <CollapseHeader
                                                text={"發動條件"}
                                                eventKey={`${func_index}-1`}
                                            />
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Row>
                                                {leader_skill_limit_string.map(
                                                    (option, option_index) => (
                                                        <FilterButton
                                                            group='activate'
                                                            index={
                                                                func_index *
                                                                    leader_skill_limit_string.length +
                                                                option_index
                                                            }
                                                            text={option}
                                                            checked={
                                                                !!activateObj?.[
                                                                    func
                                                                ]?.includes(
                                                                    option
                                                                )
                                                            }
                                                            callback={(e) =>
                                                                toggleActivate(
                                                                    func,
                                                                    option
                                                                )
                                                            }
                                                            size={{
                                                                xs: 6,
                                                                md: 4,
                                                                lg: 4,
                                                            }}
                                                            key={`activate-${
                                                                func_index *
                                                                    leader_skill_limit_string.length +
                                                                option_index
                                                            }`}
                                                        />
                                                    )
                                                )}
                                            </Row>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </>
        ))
    }, [
        activateObj,
        attrTypeString,
        functions,
        objectiveObj,
        raceTypeString,
        toggleActivate,
        toggleObjective,
    ])

    return (
        <div ref={ref}>
            <Modal
                show={open}
                onHide={onClose}
                dialogClassName='option-modal'
                container={ref}
            >
                <Modal.Header closeButton closeVariant={"white"} />
                <Modal.Body>{renderOptionRows()}</Modal.Body>
            </Modal>
        </div>
    )
}

export default ObjectiveModal
